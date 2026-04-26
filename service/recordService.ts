import type { IRecord } from "@/interface/record";
import type { IRoutineInfo } from "@/interface/routine";
import { getDatabase } from "@/lib/database";
import {
  getCurrentUtcIsoString,
  getStartOfLocalDayUtcIsoString,
} from "@/utils/date";

type RecordRow = {
  id: number;
  routine_id: number | null;
  title: string;
  recorded_at: string;
  category_name: string | null;
};

function mapRecord(row: RecordRow): IRecord {
  return {
    _id: row.id.toString(),
    id: row.id,
    routineId: row.routine_id ?? 0,
    title: row.title,
    category: row.category_name ?? "",
    date: row.recorded_at,
  };
}

export async function getRecord(days?: number) {
  const db = await getDatabase();

  const query = `
    SELECT
      records.id,
      records.routine_id,
      records.title,
      records.recorded_at,
      categories.name AS category_name
    FROM records
    LEFT JOIN categories ON categories.id = records.category_id
    ${typeof days === "number" && days > 0 ? "WHERE records.recorded_at >= ?" : ""}
    ORDER BY records.recorded_at DESC, records.id DESC
  `;

  const params =
    typeof days === "number" && days > 0
      ? [getStartOfLocalDayUtcIsoString(getDateDaysAgo(days - 1))]
      : [];

  const rows = await db.getAllAsync<RecordRow>(query, ...params);
  return rows.map(mapRecord);
}

export async function addRecord(routine: IRoutineInfo) {
  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT INTO records (routine_id, title, category_id, recorded_at)
      VALUES (?, ?, ?, ?)
    `,
    routine.id,
    routine.title,
    routine.categoryId,
    getCurrentUtcIsoString()
  );

  return true;
}

function getDateDaysAgo(days: number) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  return fromDate;
}
