import { WORKOUT_ENVIRONMENTS, WORKOUT_GOALS, type WorkoutProfile } from "@/interface/coach";

export function validateWorkoutProfile(input: WorkoutProfile): WorkoutProfile {
  if (!WORKOUT_GOALS.includes(input.goal)) throw new Error("운동 목표를 선택해주세요.");
  if (!WORKOUT_ENVIRONMENTS.includes(input.environment)) throw new Error("운동 장소를 선택해주세요.");
  if (!Number.isInteger(input.minutes) || input.minutes < 5 || input.minutes > 180) {
    throw new Error("운동 시간은 5~180분 사이 정수로 입력해주세요.");
  }
  const equipment = input.equipment.trim();
  if (!equipment || equipment.length > 300) {
    throw new Error("사용할 장비를 300자 이내로 입력해주세요. 없으면 '없음'을 입력해주세요.");
  }
  return { goal: input.goal, environment: input.environment, minutes: input.minutes, equipment };
}
