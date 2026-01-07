import { QUERY_KEY } from "@/constants/queryKeys";
import { addRoutine } from "@/service/routineService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ROUTINE],
      });
    },
  });
}
