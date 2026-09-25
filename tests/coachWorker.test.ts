/** @jest-environment node */

import worker from "@/worker/src/index";
import type { CoachRequest } from "@/interface/coach";

const requestBody: CoachRequest = {
  profile: {
    goal: "체력 유지",
    environment: "홈트",
    minutes: 30,
    equipment: "없음",
  },
  period: {
    start: "2026-09-21T00:00:00.000Z",
    end: "2026-09-25T00:00:00.000Z",
    timeZone: "Asia/Seoul",
  },
  records: [],
  routines: [
    {
      id: 7,
      title: "전신 루틴",
      category: "전신",
      categoryId: 1,
      createdAt: "2026-09-01T00:00:00.000Z",
      routine: [{ title: "스쿼트", set: 3, kg: 0 }],
    },
  ],
  categories: [{ id: "1", name: "전신" }],
  summary: { workoutCount: 0, workoutDays: 0 },
  limitations: ["회복 상태 정보가 없습니다."],
};

const env = {
  OPENAI_API_KEY: "test-openai-key",
  APP_ACCESS_TOKEN: "test-access-token",
  OPENAI_MODEL: "gpt-5.6-terra",
  AI_RATE_LIMITER: { limit: jest.fn().mockResolvedValue({ success: true }) },
};

afterEach(() => {
  jest.restoreAllMocks();
});

function callWorker(body: string, token = "test-access-token") {
  const request = new Request("https://worker.test/v1/coach/recommendation", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  }) as unknown as Parameters<typeof worker.fetch>[0];

  return worker.fetch(
    request,
    env as never
  );
}

test("Worker는 잘못된 개인 접근 토큰을 OpenAI 호출 전에 거부한다", async () => {
  const openAIFetch = jest.spyOn(globalThis, "fetch");
  const response = await callWorker(JSON.stringify(requestBody), "wrong-token");

  expect(response.status).toBe(401);
  expect(openAIFetch).not.toHaveBeenCalled();
});

test("Worker는 구조화된 OpenAI 추천만 앱 응답으로 반환한다", async () => {
  jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        output_text: JSON.stringify({
          kind: "existing",
          reason: "오늘 조건에 맞는 기존 루틴입니다.",
          routineId: 7,
          draft: null,
        }),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  );

  const response = await callWorker(JSON.stringify(requestBody));
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({
    recommendation: {
      kind: "existing",
      routineId: 7,
      reason: "오늘 조건에 맞는 기존 루틴입니다.",
    },
  });
});

test("Worker는 손상된 요청과 AI 응답을 성공으로 처리하지 않는다", async () => {
  jest.spyOn(console, "error").mockImplementation(() => undefined);
  expect((await callWorker("not-json")).status).toBe(400);

  jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({ output_text: "not-json" }), { status: 200 })
  );
  expect((await callWorker(JSON.stringify(requestBody))).status).toBe(502);
});
