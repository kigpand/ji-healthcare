import type {
  CoachApiRecommendation,
  CoachRequest,
  CoachResult,
} from "@/interface/coach";

const REQUEST_TIMEOUT_MS = 20_000;

export async function getCoachRecommendation(
  request: CoachRequest
): Promise<CoachResult> {
  const baseUrl = process.env.EXPO_PUBLIC_AI_COACH_URL?.replace(/\/$/, "");
  const accessToken = process.env.EXPO_PUBLIC_AI_COACH_ACCESS_TOKEN;

  if (!baseUrl || !accessToken) {
    throw new Error("AI 코치 연결 설정이 필요합니다.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/v1/coach/recommendation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getApiErrorMessage(payload, response.status));
    }

    const recommendation = parseApiRecommendation(payload, request);
    return { source: "openai", request, recommendation };
  } catch (cause) {
    if (cause instanceof Error && cause.name === "AbortError") {
      throw new Error("AI 추천 요청 시간이 초과되었습니다. 다시 시도해주세요.");
    }
    throw cause;
  } finally {
    clearTimeout(timeout);
  }
}

export function parseApiRecommendation(
  payload: unknown,
  request: CoachRequest
): CoachResult["recommendation"] {
  const container = asObject(payload);
  const recommendation = asObject(container?.recommendation);
  const kind = recommendation?.kind;
  const reason = getNonEmptyString(recommendation?.reason);

  if (!reason) {
    throw new Error("AI 추천 응답을 확인하지 못했습니다.");
  }

  if (kind === "existing") {
    const routineId = recommendation?.routineId;
    const routine = request.routines.find((item) => item.id === routineId);
    if (!routine) {
      throw new Error("AI가 존재하지 않는 루틴을 추천했습니다.");
    }
    return { kind, routine, reason };
  }

  if (kind === "new") {
    const draft = asObject(recommendation?.draft);
    const title = getNonEmptyString(draft?.title);
    const routine = Array.isArray(draft?.routine)
      ? draft.routine.map(parseRoutineItem)
      : [];

    if (!title || routine.length === 0 || routine.length > 20) {
      throw new Error("AI가 생성한 새 루틴 형식이 올바르지 않습니다.");
    }
    return { kind, draft: { title, routine }, reason };
  }

  if (kind === "rest") {
    return { kind, reason };
  }

  throw new Error("AI 추천 응답을 확인하지 못했습니다.");
}

function parseRoutineItem(value: unknown) {
  const item = asObject(value);
  const title = getNonEmptyString(item?.title);
  const set = item?.set;
  const kg = item?.kg;

  if (
    !title ||
    !Number.isInteger(set) ||
    (set as number) < 1 ||
    (set as number) > 20 ||
    typeof kg !== "number" ||
    !Number.isFinite(kg) ||
    kg < 0 ||
    kg > 1000
  ) {
    throw new Error("AI가 생성한 운동 항목 형식이 올바르지 않습니다.");
  }

  return { title, set: set as number, kg };
}

function getApiErrorMessage(payload: unknown, status: number) {
  const message = getNonEmptyString(asObject(payload)?.error);
  if (message) return message;
  if (status === 401) return "AI 코치 인증에 실패했습니다.";
  if (status === 429) return "AI 추천 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  return "AI 추천을 받지 못했습니다. 잠시 후 다시 시도해주세요.";
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}
