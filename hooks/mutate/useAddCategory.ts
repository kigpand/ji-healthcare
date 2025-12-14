import { QUERY_KEY } from "@/constants/queryKeys";
import { addCategory } from "@/service/categoryService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CATEGORY] });
    },
  });
}
