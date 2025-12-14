import { QUERY_KEY } from "@/constants/queryKeys";
import { getCategory } from "@/service/categoryService";
import { useQuery } from "@tanstack/react-query";

export function useCategory() {
  return useQuery({
    queryKey: [QUERY_KEY.CATEGORY],
    queryFn: getCategory,
  });
}
