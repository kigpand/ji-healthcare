import { IRecord } from "@/interface/record";
import type { IRoutineInfo } from "@/interface/routine";
import { supabase } from "@/lib/supabase";
import { getStartOfDayIsoString } from "@/utils/date";

type CategoryRelation = {
  name: string;
} | null;

type RecordRow = {
  id: number;
  routine_id: number | null;
  title: string;
  recorded_at: string;
  categories?: CategoryRelation | CategoryRelation[];
};

function getCategoryName(categories?: CategoryRelation | CategoryRelation[]) {
  if (Array.isArray(categories)) {
    return categories[0]?.name ?? "";
  }

  return categories?.name ?? "";
}

function mapRecord(row: RecordRow): IRecord {
  return {
    _id: row.id.toString(),
    id: row.id,
    routineId: row.routine_id ?? 0,
    title: row.title,
    category: getCategoryName(row.categories),
    date: row.recorded_at,
  };
}

export async function getRecord(days?: number) {
  let query = supabase
    .from("records")
    .select("id,routine_id,title,recorded_at,categories(name)")
    .order("recorded_at", { ascending: false });

  if (typeof days === "number" && days > 0) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    query = query.gte("recorded_at", getStartOfDayIsoString(fromDate));
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((row) => mapRecord(row as RecordRow));
}

export async function addRecord(routine: IRoutineInfo) {
  const { error } = await supabase.from("records").insert({
    routine_id: routine.id,
    title: routine.title,
    category_id: routine.categoryId,
  });

  if (error) throw error;
  return true;
}
