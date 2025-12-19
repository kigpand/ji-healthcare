import { ICategory } from "@/interface/category";
import { API_URL } from "@/utils/config";

export async function addCategory(category: string) {
  try {
    await fetch(`${API_URL}/category/addCategory`, {
      method: "post",
      body: JSON.stringify({ category }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (e) {
    throw e;
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await fetch(`${API_URL}/category/deleteCategory`, {
      method: "delete",
      body: JSON.stringify({ categoryId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (e) {
    throw e;
  }
}

export async function getCategory(): Promise<ICategory[]> {
  try {
    const result = await fetch(`${API_URL}/category`, {
      method: "get",
    });
    const data = await result.json();
    return data;
  } catch (e) {
    throw e;
  }
}

export async function getCategoryOnce(category: string) {
  try {
    const result = await fetch(`${API_URL}/category/${category}`, {
      method: "get",
    });
    const data = await result.json();
    return data;
  } catch (e) {
    console.error(e);
    return "fail";
  }
}
