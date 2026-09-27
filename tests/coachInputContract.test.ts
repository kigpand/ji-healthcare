import type { WorkoutProfile } from "@/interface/coach";
import { validateCategoryRequestInput } from "@/schema/category.schema";
import { validateRoutineRequestInput } from "@/schema/routine.schema";
import { parseApiRecommendation } from "@/service/coachService";
import { buildCoachRequest } from "@/utils/coach";
import { sanitizeCoachRequest, validateModelRecommendation } from "@/worker/src/coach";

const profile: WorkoutProfile = {
  goal: "체력 유지", environment: "헬스장", minutes: 30, equipment: "덤벨",
};
const now = new Date("2026-09-25T03:00:00.000Z");
const item = { title: "스쿼트", set: 3, kg: 2.5 };

function requestFor(title = "하체", routine = [item], category = "운동") {
  const validatedCategory = validateCategoryRequestInput({ category });
  const validatedRoutine = validateRoutineRequestInput({ title, categoryId: 1, routine });
  expect(validatedCategory.success).toBe(true);
  expect(validatedRoutine.success).toBe(true);
  if (!validatedRoutine.success || !validatedCategory.success) throw new Error("앱 입력 검증 실패");
  return buildCoachRequest(profile, [{
    id: 1, _id: "1", routineId: 1, title: validatedRoutine.data.title,
    category: validatedCategory.data.category, date: now.toISOString(),
  }], [{
    ...validatedRoutine.data, id: 1, category: validatedCategory.data.category,
    createdAt: now.toISOString(),
  }], [{ id: "1", name: validatedCategory.data.category }], now);
}

test.each([
  ["21세트", "하체", [{ ...item, set: 21 }], "운동"],
  ["1000 초과 무게", "하체", [{ ...item, kg: 1000.5 }], "운동"],
  ["긴 루틴 이름과 기록 이름", "루".repeat(81), [item], "운동"],
  ["긴 운동 이름", "하체", [{ ...item, title: "운".repeat(81) }], "운동"],
  ["긴 카테고리 이름", "하체", [item], "카".repeat(81)],
  ["31개 운동 항목", "하체", Array.from({ length: 31 }, () => ({ ...item })), "운동"],
] as const)("앱에서 저장 가능한 %s를 AI 분석 요청에서도 그대로 허용한다", (_, title, items, category) => {
  const request = requestFor(title, [...items], category);
  const original = JSON.stringify(request);
  const sanitized = sanitizeCoachRequest(JSON.parse(original));
  expect(sanitized).toEqual(JSON.parse(original));
  expect(JSON.stringify(request)).toBe(original);
  const recommendation = validateModelRecommendation({ kind: "existing", routineId: 1, reason: "추천" }, sanitized);
  expect(parseApiRecommendation({ recommendation }, request)).toEqual({
    kind: "existing", routine: request.routines[0], reason: "추천",
  });
});

test.each([
  { ...item, set: 0 },
  { ...item, set: 1.5 },
  { ...item, set: "3" },
  { ...item, kg: -1 },
  { ...item, kg: Infinity },
  { ...item, title: " " },
])("분석 입력에서도 잘못된 운동 항목 %p를 거부한다", (invalid) => {
  const request = requestFor();
  expect(() => sanitizeCoachRequest({
    ...request, routines: [{ ...request.routines[0], routine: [invalid] }],
  })).toThrow();
});

test.each([
  [{ ...item, set: 21 }],
  [{ ...item, kg: 1000.5 }],
  Array.from({ length: 21 }, () => ({ ...item })),
])("AI가 생성한 새 루틴의 수치·개수 제한은 유지한다 (%p)", (first, ...rest) => {
  const recommendation = {
    kind: "new", reason: "추천", draft: { title: "새 루틴", routine: [first, ...rest] },
  };
  const request = requestFor();
  expect(() => validateModelRecommendation(recommendation, request)).toThrow();
  expect(() => parseApiRecommendation({ recommendation }, request)).toThrow();
});
