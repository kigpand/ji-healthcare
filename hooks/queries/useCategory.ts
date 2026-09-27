import { QUERY_KEY } from "@/constants/queryKeys";
import { ICategory } from "@/interface/category";
import { getCategory } from "@/service/categoryService";
import { useQuery } from "@tanstack/react-query";

export function useCategory(archivedOnly = false, enabled = true) {
  return useQuery<ICategory[]>({
    queryKey: [QUERY_KEY.CATEGORY, archivedOnly ? "archived" : "active"],
    queryFn: () => getCategory(archivedOnly),
    enabled,
  });
}
