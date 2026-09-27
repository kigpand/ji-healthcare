import { useAddRoutine } from "@/hooks/mutate/useAddRoutine";
import { useCategory } from "@/hooks/queries/useCategory";
import { createRoutineFormState, useRoutineForm } from "@/hooks/useRoutineForm";
import type { CoachResult } from "@/interface/coach";
import { validateRoutineRequestInput } from "@/schema/routine.schema";
import { getCategory } from "@/service/categoryService";
import { getCoachRecommendation } from "@/service/coachService";
import { getRecord } from "@/service/recordService";
import { getRoutine } from "@/service/routineService";
import { getWorkoutProfile, saveWorkoutProfile } from "@/service/workoutProfileService";
import { buildCoachRequest } from "@/utils/coach";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

const PROFILE_QUERY_KEY = ["workout-profile"];

export function useCoachViewModel() {
  const client = useQueryClient();
  const profile = useQuery({ queryKey: PROFILE_QUERY_KEY, queryFn: getWorkoutProfile });
  const categories = useCategory();
  const [result, setResult] = useState<CoachResult | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const savedResult = useRef<CoachResult | null>(null);
  const form = useRoutineForm();
  const addRoutine = useAddRoutine();

  function clearResult() {
    setResult(null);
    setRegistered(false);
    savedResult.current = null;
    setError(null);
  }

  const saveProfile = useMutation({
    mutationFn: saveWorkoutProfile,
    onSuccess: (value) => {
      client.setQueryData(PROFILE_QUERY_KEY, value);
      clearResult();
    },
  });

  async function analyze() {
    if (lock.current || !profile.data) return;
    lock.current = true;
    setBusy(true);
    clearResult();
    try {
      // 자정 경계와 루틴 편집을 반영하도록 요청할 때마다 현재 데이터를 조회한다.
      const [records, routines, categoryList] = await Promise.all([getRecord(), getRoutine(), getCategory()]);
      const response = await getCoachRecommendation(
        buildCoachRequest(profile.data, records, routines.routines, categoryList)
      );
      setResult(response);
      setCategoryId(null);
      if (response.recommendation.kind === "new") {
        form.dispatch({ type: "SET_FORM", payload: createRoutineFormState(response.recommendation.draft) });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "추천을 준비하지 못했습니다.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function registerDraft() {
    if (!result || result.recommendation.kind !== "new" || lock.current || savedResult.current === result) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      const currentCategories = await getCategory();
      if (!currentCategories.some((category) => category.id === categoryId)) {
        throw new Error("등록할 카테고리를 선택해주세요.");
      }
      if (form.state.sets.length === 0) throw new Error("운동을 하나 이상 추가해주세요.");
      const validated = validateRoutineRequestInput({
        title: form.state.title, categoryId, routine: form.state.sets,
      });
      if (!validated.success) throw new Error(validated.messages);
      await addRoutine.mutateAsync(validated.data);
      savedResult.current = result;
      setRegistered(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "루틴을 등록하지 못했습니다.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return { profile, categories, saveProfile, result, error, busy, registered,
    categoryId, setCategoryId, form, analyze, registerDraft, clearResult };
}
