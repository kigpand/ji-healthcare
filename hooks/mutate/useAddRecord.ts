import { QUERY_KEY } from "@/constants/queryKeys";
import { addRecord } from "@/service/recordService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.RECORD] });
    },
  });
}
