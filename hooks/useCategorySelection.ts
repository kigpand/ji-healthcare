import { useCategory } from "@/hooks/queries/useCategory";
import { ICategory } from "@/interface/category";
import { getErrorMessage } from "@/utils/errorAlert";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseCategorySelectionOptions = {
  initial?: ICategory | null;
  autoSelectFirst?: boolean;
};

export function useCategorySelection(options?: UseCategorySelectionOptions) {
  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useCategory();
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    options?.initial ?? null
  );
  const autoSelectFirst = options?.autoSelectFirst ?? true;

  const categoryList = useMemo(() => categories ?? [], [categories]);
  const errorMessage = useMemo(() => getErrorMessage(error), [error]);

  useEffect(() => {
    if (!selectedCategory) {
      if (autoSelectFirst && categoryList.length > 0) {
        setSelectedCategory(categoryList[0]);
      }
      return;
    }

    const hasSelectedCategory = categoryList.some(
      (category) => category.id === selectedCategory.id
    );

    if (!hasSelectedCategory) {
      setSelectedCategory(autoSelectFirst ? (categoryList[0] ?? null) : null);
    }
  }, [autoSelectFirst, categoryList, selectedCategory]);

  const handleChangeCategory = useCallback((category: ICategory | null) => {
    setSelectedCategory(category);
  }, []);

  const resetCategorySelection = useCallback(() => {
    setSelectedCategory(autoSelectFirst ? (categoryList[0] ?? null) : null);
  }, [autoSelectFirst, categoryList]);

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
