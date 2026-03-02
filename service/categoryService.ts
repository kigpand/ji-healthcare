import { ICategory } from "@/interface/category";
import { validateCategoryRequestInput } from "@/schema/category.schema";
import { apiClient } from "@/utils/apiClient";

export async function addCategory(category: string) {
  const validated = validateCategoryRequestInput({ category });
  if (!validated.success) {
    throw new Error(validated.message ?? "카테고리 입력값을 확인해주세요.");
  }

  await apiClient("/category/addCategory", {
    method: "POST",
    json: validated.data,
    parse: "none",
  });
  return true;
}

export async function deleteCategory(categoryId: string) {
  await apiClient("/category/deleteCategory", {
    method: "DELETE",
    json: { categoryId },
    parse: "none",
  });
  return true;
}

export async function getCategory(): Promise<ICategory[]> {
  return apiClient<ICategory[]>("/category", {
    method: "GET",
  });
}

export async function getCategoryOnce(category: string) {
  return apiClient(`/category/${category}`, {
    method: "GET",
  });
}
