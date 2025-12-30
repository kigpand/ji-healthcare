import { QUERY_KEY } from "@/constants/queryKeys";
import type { IRoutine, IRoutineInfo } from "@/interface/routine";
import { getRoutine, getRoutineDetail } from "@/service/routineService";
import { useQuery } from "@tanstack/react-query";

export function useRoutine(category?: string) {
  return useQuery<IRoutine>({
    queryKey: [QUERY_KEY.ROUTINE, category],
    queryFn: () => getRoutine(category),
    enabled: !!category,
  });
}

export function useRoutineDetail(id?: string) {
  return useQuery<IRoutineInfo>({
    queryKey: [QUERY_KEY.ROUTINE_DETAIL, id],
    queryFn: () => getRoutineDetail(id),
    enabled: !!id,
  });
}
