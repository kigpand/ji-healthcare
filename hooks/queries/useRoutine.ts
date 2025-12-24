import { QUERY_KEY } from "@/constants/queryKeys";
import type { IRoutine } from "@/interface/routine";
import { getRoutine } from "@/service/routineService";
import { useQuery } from "@tanstack/react-query";

export function useRoutine(category?: string) {
  return useQuery<IRoutine>({
    queryKey: [QUERY_KEY.ROUTINE, category],
    queryFn: () => getRoutine(category),
    enabled: !!category,
  });
}
