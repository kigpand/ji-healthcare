import { ICategory } from "@/interface/category";
import { apiClient } from "@/utils/apiClient";

export async function addCategory(category: string) {
  await apiClient("/category/addCategory", {
    method: "POST",
    json: { category },
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
