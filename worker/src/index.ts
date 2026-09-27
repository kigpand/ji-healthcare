/// <reference types="@cloudflare/workers-types" />

import {
  coachInstructions,
  recommendationSchema,
  sanitizeCoachRequest,
  validateModelRecommendation,
} from "./coach";

type Env = {
  OPENAI_API_KEY: string;
  APP_ACCESS_TOKEN: string;
  OPENAI_MODEL: string;
  AI_RATE_LIMITER: RateLimit;
};

const MAX_REQUEST_BYTES = 128 * 1024;
const RESPONSE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: RESPONSE_HEADERS });
    }

    if (url.pathname !== "/v1/coach/recommendation" || request.method !== "POST") {
      return json({ error: "요청 경로를 찾을 수 없습니다." }, 404);
    }

    if (request.headers.get("Authorization") !== `Bearer ${env.APP_ACCESS_TOKEN}`) {
      return json({ error: "인증에 실패했습니다." }, 401);
    }

    const { success } = await env.AI_RATE_LIMITER.limit({ key: "personal-coach" });
    if (!success) {
      return json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }, 429);
    }

    const contentLength = Number(request.headers.get("Content-Length") ?? 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return json({ error: "요청 데이터가 너무 큽니다." }, 413);
    }

    try {
      const body = await request.text();
      if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
        return json({ error: "요청 데이터가 너무 큽니다." }, 413);
      }

      let parsedBody: unknown;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        return json({ error: "요청 형식이 올바르지 않습니다." }, 400);
      }

      let coachRequest;
      try {
        coachRequest = sanitizeCoachRequest(parsedBody);
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "요청 형식이 올바르지 않습니다.";
        return json({ error: message }, 400);
      }
      const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL,
          store: false,
          max_output_tokens: 1_000,
          reasoning: { effort: "low" },
          input: [
            { role: "developer", content: coachInstructions },
            { role: "user", content: JSON.stringify(coachRequest) },
          ],
          text: {
            verbosity: "low",
            format: {
              type: "json_schema",
              name: "workout_recommendation",
              strict: true,
              schema: recommendationSchema,
            },
          },
        }),
      });

      if (!openAIResponse.ok) {
        console.error(
          "OpenAI request failed",
          openAIResponse.status,
          openAIResponse.headers.get("x-request-id")
        );
        return json({ error: "AI 추천 서비스가 응답하지 않았습니다." }, 502);
      }

      const openAIResult: unknown = await openAIResponse.json();
      const outputText = extractOutputText(openAIResult);
      let parsedRecommendation: unknown;
      try {
        parsedRecommendation = JSON.parse(outputText);
      } catch {
        throw new Error("OpenAI 응답 형식을 확인하지 못했습니다.");
      }
      const recommendation = validateModelRecommendation(parsedRecommendation, coachRequest);

      return json({ recommendation }, 200);
    } catch (cause) {
      console.error("Coach request failed", cause);
      return json({ error: "AI 추천을 처리하지 못했습니다." }, 502);
    }
  },
} satisfies ExportedHandler<Env>;

function extractOutputText(value: unknown) {
  const response = asObject(value);
  if (typeof response?.output_text === "string" && response.output_text.length > 0) {
    return response.output_text;
  }

  if (Array.isArray(response?.output)) {
    for (const output of response.output) {
      const message = asObject(output);
      if (!Array.isArray(message?.content)) continue;
      for (const content of message.content) {
        const item = asObject(content);
        if (item?.type === "output_text" && typeof item.text === "string") {
          return item.text;
        }
      }
    }
  }

  throw new Error("OpenAI 응답에 결과가 없습니다.");
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: RESPONSE_HEADERS });
}
