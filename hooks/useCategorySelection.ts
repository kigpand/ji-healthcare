import { useCategory } from "@/hooks/queries/useCategory";
import { ICategory } from "@/interface/category";
import { getErrorMessage } from "@/utils/errorAlert";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useCategorySelection(initial?: ICategory | null) {
  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useCategory();
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    initial ?? null,
  );

  const categoryList = useMemo(() => categories ?? [], [categories]);
  const errorMessage = useMemo(() => getErrorMessage(error), [error]);

  useEffect(() => {
    if (!selectedCategory) {
      if (categoryList.length > 0) {
        setSelectedCategory(categoryList[0]);
      }
      return;
    }

    const hasSelectedCategory = categoryList.some(
      (category) => category.id === selectedCategory.id
    );

    if (!hasSelectedCategory) {
      setSelectedCategory(categoryList[0] ?? null);
    }
  }, [categoryList, selectedCategory]);

  const handleChangeCategory = useCallback((category: ICategory) => {
    setSelectedCategory(category);
  }, []);

  const resetCategorySelection = useCallback(() => {
    setSelectedCategory(categoryList[0] ?? null);
  }, [categoryList]);

  return {
    categories: categoryList,
    isLoading,
    isError,
    errorMessage,
    selectedCategory,
    handleChangeCategory,
    resetCategorySelection,
  };
}
