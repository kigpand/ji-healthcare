import { QUERY_KEY } from "@/constants/queryKeys";
import { ICategory } from "@/interface/category";
import { getCategory } from "@/service/categoryService";
import { useQuery } from "@tanstack/react-query";

export function useCategory() {
  return useQuery<ICategory[]>({
    queryKey: [QUERY_KEY.CATEGORY],
    queryFn: getCategory,
  });
}
