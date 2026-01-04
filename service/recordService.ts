import type { IRoutineInfo } from "@/interface/routine";
import { API_URL } from "@/utils/config";

export async function getRecord(days?: number) {
  try {
    const query = typeof days === "number" ? `?days=${days}` : "";
    const result = await fetch(`${API_URL}/record${query}`, {
      method: "get",
    });
    const data = await result.json();
    return data;
  } catch (e) {
    throw e;
  }
}

export async function addRecord(routine: IRoutineInfo) {
  try {
    const record = {
      title: routine.title,
      category: routine.category,
      date: new Date(),
      id: routine.id,
    };
    await fetch(`${API_URL}/record/addRecord`, {
      method: "post",
      body: JSON.stringify(record),
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
