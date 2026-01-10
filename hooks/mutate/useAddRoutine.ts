import { QUERY_KEY } from "@/constants/queryKeys";
import type { IRoutineRequest } from "@/interface/routine";
import { addRoutine } from "@/service/routineService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routine: IRoutineRequest) => addRoutine(routine),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ROUTINE],
      });
    },
  });
}
