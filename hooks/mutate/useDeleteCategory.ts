import { QUERY_KEY } from "@/constants/queryKeys";
import { deleteCategory } from "@/service/categoryService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CATEGORY] });
    },
  });
}
