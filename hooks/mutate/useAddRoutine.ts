import { QUERY_KEY } from "@/constants/queryKeys";
import type { IRoutineRequest } from "@/interface/routine";
import { addRoutine } from "@/service/routineService";
import { showApiErrorAlert } from "@/utils/errorAlert";
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
    onError: (error) => {
      showApiErrorAlert(error, "루틴 등록에 실패했습니다.");
    },
  });
}
