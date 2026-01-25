import type { IRoutineInfo } from "@/interface/routine";
import { apiClient } from "@/utils/apiClient";
import { IRecord } from "@/interface/record";

export async function getRecord(days?: number) {
  const query = typeof days === "number" ? `?days=${days}` : "";
  return apiClient<IRecord[]>(`/record${query}`, {
    method: "GET",
  });
}

export async function addRecord(routine: IRoutineInfo) {
  const record = {
    title: routine.title,
    category: routine.category,
    date: new Date(),
    id: routine.id,
  };

  await apiClient("/record/addRecord", {
    method: "POST",
    json: record,
    parse: "none",
  });
  return true;
}
