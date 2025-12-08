import type { IRoutine } from "@/interface/routine";
import { API_URL } from "@/utils/config";

export async function getRecord() {
  try {
    const result = await fetch(`${API_URL}/record`, {
      method: "get",
    });
    const data = await result.json();
    return data;
  } catch (e) {
    console.error(e);
    return "fail";
  }
}

export async function addRecord(routine: IRoutine) {
  try {
    const record = {
      title: routine.title,
      category: routine.category,
      date: new Date(),
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
