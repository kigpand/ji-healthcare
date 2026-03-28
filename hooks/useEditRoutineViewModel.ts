import { useUpdateRoutine } from "@/hooks/mutate/useUpdateRoutine";
import { useRoutineDetail } from "@/hooks/queries/useRoutine";
import { useCategorySelection } from "@/hooks/useCategorySelection";
import {
  createRoutineFormState,
  type RoutineSetForm,
  useRoutineForm,
} from "@/hooks/useRoutineForm";
import { validateRoutineRequestInput } from "@/schema/routine.schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { Alert } from "react-native";

export function useEditRoutineViewModel() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const updateRoutineMutation = useUpdateRoutine();
  const {
    data: routineDetail,
    isLoading,
    isError,
  } = useRoutineDetail(routineId);
  const {
    categories,
    isLoading: categoryLoading,
    isError: categoryError,
    selectedCategory,
    handleChangeCategory,
  } = useCategorySelection();
  const { state: formState, dispatch } = useRoutineForm();
  const { title, sets } = formState;

  useEffect(() => {
    if (!routineDetail) {
      return;
    }

    dispatch({
      type: "SET_FORM",
      payload: createRoutineFormState(routineDetail),
    });
  }, [dispatch, routineDetail]);

  useEffect(() => {
    if (!routineDetail || !categories.length) {
      return;
    }

    const matchedCategory = categories.find(
      (category) => Number(category.id) === routineDetail.categoryId
    );

    if (matchedCategory && matchedCategory.id !== selectedCategory?.id) {
      handleChangeCategory(matchedCategory);
    }
  }, [categories, handleChangeCategory, routineDetail, selectedCategory?.id]);

  const handleChangeTitle = useCallback(
    (value: string) => {
      dispatch({ type: "SET_TITLE", payload: value });
    },
    [dispatch]
  );

  const handleChangeSet = useCallback(
    (
      index: number,
      key: keyof RoutineSetForm,
      value: string,
      options?: { numeric?: boolean }
    ) => {
      dispatch({
        type: "UPDATE_SET",
        index,
        key,
        value,
        numeric: options?.numeric,
      });
    },
    [dispatch]
  );

  const handleAddSet = useCallback(() => {
    dispatch({ type: "ADD_SET" });
  }, [dispatch]);

  const handleRemoveSet = useCallback(
    (index: number) => {
      dispatch({ type: "REMOVE_SET", index });
    },
    [dispatch]
  );

  const isSubmitting = updateRoutineMutation.isPending;
  const hasLoadingState = isLoading || categoryLoading;
  const hasErrorState = isError || categoryError;

  const canSubmit = useMemo(() => {
    return (
      !!routineDetail &&
      !!selectedCategory &&
      !hasLoadingState &&
      !hasErrorState
    );
  }, [hasErrorState, hasLoadingState, routineDetail, selectedCategory]);

  const handleSubmit = useCallback(async () => {
    if (!routineDetail || !canSubmit || !selectedCategory) {
      Alert.alert("수정 불가", "루틴 정보를 다시 확인해주세요.");
      return;
    }

    const validated = validateRoutineRequestInput({
      title,
      categoryId: selectedCategory.id,
      routine: sets,
    });

    if (!validated.success) {
      Alert.alert("입력 확인", validated.messages ?? "입력값을 확인해주세요.");
      return;
    }

    await updateRoutineMutation.mutateAsync({
      ...routineDetail,
      title: validated.data.title,
      categoryId: validated.data.categoryId,
      routine: validated.data.routine.map((item, index) => ({
        ...item,
        sortOrder: index,
      })),
    });

    Alert.alert("수정 완료", "루틴이 수정되었습니다.", [
      {
        text: "확인",
        onPress: () => {
          router.back();
        },
      },
    ]);
  }, [
    canSubmit,
    routineDetail,
    router,
    selectedCategory,
    sets,
    title,
    updateRoutineMutation,
  ]);

  return {
    categories,
    selectedCategory,
    title,
    sets,
    isLoading: hasLoadingState,
    isError: hasErrorState,
    isSubmitting,
    handleChangeCategory,
    handleChangeTitle,
    handleChangeSet,
    handleAddSet,
    handleRemoveSet,
    handleSubmit,
  };
}
