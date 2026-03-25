import { supabase } from "@/lib/supabase";
import { validateCategoryRequestInput } from "@/schema/category.schema";

export async function addCategory(name: string) {
  const validated = validateCategoryRequestInput({ category: name });
  if (!validated.success) {
    throw new Error(validated.message ?? "카테고리 입력값을 확인해주세요.");
  }

  const { error } = await supabase
    .from("categories")
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return true;
}

export async function deleteCategory(categoryId: string) {
  const numericCategoryId = Number(categoryId);

  if (!Number.isInteger(numericCategoryId) || numericCategoryId <= 0) {
    throw new Error("삭제할 카테고리 정보가 올바르지 않습니다.");
  }

  const [{ count: routineCount, error: routineCountError }, { count: recordCount, error: recordCountError }] =
    await Promise.all([
      supabase
        .from("routines")
        .select("*", { count: "exact", head: true })
        .eq("category_id", numericCategoryId),
      supabase
        .from("records")
        .select("*", { count: "exact", head: true })
        .eq("category_id", numericCategoryId),
    ]);

  if (routineCountError) throw routineCountError;
  if (recordCountError) throw recordCountError;

  if ((routineCount ?? 0) > 0 || (recordCount ?? 0) > 0) {
    throw new Error(
      "이 카테고리를 사용하는 루틴 또는 기록이 있어 삭제할 수 없습니다. 관련 데이터를 먼저 정리해주세요."
    );
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", numericCategoryId);

  if (error) throw error;
  return true;
}

export async function getCategory() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
