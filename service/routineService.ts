import type {
  IRoutine,
  IRoutineInfo,
  IRoutineRequest,
} from "@/interface/routine";
import { getDatabase, runInTransaction } from "@/lib/database";
import { validateRoutineRequestInput } from "@/schema/routine.schema";
import { getCurrentUtcIsoString } from "@/utils/date";

type RoutineRow = {
  id: number;
  title: string;
  category_id: number | null;
  created_at: string;
  category_name: string | null;
};

type RoutineItemRow = {
  id: number;
  routine_id: number;
  title: string;
  kg: number | null;
  set_count: number | null;
  link: string | null;
  sort_order: number | null;
};

function mapRoutine(
  row: RoutineRow,
  items: RoutineItemRow[] = []
): IRoutineInfo {
  const routineItems = [...items].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return {
    id: row.id,
    title: row.title,
    category: row.category_name ?? "",
    categoryId: row.category_id,
    createdAt: row.created_at,
    routine: routineItems.map((item) => ({
      id: item.id,
      title: item.title,
      kg: item.kg ?? 0,
      set: item.set_count ?? 0,
      link: item.link ?? undefined,
      sortOrder: item.sort_order ?? 0,
    })),
  };
}

function buildRoutineItemsPayload(
  routineId: number,
  items: IRoutineInfo["routine"] | IRoutineRequest["routine"]
) {
  return items.map((item, index) => ({
    title: item.title,
    kg: item.kg,
    setCount: item.set,
    link: item.link ?? null,
    sortOrder: item.sortOrder ?? index,
    routineId,
  }));
}

async function getRoutineRows(categoryId?: string) {
  const db = await getDatabase();
  const hasCategoryFilter = !!categoryId;

  const routines = await db.getAllAsync<RoutineRow>(
    `
      SELECT
        routines.id,
        routines.title,
        routines.category_id,
        routines.created_at,
        categories.name AS category_name
      FROM routines
      LEFT JOIN categories ON categories.id = routines.category_id
      ${hasCategoryFilter ? "WHERE routines.category_id = ?" : ""}
      ORDER BY routines.id ASC
    `,
    ...(hasCategoryFilter ? [Number(categoryId)] : [])
  );

  if (!routines.length) {
    return [];
  }

  const routineIds = routines.map((routine) => routine.id);
  const placeholders = routineIds.map(() => "?").join(", ");
  const items = await db.getAllAsync<RoutineItemRow>(
    `
      SELECT id, routine_id, title, kg, set_count, link, sort_order
      FROM routine_items
      WHERE routine_id IN (${placeholders})
      ORDER BY routine_id ASC, sort_order ASC, id ASC
    `,
    ...routineIds
  );

  const itemsByRoutineId = new Map<number, RoutineItemRow[]>();

  items.forEach((item) => {
    const list = itemsByRoutineId.get(item.routine_id) ?? [];
    list.push(item);
    itemsByRoutineId.set(item.routine_id, list);
  });

  return routines.map((row) => mapRoutine(row, itemsByRoutineId.get(row.id)));
}

async function getRoutineById(routineId: number) {
  const db = await getDatabase();
  const routine = await db.getFirstAsync<RoutineRow>(
    `
      SELECT
        routines.id,
        routines.title,
        routines.category_id,
        routines.created_at,
        categories.name AS category_name
      FROM routines
      LEFT JOIN categories ON categories.id = routines.category_id
      WHERE routines.id = ?
    `,
    routineId
  );

  if (!routine) {
    return null;
  }

  const items = await db.getAllAsync<RoutineItemRow>(
    `
      SELECT id, routine_id, title, kg, set_count, link, sort_order
      FROM routine_items
      WHERE routine_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    routineId
  );

  return mapRoutine(routine, items);
}

export async function getRoutine(categoryId?: string): Promise<IRoutine> {
  const routines = await getRoutineRows(categoryId);

  return { routines };
}

export async function addRoutine(routine: IRoutineRequest) {
  const validated = validateRoutineRequestInput(routine);

  if (!validated.success) {
    throw new Error(validated.messages ?? "루틴 입력값을 확인해주세요.");
  }

  await runInTransaction(async (tx) => {
    const insertedRoutine = await tx.runAsync(
      `
        INSERT INTO routines (title, category_id, created_at)
        VALUES (?, ?, ?)
      `,
      validated.data.title,
      validated.data.categoryId,
      getCurrentUtcIsoString()
    );

    const routineId = insertedRoutine.lastInsertRowId;
    const routineItems = buildRoutineItemsPayload(
      routineId,
      validated.data.routine
    );

    for (const item of routineItems) {
      await tx.runAsync(
        `
          INSERT INTO routine_items
            (routine_id, title, kg, set_count, link, sort_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        item.routineId,
        item.title,
        item.kg,
        item.setCount,
        item.link,
        item.sortOrder
      );
    }
  });

  return true;
}

export async function updateRoutineService(routine: IRoutineInfo) {
  const validated = validateRoutineRequestInput({
    title: routine.title,
    categoryId: routine.categoryId,
    routine: routine.routine,
  });

  if (!validated.success) {
    throw new Error(validated.messages ?? "루틴 입력값을 확인해주세요.");
  }

  await runInTransaction(async (tx) => {
    const updatedRoutine = await tx.runAsync(
      `
        UPDATE routines
        SET title = ?, category_id = ?
        WHERE id = ?
      `,
      validated.data.title,
      validated.data.categoryId,
      routine.id
    );

    if ((updatedRoutine.changes ?? 0) === 0) {
      throw new Error("수정할 루틴을 찾지 못했습니다.");
    }

    await tx.runAsync(
      "DELETE FROM routine_items WHERE routine_id = ?",
      routine.id
    );

    const routineItems = buildRoutineItemsPayload(
      routine.id,
      validated.data.routine
    );

    for (const item of routineItems) {
      await tx.runAsync(
        `
          INSERT INTO routine_items
            (routine_id, title, kg, set_count, link, sort_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        item.routineId,
        item.title,
        item.kg,
        item.setCount,
        item.link,
        item.sortOrder
      );
    }
  });

  return true;
}

export async function deleteRoutine(id: number) {
  const db = await getDatabase();
  const result = await db.runAsync("DELETE FROM routines WHERE id = ?", id);

  if ((result.changes ?? 0) === 0) {
    throw new Error("삭제할 루틴을 찾지 못했습니다.");
  }

  return "success";
}

export async function deleteRoutineByCategory(categoryId: string) {
  const db = await getDatabase();

  await db.runAsync("DELETE FROM routines WHERE category_id = ?", Number(categoryId));

  return "success";
}

export async function getRoutineDetail(id?: string): Promise<IRoutineInfo> {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("루틴 정보가 올바르지 않습니다.");
  }

  const routine = await getRoutineById(numericId);

  if (!routine) {
    throw new Error("루틴을 찾지 못했습니다.");
  }

  return routine;
}
