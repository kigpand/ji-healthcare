import { QUERY_KEY } from "@/constants/queryKeys";
import { deleteRecord } from "@/service/recordService";
import { showApiErrorAlert } from "@/utils/errorAlert";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecord,
    onSuccess: (_, recordId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.RECORD] });
      queryClient.removeQueries({
        queryKey: [QUERY_KEY.RECORD_DETAIL, recordId],
      });
    },
    onError: (error) => {
      showApiErrorAlert(error, "운동 기록 삭제에 실패했습니다.");
    },
  });
}
