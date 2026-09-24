import type { CoachRequest, CoachResult } from "@/interface/coach";

// 연결 전 UI 흐름을 검증하기 위한 명시적 시나리오. 적합성 판단이나 AI 호출을 하지 않는다.
export function getMockCoachRecommendation(
  request: CoachRequest,
  scenario: "existing" | "new" | "rest"
): CoachResult {
  if (scenario === "existing") {
    const routine = request.routines.find((item) => item.routine.length > 0);
    if (!routine) throw new Error("미리 볼 기존 루틴이 없습니다. 새 루틴 시나리오를 선택해주세요.");
    return { source: "mock", request, recommendation: {
      kind: "existing", routine,
      reason: "화면 확인을 위해 첫 번째 루틴을 표시했습니다. 실제 AI의 적합성 판단은 아직 연결되지 않았습니다.",
    } };
  }
  if (scenario === "rest") {
    return { source: "mock", request, recommendation: {
      kind: "rest", reason: "휴식 제안 화면을 확인하는 예시입니다. 실제 회복 상태를 분석한 결과가 아닙니다.",
    } };
  }
  return { source: "mock", request, recommendation: {
    kind: "new",
    reason: "기존 루틴이 적합하지 않을 때의 등록 흐름을 확인하는 고정 예시입니다. 저장한 설정에 맞춘 실제 운동 처방이 아닙니다.",
    draft: { title: "새 루틴 예시", routine: [
      { title: "맨몸 스쿼트", set: 2, kg: 0 },
    ] },
  } };
}
