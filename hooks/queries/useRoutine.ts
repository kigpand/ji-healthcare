import { QUERY_KEY } from "@/constants/queryKeys";
import type { IRoutine } from "@/interface/routine";
import { getRoutine } from "@/service/routineService";
import { useQuery } from "@tanstack/react-query";

export function useRoutine(categoryId?: string) {
  return useQuery<IRoutine[]>({
    queryKey: [QUERY_KEY.ROUTINE, categoryId ?? "all"],
    queryFn: () => getRoutine(categoryId),
  });
}
