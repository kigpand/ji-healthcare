import type { CoachRequest, WorkoutProfile } from "@/interface/coach";
import type { IRoutineInfo } from "@/interface/routine";
import { parseApiRecommendation } from "@/service/coachService";
import {
  sanitizeCoachRequest,
  validateModelRecommendation,
} from "@/worker/src/coach";

const profile: WorkoutProfile = {
  goal: "체력 유지",
  environment: "홈트",
  minutes: 30,
  equipment: "없음",
};

const routine: IRoutineInfo = {
  id: 7,
  title: "전신 루틴",
  category: "전신",
  categoryId: 1,
  createdAt: "2026-09-01T00:00:00.000Z",
  routine: [{ title: "스쿼트", set: 3, kg: 0 }],
};

const request: CoachRequest = {
  profile,
  period: {
    start: "2026-09-21T00:00:00.000Z",
    end: "2026-09-25T00:00:00.000Z",
    timeZone: "Asia/Seoul",
  },
  records: [],
  routines: [routine],
  categories: [{ id: "1", name: "전신" }],
  summary: { workoutCount: 0, workoutDays: 0 },
  limitations: ["회복 상태 정보가 없습니다."],
};

test("Worker 입력은 허용한 운동 데이터만 정규화한다", () => {
  expect(sanitizeCoachRequest({ ...request, ignored: "remove-me" })).toEqual(request);
});

test("Worker는 입력에 실제 존재하는 기존 루틴만 허용한다", () => {
  expect(
    validateModelRecommendation(
      { kind: "existing", routineId: 7, draft: null, reason: "오늘 조건에 맞습니다." },
      request
    )
  ).toEqual({ kind: "existing", routineId: 7, reason: "오늘 조건에 맞습니다." });

  expect(() =>
    validateModelRecommendation(
      { kind: "existing", routineId: 999, draft: null, reason: "추천" },
      request
    )
  ).toThrow("존재하지 않는 루틴");
});

test("앱은 기존 루틴 ID를 로컬 루틴 객체로 치환한다", () => {
  expect(
    parseApiRecommendation(
      { recommendation: { kind: "existing", routineId: 7, reason: "추천 이유" } },
      request
    )
  ).toEqual({ kind: "existing", routine, reason: "추천 이유" });
});

test("새 루틴의 세트와 무게 범위를 서버와 앱에서 검증한다", () => {
  const recommendation = {
    kind: "new",
    routineId: null,
    reason: "새 구성이 적합합니다.",
    draft: {
      title: "가벼운 전신",
      routine: [{ title: "런지", set: 2, kg: 0 }],
    },
  };

  expect(validateModelRecommendation(recommendation, request).kind).toBe("new");
  expect(parseApiRecommendation({ recommendation }, request).kind).toBe("new");
  expect(() =>
    parseApiRecommendation(
      {
        recommendation: {
          ...recommendation,
          draft: { ...recommendation.draft, routine: [{ title: "런지", set: 0, kg: 0 }] },
        },
      },
      request
    )
  ).toThrow("운동 항목 형식");
});
