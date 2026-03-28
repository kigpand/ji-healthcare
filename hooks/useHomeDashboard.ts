import { useCategory } from "@/hooks/queries/useCategory";
import { useRecord } from "@/hooks/queries/useRecord";
import { useRoutine } from "@/hooks/queries/useRoutine";
import type { IRecord } from "@/interface/record";
import { useMemo } from "react";

const RECENT_RECORD_LIMIT = 3;

export function useHomeDashboard() {
  const { data: routines, isLoading: routineLoading } = useRoutine();
  const { data: categories, isLoading: categoryLoading } = useCategory();
  const { data: weeklyRecords, isLoading: weeklyLoading } = useRecord(7);
  const { data: monthlyRecords, isLoading: monthlyLoading } = useRecord(30);

  const isLoading =
    routineLoading || categoryLoading || weeklyLoading || monthlyLoading;

  const dashboard = useMemo(() => {
    const routineCount = routines?.routines.length ?? 0;
    const categoryCount = categories?.length ?? 0;
    const weeklyCount = weeklyRecords?.length ?? 0;
    const recentRecords = (monthlyRecords ?? []).slice(0, RECENT_RECORD_LIMIT);

    return {
      routineCount,
      categoryCount,
      weeklyCount,
      recentRecords,
      topCategory: getTopCategory(monthlyRecords ?? []),
      lastWorkoutDate: getLatestWorkoutDate(monthlyRecords ?? []),
    };
  }, [categories, monthlyRecords, routines, weeklyRecords]);

  return {
    isLoading,
    dashboard,
  };
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

  const latestDate = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]?.date;

  return latestDate ? formatRecordDate(latestDate) : null;
}

export function formatRecordDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}.${month}.${day}`;
}
