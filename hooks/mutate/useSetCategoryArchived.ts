import { QUERY_KEY } from "@/constants/queryKeys";
import { setCategoryArchived } from "@/service/categoryService";
import { showApiErrorAlert } from "@/utils/errorAlert";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSetCategoryArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      setCategoryArchived(id, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CATEGORY] });
    },
    onError: (error, { archived }) => {
      showApiErrorAlert(
        error,
        `카테고리 ${archived ? "보관" : "복원"}에 실패했습니다.`
      );
    },
  });
}
