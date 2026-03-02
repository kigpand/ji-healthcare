import type {
  IRoutine,
  IRoutineInfo,
  IRoutineRequest,
} from "@/interface/routine";
import { validateRoutineRequestInput } from "@/schema/routine.schema";
import { apiClient } from "@/utils/apiClient";

export async function getRoutine(category?: string): Promise<IRoutine> {
  const query = category ? `?category=${category}` : "";
  return apiClient<IRoutine>(`/routine${query}`, {
    method: "GET",
  });
}

export async function addRoutine(routine: IRoutineRequest) {
  const validated = validateRoutineRequestInput(routine);
  if (!validated.success) {
    throw new Error(validated.messages ?? "루틴 입력값을 확인해주세요.");
  }

  await apiClient("/routine/addRoutine", {
    method: "POST",
    json: validated.data,
    parse: "none",
  });
  return true;
}

export async function updateRoutineService(routine: IRoutine) {
  await apiClient("/routine/updateRoutine", {
    method: "PUT",
    json: routine,
    parse: "none",
  });
  return true;
}

export async function deleteRoutine(id: number) {
  await apiClient("/routine/delete", {
    method: "DELETE",
    json: { id },
    parse: "none",
  });
  return "success";
}

export async function deleteRoutineByCategory(category: string) {
  await apiClient("/routine/deleteRoutineByCategory", {
    method: "DELETE",
    json: { category },
    parse: "none",
  });
  return "success";
}

export async function getRoutineDetail(id?: string): Promise<IRoutineInfo> {
  return apiClient<IRoutineInfo>(`/routine/${id}`, {
    method: "GET",
  });
}
