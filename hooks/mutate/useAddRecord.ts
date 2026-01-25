import { QUERY_KEY } from "@/constants/queryKeys";
import { addRecord } from "@/service/recordService";
import { showApiErrorAlert } from "@/utils/errorAlert";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.RECORD] });
    },
    onError: (error) => {
      showApiErrorAlert(error, "운동 기록 추가에 실패했습니다.");
    },
  });
}
