import { useAddRoutine } from "@/hooks/mutate/useAddRoutine";
import { useCategorySelection } from "@/hooks/useCategorySelection";
import { type RoutineSetForm, useRoutineForm } from "@/hooks/useRoutineForm";
import { validateRoutineRequestInput } from "@/schema/routine.schema";
import { useCallback } from "react";
import { Alert } from "react-native";

export function useAddRoutineViewModel() {
  const addRoutineMutation = useAddRoutine();
  const {
    categories,
    isLoading: categoryLoading,
    isError: categoryError,
    selectedCategory,
    handleChangeCategory,
    resetCategorySelection,
  } = useCategorySelection();
  const { state: formState, dispatch } = useRoutineForm();
  const { title, sets } = formState;

  const handleChangeTitle = useCallback(
    (value: string) => {
      dispatch({ type: "SET_TITLE", payload: value });
    },
    [dispatch],
  );

  const handleChangeSet = useCallback(
    (
      index: number,
      key: keyof RoutineSetForm,
      value: string,
      options?: { numeric?: boolean },
    ) => {
      const sanitized = options?.numeric ? value.replace(/[^0-9]/g, "") : value;
      dispatch({ type: "UPDATE_SET", index, key, value: sanitized });
    },
    [dispatch],
  );

  const handleAddSet = useCallback(() => {
    dispatch({ type: "ADD_SET" });
  }, [dispatch]);

  const handleRemoveSet = useCallback(
    (index: number) => {
      dispatch({ type: "REMOVE_SET", index });
    },
    [dispatch],
  );

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET" });
    resetCategorySelection();
  }, [dispatch, resetCategorySelection]);

  const handleSubmit = useCallback(async () => {
    const validated = validateRoutineRequestInput({
      title,
      category: selectedCategory?.category,
      routine: sets,
    });

    if (!validated.success) {
      Alert.alert("입력 확인", validated.messages ?? "입력값을 확인해주세요.");
      return;
    }

    await addRoutineMutation.mutateAsync(validated.data);
    Alert.alert("등록 완료", "새로운 루틴이 추가되었습니다.");
    resetForm();
  }, [addRoutineMutation, resetForm, selectedCategory, sets, title]);

  return {
    categories,
    categoryLoading,
    categoryError,
    selectedCategory,
    title,
    sets,
    isSubmitting: addRoutineMutation.isPending,
    handleChangeCategory,
    handleChangeTitle,
    handleChangeSet,
    handleAddSet,
    handleRemoveSet,
    handleSubmit,
  };
}
