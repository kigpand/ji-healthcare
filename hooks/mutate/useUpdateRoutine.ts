import { QUERY_KEY } from "@/constants/queryKeys";
import type { IRoutineInfo } from "@/interface/routine";
import { updateRoutineService } from "@/service/routineService";
import { showApiErrorAlert } from "@/utils/errorAlert";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routine: IRoutineInfo) => updateRoutineService(routine),
    onSuccess: (_, routine) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ROUTINE],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ROUTINE_DETAIL, routine.id.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.RECORD],
      });
    },
    onError: (error) => {
      showApiErrorAlert(error, "루틴 수정에 실패했습니다.");
    },
  });
}
