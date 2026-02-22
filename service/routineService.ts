import type {
  IRoutine,
  IRoutineInfo,
  IRoutineRequest,
} from "@/interface/routine";
import {
  RoutineInfoSchema,
  RoutineRequestSchema,
  RoutineSchema,
} from "@/interface/routine.schema";
import { apiClient } from "@/utils/apiClient";
import type { ZodType } from "zod";

function parseWithSchema<T>(
  schema: ZodType<T>,
  payload: unknown,
  fallbackMessage: string
): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(fallbackMessage);
  }
  return result.data;
}

export async function getRoutine(category?: string): Promise<IRoutine> {
  const query = category ? `?category=${category}` : "";
  const response = await apiClient<unknown>(`/routine${query}`, {
    method: "GET",
  });
  return parseWithSchema(
    RoutineSchema,
    response,
    "루틴 목록 응답 형식이 올바르지 않습니다."
  );
}

export async function addRoutine(routine: IRoutineRequest) {
  parseWithSchema(
    RoutineRequestSchema,
    routine,
    "루틴 생성 요청 데이터 형식이 올바르지 않습니다."
  );

  await apiClient("/routine/addRoutine", {
    method: "POST",
    json: routine,
    parse: "none",
  });
  return true;
}

export async function updateRoutineService(routine: IRoutine) {
  parseWithSchema(
    RoutineSchema,
    routine,
    "루틴 수정 요청 데이터 형식이 올바르지 않습니다."
  );

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
  const response = await apiClient<unknown>(`/routine/${id}`, {
    method: "GET",
  });
  return parseWithSchema(
    RoutineInfoSchema,
    response,
    "루틴 상세 응답 형식이 올바르지 않습니다."
  );
}
