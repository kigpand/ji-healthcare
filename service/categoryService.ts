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
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

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
