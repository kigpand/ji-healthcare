import type {
  ICompletedRoutine,
  IRecord,
  IRecordDetail,
  IRecordItem,
} from "@/interface/record";
import { getDatabase, runInTransaction } from "@/lib/database";
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

type RecordItemRow = {
  id: number;
  title: string;
  kg: number;
  set_count: number;
  sort_order: number;
};

type RecordSetRow = {
  id: number;
  record_item_id: number;
  set_number: number;
  kg: number;
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

export async function getRecord(days?: number, referenceDate = new Date()) {
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
      ? [getStartOfLocalDayUtcIsoString(getDateDaysAgo(days - 1, referenceDate))]
      : [];

  const rows = await db.getAllAsync<RecordRow>(query, ...params);
  return rows.map(mapRecord);
}

export async function addRecord(routine: ICompletedRoutine) {
  routine.routine.forEach((item) => {
    if (!Number.isInteger(item.set) || item.set <= 0) {
      throw new Error("완료 운동의 세트 수가 올바르지 않습니다.");
    }
    if (!Number.isFinite(item.kg) || item.kg < 0) {
      throw new Error("완료 운동의 무게가 올바르지 않습니다.");
    }
    if (
      item.setKgs.length !== item.set ||
      item.setKgs.some((kg) => !Number.isFinite(kg) || kg < 0)
    ) {
      throw new Error("완료 운동의 세트별 무게가 올바르지 않습니다.");
    }
  });

  await runInTransaction(async (db) => {
    const record = await db.runAsync(
      `
        INSERT INTO records (routine_id, title, category_id, recorded_at)
        VALUES (?, ?, ?, ?)
      `,
      routine.id,
      routine.title,
      routine.categoryId,
      getCurrentUtcIsoString()
    );
    const recordId = Number(record.lastInsertRowId);

    for (const [index, item] of routine.routine.entries()) {
      const recordItem = await db.runAsync(
        `
          INSERT INTO record_items
            (record_id, title, kg, set_count, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `,
        recordId,
        item.title,
        item.kg,
        item.set,
        index
      );
      const recordItemId = Number(recordItem.lastInsertRowId);

      const setValues = item.setKgs.map(() => "(?, ?)").join(", ");
      const setParams = item.setKgs.flatMap((kg, setIndex) => [
        setIndex + 1,
        kg,
      ]);

      await db.runAsync(
        `
          WITH completed_sets(set_number, kg) AS (
            VALUES ${setValues}
          )
          INSERT INTO record_sets (record_item_id, set_number, kg)
          SELECT ?, set_number, kg
          FROM completed_sets
        `,
        ...setParams,
        recordItemId
      );
    }
  });

  return true;
}

export async function getRecordDetail(recordId: string) {
  const numericRecordId = Number(recordId);
  if (!Number.isInteger(numericRecordId) || numericRecordId <= 0) {
    throw new Error("운동 기록 정보가 올바르지 않습니다.");
  }

  const db = await getDatabase();
  const record = await db.getFirstAsync<RecordRow>(
    `
      SELECT
        records.id,
        records.routine_id,
        records.title,
        records.recorded_at,
        categories.name AS category_name
      FROM records
      LEFT JOIN categories ON categories.id = records.category_id
      WHERE records.id = ?
    `,
    numericRecordId
  );

  if (!record) return null;

  const rows = await db.getAllAsync<RecordItemRow>(
    `
      SELECT id, title, kg, set_count, sort_order
      FROM record_items
      WHERE record_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    numericRecordId
  );
  const setRows = await db.getAllAsync<RecordSetRow>(
    `
      SELECT
        record_sets.id,
        record_sets.record_item_id,
        record_sets.set_number,
        record_sets.kg
      FROM record_sets
      INNER JOIN record_items
        ON record_items.id = record_sets.record_item_id
      WHERE record_items.record_id = ?
      ORDER BY
        record_items.sort_order ASC,
        record_items.id ASC,
        record_sets.set_number ASC
    `,
    numericRecordId
  );
  const setsByItemId = new Map<number, IRecordItem["sets"]>();

  setRows.forEach((row) => {
    const sets = setsByItemId.get(row.record_item_id) ?? [];
    sets.push({ id: row.id, setNumber: row.set_number, kg: row.kg });
    setsByItemId.set(row.record_item_id, sets);
  });
  const items: IRecordItem[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    kg: row.kg,
    set: row.set_count,
    sortOrder: row.sort_order,
    sets: setsByItemId.get(row.id) ?? [],
  }));

  return { ...mapRecord(record), items } satisfies IRecordDetail;
}

function getDateDaysAgo(days: number, referenceDate: Date) {
  const fromDate = new Date(referenceDate);
  fromDate.setDate(fromDate.getDate() - days);
  return fromDate;
}
