import type { CoachRequest, WorkoutProfile } from "@/interface/coach";
import type { ICategory } from "@/interface/category";
import type { IRecord } from "@/interface/record";
import type { IRoutineInfo } from "@/interface/routine";
import { validateWorkoutProfile } from "@/schema/workoutProfile.schema";
import { getStartOfLocalDayTimestamp } from "@/utils/date";

export function buildCoachRequest(
  profile: WorkoutProfile,
  records: IRecord[],
  routines: IRoutineInfo[],
  categories: ICategory[],
  now = new Date()
): CoachRequest {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  const weeklyRecords = records.filter((record) => {
    const timestamp = new Date(record.date).getTime();
    return timestamp >= start.getTime() && timestamp <= now.getTime();
  });
  return {
    profile: validateWorkoutProfile(profile),
    period: { start: start.toISOString(), end: now.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    records: weeklyRecords,
    routines,
    categories,
    summary: {
      workoutCount: weeklyRecords.length,
      workoutDays: new Set(weeklyRecords.map((record) => getStartOfLocalDayTimestamp(new Date(record.date)))).size,
    },
    limitations: [
      "기록에는 완료한 루틴과 날짜만 있습니다. 운동 당시의 실제 세트·무게·반복 횟수는 없습니다.",
      "루틴 목록은 현재 구성입니다. 과거 수행 당시 구성으로 간주하지 마세요.",
      "회복 상태나 통증 정보는 수집하지 않았습니다.",
    ],
  };
}
