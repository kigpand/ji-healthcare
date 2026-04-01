import { useCategory } from "@/hooks/queries/useCategory";
import { useRecord } from "@/hooks/queries/useRecord";
import { useRoutine } from "@/hooks/queries/useRoutine";
import type { IRecord } from "@/interface/record";
import {
  formatRecordDate,
  getDayDifference,
  getStartOfDayTimestamp,
  parseDate,
} from "@/utils/date";
import { useMemo } from "react";

const RECENT_RECORD_LIMIT = 3;

export function useHomeDashboard() {
  const {
    data: routines,
    isLoading: routineLoading,
    isError: routineError,
  } = useRoutine();
  const {
    data: categories,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useCategory();
  const {
    data: allRecords,
    isLoading: allRecordsLoading,
    isError: allRecordsError,
  } = useRecord();
  const {
    data: weeklyRecords,
    isLoading: weeklyLoading,
    isError: weeklyError,
  } = useRecord(7);
  const {
    data: monthlyRecords,
    isLoading: monthlyLoading,
    isError: monthlyError,
  } = useRecord(30);

  const isLoading =
    routineLoading ||
    categoryLoading ||
    allRecordsLoading ||
    weeklyLoading ||
    monthlyLoading;
  const isError =
    routineError ||
    categoryError ||
    allRecordsError ||
    weeklyError ||
    monthlyError;

  const dashboard = useMemo(() => {
    const routineCount = routines?.routines.length ?? 0;
    const categoryCount = categories?.length ?? 0;
    const weeklyCount = weeklyRecords?.length ?? 0;
    const recentRecords = (allRecords ?? []).slice(0, RECENT_RECORD_LIMIT);
    const recordSource = allRecords ?? [];

    return {
      routineCount,
      categoryCount,
      weeklyCount,
      recentRecords,
      topCategory: getTopCategory(monthlyRecords ?? []),
      lastWorkoutDate: getLatestWorkoutDate(recordSource),
      currentStreak: getCurrentWorkoutStreak(recordSource),
    };
  }, [allRecords, categories, monthlyRecords, routines, weeklyRecords]);

  return {
    isLoading,
    isError,
    dashboard,
  };
}

function getCurrentWorkoutStreak(records: IRecord[]) {
  if (!records.length) {
    return 0;
  }

  const uniqueDates = Array.from(
    new Set(
      records
        .map((record) => {
          const date = parseDate(record.date);
          return date ? getStartOfDayTimestamp(date) : null;
        })
        .filter((value): value is number => value !== null)
    )
  ).sort((a, b) => b - a);

  if (!uniqueDates.length) {
    return 0;
  }

  const today = getStartOfDayTimestamp(new Date());
  const yesterday = today - 1000 * 60 * 60 * 24;
  const latestWorkoutDay = uniqueDates[0];

  if (latestWorkoutDay !== today && latestWorkoutDay !== yesterday) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previousDate = uniqueDates[index - 1];
    const currentDate = uniqueDates[index];
    const diffDays = getDayDifference(previousDate, currentDate);

    if (diffDays !== 1) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function getTopCategory(records: IRecord[]) {
  if (!records.length) {
    return null;
  }

  const categoryCountMap = new Map<string, number>();

  records.forEach((record) => {
    const key = record.category || "미분류";
    categoryCountMap.set(key, (categoryCountMap.get(key) ?? 0) + 1);
  });

  return (
    Array.from(categoryCountMap.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] ?? null
  );
}

function getLatestWorkoutDate(records: IRecord[]) {
  if (!records.length) {
    return null;
  }

  const latestDate = records.reduce<string | null>((latest, record) => {
    const currentDate = parseDate(record.date);

    if (!currentDate) {
      return latest;
    }

    if (!latest) {
      return record.date;
    }

    const latestDate = parseDate(latest);

    if (!latestDate || currentDate.getTime() > latestDate.getTime()) {
      return record.date;
    }

    return latest;
  }, null);

  return latestDate ? formatRecordDate(latestDate) : null;
}
