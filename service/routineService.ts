import type {
  IRoutine,
  IRoutineInfo,
  IRoutineRequest,
} from "@/interface/routine";
import { supabase } from "@/lib/supabase";
import { validateRoutineRequestInput } from "@/schema/routine.schema";

type RoutineItemRow = {
  id: number;
  kg: number | null;
  set_count: number | null;
  title: string;
  link: string | null;
  sort_order: number | null;
  created_at?: string;
};

type CategoryRelation = {
  name: string;
} | null;

type RoutineRow = {
  id: number;
  title: string;
  category_id: number | null;
  created_at: string;
  categories?: CategoryRelation | CategoryRelation[];
  routine_items?: RoutineItemRow[] | null;
};

function getCategoryName(categories?: CategoryRelation | CategoryRelation[]) {
  if (Array.isArray(categories)) {
    return categories[0]?.name ?? "";
  }

  return categories?.name ?? "";
}

function mapRoutine(row: RoutineRow): IRoutineInfo {
  const routineItems = [...(row.routine_items ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return {
    id: row.id,
    title: row.title,
    category: getCategoryName(row.categories),
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
    routine_id: routineId,
    title: item.title,
    kg: item.kg,
    set_count: item.set,
    link: item.link ?? null,
    sort_order: item.sortOrder ?? index,
  }));
}

async function restoreRoutineSnapshot(previousRoutine: IRoutineInfo) {
  const { error: restoreRoutineError } = await supabase
    .from("routines")
    .update({
      title: previousRoutine.title,
      category_id: previousRoutine.categoryId,
    })
    .eq("id", previousRoutine.id);

  if (restoreRoutineError) {
    throw restoreRoutineError;
  }

  const previousItems = buildRoutineItemsPayload(
    previousRoutine.id,
    previousRoutine.routine
  );

  if (!previousItems.length) {
    return;
  }

  const { error: restoreItemsError } = await supabase
    .from("routine_items")
    .insert(previousItems);

  if (restoreItemsError) {
    throw restoreItemsError;
  }
}

export async function getRoutine(categoryId?: string): Promise<IRoutine> {
  let query = supabase
    .from("routines")
    .select(
      "id,title,category_id,created_at,categories(name),routine_items(id,title,kg,set_count,link,sort_order,created_at)"
    );

  if (categoryId) {
    query = query.eq("category_id", Number(categoryId));
  }

  const { data, error } = await query.order("id", { ascending: true });

  if (error) throw error;

  return {
    routines: (data ?? []).map((row) => mapRoutine(row as RoutineRow)),
  };
}

export async function addRoutine(routine: IRoutineRequest) {
  const validated = validateRoutineRequestInput(routine);

  if (!validated.success) {
    throw new Error(validated.messages ?? "루틴 입력값을 확인해주세요.");
  }

  const { data: insertedRoutine, error: routineError } = await supabase
    .from("routines")
    .insert({
      title: validated.data.title,
      category_id: validated.data.categoryId,
    })
    .select("id")
    .single();

  if (routineError) throw routineError;

  const routineItems = buildRoutineItemsPayload(
    insertedRoutine.id,
    validated.data.routine
  );

  const { error: itemError } = await supabase
    .from("routine_items")
    .insert(routineItems);

  if (itemError) {
    await supabase.from("routines").delete().eq("id", insertedRoutine.id);
    throw itemError;
  }

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

  const previousRoutine = await getRoutineDetail(routine.id.toString());

  const { error: routineError } = await supabase
    .from("routines")
    .update({
      title: validated.data.title,
      category_id: validated.data.categoryId,
    })
    .eq("id", routine.id);

  if (routineError) throw routineError;

  const { error: deleteItemsError } = await supabase
    .from("routine_items")
    .delete()
    .eq("routine_id", routine.id);

  if (deleteItemsError) throw deleteItemsError;

  const routineItems = buildRoutineItemsPayload(
    routine.id,
    validated.data.routine
  );

  const { error: insertItemsError } = await supabase
    .from("routine_items")
    .insert(routineItems);

  if (insertItemsError) {
    try {
      await restoreRoutineSnapshot(previousRoutine);
    } catch (restoreError) {
      console.error("Failed to restore routine after update failure", {
        routineId: routine.id,
        restoreError,
        insertItemsError,
      });
    }

    throw insertItemsError;
  }

  return true;
}

export async function deleteRoutine(id: number) {
  const { error } = await supabase.from("routines").delete().eq("id", id);

  if (error) throw error;
  return "success";
}

export async function deleteRoutineByCategory(categoryId: string) {
  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("category_id", Number(categoryId));

  if (error) throw error;
  return "success";
}

export async function getRoutineDetail(id?: string): Promise<IRoutineInfo> {
  const { data, error } = await supabase
    .from("routines")
    .select(
      "id,title,category_id,created_at,categories(name),routine_items(id,title,kg,set_count,link,sort_order,created_at)"
    )
    .eq("id", Number(id))
    .single();

  if (error) throw error;

  return mapRoutine(data as RoutineRow);
}
