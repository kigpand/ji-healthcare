import {
  COACH_REQUEST_LIMITS,
  type CoachRequest,
  type WorkoutProfile,
} from "@/interface/coach";
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
  const requestRecords = weeklyRecords
    .slice(0, COACH_REQUEST_LIMITS.records)
    .map((record) => ({
      ...record,
      routineId: record.routineId > 0 ? record.routineId : null,
    }));
  const requestRoutines = routines.slice(-COACH_REQUEST_LIMITS.routines);
  const requestCategories = categories.slice(0, COACH_REQUEST_LIMITS.categories);
  const limitations = [
    "기록에는 완료한 루틴과 날짜만 있습니다. 운동 당시의 실제 세트·무게·반복 횟수는 없습니다.",
    "루틴 목록은 현재 구성입니다. 과거 수행 당시 구성으로 간주하지 마세요.",
    "회복 상태나 통증 정보는 수집하지 않았습니다.",
  ];

  if (weeklyRecords.length > requestRecords.length) {
    limitations.push(`이번 주 기록 중 최근 ${requestRecords.length}개만 상세 데이터에 포함했습니다.`);
  }
  if (routines.length > requestRoutines.length) {
    limitations.push(`등록 루틴 중 최근 ${requestRoutines.length}개만 추천 후보에 포함했습니다.`);
  }
  if (categories.length > requestCategories.length) {
    limitations.push(`카테고리 중 ${requestCategories.length}개만 상세 데이터에 포함했습니다.`);
  }

  return {
    profile: validateWorkoutProfile(profile),
    period: { start: start.toISOString(), end: now.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    records: requestRecords,
    routines: requestRoutines,
    categories: requestCategories,
    summary: {
      workoutCount: weeklyRecords.length,
      workoutDays: new Set(weeklyRecords.map((record) => getStartOfLocalDayTimestamp(new Date(record.date)))).size,
    },
    limitations,
  };
}
