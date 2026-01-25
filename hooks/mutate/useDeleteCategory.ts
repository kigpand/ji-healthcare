import { QUERY_KEY } from "@/constants/queryKeys";
import { deleteCategory } from "@/service/categoryService";
import { showApiErrorAlert } from "@/utils/errorAlert";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CATEGORY] });
    },
    onError: (error) => {
      showApiErrorAlert(error, "카테고리 삭제에 실패했습니다.");
    },
  });
}
