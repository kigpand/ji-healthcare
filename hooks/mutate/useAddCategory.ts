import { QUERY_KEY } from "@/constants/queryKeys";
import { addCategory } from "@/service/categoryService";
import { showApiErrorAlert } from "@/utils/errorAlert";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CATEGORY] });
    },
    onError: (error) => {
      showApiErrorAlert(error, "카테고리 추가에 실패했습니다.");
    },
  });
}
