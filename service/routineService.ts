import type {
  IRoutine,
  IRoutineInfo,
  IRoutineRequest,
} from "@/interface/routine";
import { API_URL } from "@/utils/config";

export async function getRoutine(category?: string): Promise<IRoutine> {
  try {
    const result = await fetch(
      `${API_URL}/routine${category ? `?category=${category}` : ""}`,
      {
        method: "get",
      }
    );
    const data = await result.json();
    return data;
  } catch (e) {
    throw e;
  }
}

export async function addRoutine(routine: IRoutineRequest) {
  try {
    await fetch(`${API_URL}/routine/addRoutine`, {
      method: "post",
      body: JSON.stringify(routine),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function updateRoutineService(routine: IRoutine) {
  try {
    await fetch(`${API_URL}/routine/updateRoutine`, {
      method: "put",
      body: JSON.stringify(routine),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function deleteRoutine(id: number) {
  try {
    await fetch(`${API_URL}/routine/delete`, {
      method: "delete",
      body: JSON.stringify({ id: id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return "success";
  } catch (e) {
    console.error(e);
    return "fail";
  }
}

export async function deleteRoutineByCategory(category: string) {
  try {
    await fetch(`${API_URL}/routine/deleteRoutineByCategory`, {
      method: "delete",
      body: JSON.stringify({ category }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return "success";
  } catch (e) {
    console.error(e);
    return "fail";
  }
}

export async function getRoutineDetail(id?: string): Promise<IRoutineInfo> {
  try {
    const result = await fetch(`${API_URL}/routine/${id}`, {
      method: "get",
    });
    const data = await result.json();
    return data;
  } catch (e) {
    throw e;
  }
}
