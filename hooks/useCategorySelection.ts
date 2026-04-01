import { useCategory } from "@/hooks/queries/useCategory";
import { ICategory } from "@/interface/category";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useCategorySelection(initial?: ICategory | null) {
  const {
    data: categories,
    isLoading,
    isError,
  } = useCategory();
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    initial ?? null,
  );

  const categoryList = useMemo(() => categories ?? [], [categories]);

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
    selectedCategory,
    handleChangeCategory,
    resetCategorySelection,
  };
}
