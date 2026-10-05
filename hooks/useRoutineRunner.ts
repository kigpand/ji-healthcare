import { useAddRecord } from "@/hooks/mutate/useAddRecord";
import { useRoutineDetail } from "@/hooks/queries/useRoutine";
import type { ICompletedRoutine } from "@/interface/record";
import {
  cancelRestTimerNotifications,
  scheduleRestTimerNotification,
} from "@/service/notificationService";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { AppState } from "react-native";

type RoutineRunnerState = {
  currentRoutineIndex: number;
  counts: number[];
  setTargets: number[];
  setWeights: string[][];
  setReps: string[][];
  weightError: string | null;
  repsError: string | null;
  isTimerModal: boolean;
  countdown: number;
  isTimerRunning: boolean;
  timerEndsAt: number | null;
  finished: boolean;
  recordAdded: boolean;
  recordSaving: boolean;
  recordSaveFailed: boolean;
};

type RoutineRunnerAction =
  | {
      type: "RESET";
      payload: {
        countdown: number;
        counts: number[];
        setTargets: number[];
        setWeights: string[][];
        setReps: string[][];
      };
    }
  | { type: "OPEN_TIMER"; payload: { countdown: number; endsAt: number } }
  | { type: "CLOSE_TIMER"; payload: { countdown: number } }
  | {
      type: "START_NEXT_SET";
      payload: { countdown: number; index: number; max: number };
    }
  | { type: "SYNC_TIMER"; payload: number }
  | { type: "INCREMENT_SET"; payload: { index: number; max: number } }
  | { type: "ADD_SET"; payload: { routineIndex: number; defaultWeight: string } }
  | { type: "REMOVE_SET"; payload: { routineIndex: number; minimum: number } }
  | {
      type: "UNDO_LAST_SET";
      payload: { routineIndex: number; expectedCount: number };
    }
  | {
      type: "UPDATE_SET_WEIGHT";
      payload: { routineIndex: number; setIndex: number; value: string };
    }
  | { type: "SET_WEIGHT_ERROR"; payload: string | null }
  | {
      type: "UPDATE_SET_REPS";
      payload: { routineIndex: number; setIndex: number; value: string };
    }
  | { type: "SET_REPS_ERROR"; payload: string | null }
  | { type: "MOVE_NEXT_ROUTINE" }
  | { type: "FINISH" }
  | { type: "SET_RECORD_ADDED"; payload: boolean }
  | { type: "SET_RECORD_SAVING"; payload: boolean }
  | { type: "SET_RECORD_SAVE_FAILED"; payload: boolean };

function runnerReducer(state: RoutineRunnerState, action: RoutineRunnerAction) {
  switch (action.type) {
    case "RESET":
      return {
        currentRoutineIndex: 0,
        counts: action.payload.counts,
        setTargets: action.payload.setTargets,
        setWeights: action.payload.setWeights,
        setReps: action.payload.setReps,
        weightError: null,
        repsError: null,
        isTimerModal: false,
        countdown: action.payload.countdown,
        isTimerRunning: false,
        timerEndsAt: null,
        finished: false,
        recordAdded: false,
        recordSaving: false,
        recordSaveFailed: false,
      };
    case "OPEN_TIMER":
      return {
        ...state,
        isTimerModal: true,
        isTimerRunning: true,
        countdown: action.payload.countdown,
        timerEndsAt: action.payload.endsAt,
      };
    case "CLOSE_TIMER":
      return {
        ...state,
        isTimerModal: false,
        isTimerRunning: false,
        timerEndsAt: null,
        countdown: action.payload.countdown,
      };
    case "START_NEXT_SET":
      if (!state.isTimerModal) return state;
      return {
        ...state,
        isTimerModal: false,
        isTimerRunning: false,
        timerEndsAt: null,
        countdown: action.payload.countdown,
        counts: state.counts.map((count, index) =>
          index === action.payload.index
            ? Math.min(count + 1, action.payload.max)
            : count
        ),
      };
    case "SYNC_TIMER":
      return {
        ...state,
        countdown: action.payload,
        isTimerRunning: action.payload > 0,
      };
    case "INCREMENT_SET":
      return {
        ...state,
        counts: state.counts.map((count, idx) =>
          idx === action.payload.index
            ? Math.min(count + 1, action.payload.max)
            : count
        ),
      };
    case "ADD_SET":
      return {
        ...state,
        setTargets: state.setTargets.map((target, index) =>
          index === action.payload.routineIndex ? target + 1 : target
        ),
        setWeights: state.setWeights.map((weights, index) =>
          index === action.payload.routineIndex
            ? [...weights, action.payload.defaultWeight]
            : weights
        ),
        setReps: state.setReps.map((reps, index) =>
          index === action.payload.routineIndex ? [...reps, ""] : reps
        ),
      };
    case "REMOVE_SET":
      return {
        ...state,
        setTargets: state.setTargets.map((target, index) =>
          index === action.payload.routineIndex
            ? Math.max(action.payload.minimum, target - 1)
            : target
        ),
        setWeights: state.setWeights.map((weights, index) =>
          index === action.payload.routineIndex &&
          weights.length > action.payload.minimum
            ? weights.slice(0, -1)
            : weights
        ),
        setReps: state.setReps.map((reps, index) =>
          index === action.payload.routineIndex &&
          reps.length > action.payload.minimum
            ? reps.slice(0, -1)
            : reps
        ),
      };
    case "UNDO_LAST_SET":
      if (
        state.finished ||
        state.isTimerModal ||
        state.counts[action.payload.routineIndex] !==
          action.payload.expectedCount
      ) {
        return state;
      }
      return {
        ...state,
        currentRoutineIndex: action.payload.routineIndex,
        counts: state.counts.map((count, index) =>
          index === action.payload.routineIndex ? Math.max(0, count - 1) : count
        ),
        weightError: null,
        repsError: null,
      };
    case "UPDATE_SET_WEIGHT":
      return {
        ...state,
        setWeights: state.setWeights.map((weights, routineIndex) =>
          routineIndex === action.payload.routineIndex
            ? weights.map((weight, setIndex) =>
                setIndex === action.payload.setIndex
                  ? action.payload.value
                  : weight
              )
            : weights
        ),
        weightError: null,
      };
    case "SET_WEIGHT_ERROR":
      return { ...state, weightError: action.payload };
    case "UPDATE_SET_REPS":
      return {
        ...state,
        setReps: state.setReps.map((reps, routineIndex) =>
          routineIndex === action.payload.routineIndex
            ? reps.map((value, setIndex) =>
                setIndex === action.payload.setIndex
                  ? action.payload.value
                  : value
              )
            : reps
        ),
        repsError: null,
      };
    case "SET_REPS_ERROR":
      return { ...state, repsError: action.payload };
    case "MOVE_NEXT_ROUTINE":
      return {
        ...state,
        currentRoutineIndex: state.currentRoutineIndex + 1,
      };
    case "FINISH":
      return {
        ...state,
        finished: true,
      };
    case "SET_RECORD_ADDED":
      return {
        ...state,
        recordAdded: action.payload,
      };
    case "SET_RECORD_SAVING":
      return {
        ...state,
        recordSaving: action.payload,
      };
    case "SET_RECORD_SAVE_FAILED":
      return {
        ...state,
        recordSaveFailed: action.payload,
      };
    default:
      return state;
  }
}

const initialRunnerState: RoutineRunnerState = {
  currentRoutineIndex: 0,
  counts: [],
  setTargets: [],
  setWeights: [],
  setReps: [],
  weightError: null,
  repsError: null,
  isTimerModal: false,
  countdown: 60,
  isTimerRunning: false,
  timerEndsAt: null,
  finished: false,
  recordAdded: false,
  recordSaving: false,
  recordSaveFailed: false,
};

export function useRoutineRunner() {
  const { routineId, timer } = useLocalSearchParams<{
    routineId?: string;
    timer?: string;
  }>();
  const {
    data: routineDetail,
    isLoading,
    isError,
  } = useRoutineDetail(routineId);

  const defaultTime = useMemo(() => {
    const parsed = timer ? parseInt(timer, 10) : NaN;
    return Number.isNaN(parsed) || parsed <= 0 ? 60 : parsed;
  }, [timer]);

  const [state, dispatch] = useReducer(runnerReducer, initialRunnerState);
  const recordSaveInFlight = useRef(false);

  const {
    currentRoutineIndex,
    counts,
    setTargets,
    setWeights,
    setReps,
    weightError,
    repsError,
    isTimerModal,
    countdown,
    isTimerRunning,
    timerEndsAt,
    finished,
    recordAdded,
    recordSaving,
    recordSaveFailed,
  } = state;

  const addRecordMutation = useAddRecord();

  const totalRoutines = routineDetail?.routine?.length ?? 0;
  const currentExercise =
    totalRoutines > 0 ? routineDetail?.routine?.[currentRoutineIndex] : null;

  useEffect(() => {
    if (routineDetail?.routine?.length) {
      dispatch({
        type: "RESET",
        payload: {
          counts: routineDetail.routine.map(() => 0),
          setTargets: routineDetail.routine.map((item) => item.set),
          setWeights: routineDetail.routine.map((item) =>
            Array.from({ length: item.set }, () => item.kg.toString())
          ),
          setReps: routineDetail.routine.map((item) =>
            Array.from({ length: item.set }, () => "")
          ),
          countdown: defaultTime,
        },
      });
    }
  }, [routineDetail, defaultTime]);

  useEffect(() => {
    if (!isTimerModal || !isTimerRunning || timerEndsAt === null) {
      return;
    }

    const syncTimer = () => {
      dispatch({
        type: "SYNC_TIMER",
        payload: Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000)),
      });
    };
    syncTimer();
    const interval = setInterval(syncTimer, 1000);
    const subscription = AppState.addEventListener("change", (appState) => {
      if (appState === "active") syncTimer();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [isTimerModal, isTimerRunning, timerEndsAt]);

  useEffect(() => {
    if (isTimerModal) {
      scheduleRestTimerNotification(defaultTime).catch((error) => {
        console.error("Failed to schedule rest timer notification", error);
      });
      return;
    }

    cancelRestTimerNotifications().catch((error) => {
      console.error("Failed to cancel rest timer notifications", error);
    });
  }, [defaultTime, isTimerModal]);

  const handleSetWeightChange = useCallback(
    (value: string) => {
      if (!currentExercise || finished) return;

      dispatch({
        type: "UPDATE_SET_WEIGHT",
        payload: {
          routineIndex: currentRoutineIndex,
          setIndex: counts[currentRoutineIndex] ?? 0,
          value,
        },
      });
    }, [counts, currentExercise, currentRoutineIndex, finished]
  );

  const handleSetRepsChange = useCallback(
    (value: string) => {
      if (!currentExercise || finished) return;

      dispatch({
        type: "UPDATE_SET_REPS",
        payload: {
          routineIndex: currentRoutineIndex,
          setIndex: counts[currentRoutineIndex] ?? 0,
          value,
        },
      });
    }, [counts, currentExercise, currentRoutineIndex, finished]
  );

  const handleAddSet = useCallback(() => {
    if (!currentExercise || finished) return;

    const weights = setWeights[currentRoutineIndex] ?? [];
    dispatch({
      type: "ADD_SET",
      payload: {
        routineIndex: currentRoutineIndex,
        defaultWeight: weights.at(-1) ?? currentExercise.kg.toString(),
      },
    });
  }, [currentExercise, currentRoutineIndex, finished, setWeights]);

  const handleRemoveSet = useCallback(() => {
    if (!currentExercise || finished) return;

    dispatch({
      type: "REMOVE_SET",
      payload: {
        routineIndex: currentRoutineIndex,
        minimum: (counts[currentRoutineIndex] ?? 0) + 1,
      },
    });
  }, [counts, currentExercise, currentRoutineIndex, finished]);

  const handleUndoLastSet = useCallback(() => {
    if (finished || isTimerModal) return;

    let routineIndex = Math.min(currentRoutineIndex, counts.length - 1);
    while (routineIndex >= 0 && (counts[routineIndex] ?? 0) <= 0) {
      routineIndex -= 1;
    }
    if (routineIndex < 0) return;

    dispatch({
      type: "UNDO_LAST_SET",
      payload: {
        routineIndex,
        expectedCount: counts[routineIndex],
      },
    });
  }, [counts, currentRoutineIndex, finished, isTimerModal]);

  const handleCompleteSet = () => {
    if (!currentExercise || finished) {
      return;
    }

    const currentCount = counts[currentRoutineIndex] ?? 0;
    const currentWeightText = setWeights[currentRoutineIndex]?.[currentCount];
    const currentWeight = Number(currentWeightText);

    if (
      !currentWeightText?.trim() ||
      !Number.isFinite(currentWeight) ||
      currentWeight < 0
    ) {
      dispatch({
        type: "SET_WEIGHT_ERROR",
        payload: "0 이상의 올바른 무게를 입력해주세요.",
      });
      return;
    }

    const currentRepsText = setReps[currentRoutineIndex]?.[currentCount] ?? "";
    const currentReps = Number(currentRepsText);
    if (
      currentRepsText.trim() &&
      (!Number.isSafeInteger(currentReps) || currentReps <= 0)
    ) {
      dispatch({
        type: "SET_REPS_ERROR",
        payload: "반복 횟수는 1 이상의 정수로 입력해주세요.",
      });
      return;
    }

    const currentTarget = setTargets[currentRoutineIndex] ?? currentExercise.set;

    if (currentCount >= currentTarget) {
      return;
    }

    const isLastExercise = currentRoutineIndex === totalRoutines - 1;
    const isFinalSet = currentCount + 1 >= currentTarget;

    if (isLastExercise && isFinalSet) {
      dispatch({
        type: "INCREMENT_SET",
        payload: { index: currentRoutineIndex, max: currentTarget },
      });
      return;
    }

    dispatch({
      type: "OPEN_TIMER",
      payload: { countdown: defaultTime, endsAt: Date.now() + defaultTime * 1000 },
    });
  };

  const handleStartNextSet = useCallback(() => {
    cancelRestTimerNotifications().catch((error) => {
      console.error("Failed to cancel rest timer notifications", error);
    });

    if (!currentExercise) {
      dispatch({ type: "CLOSE_TIMER", payload: { countdown: defaultTime } });
      return;
    }

    dispatch({
      type: "START_NEXT_SET",
      payload: {
        countdown: defaultTime,
        index: currentRoutineIndex,
        max: setTargets[currentRoutineIndex] ?? currentExercise.set,
      },
    });
  }, [currentExercise, currentRoutineIndex, defaultTime, setTargets]);

  useEffect(() => {
    if (!currentExercise || finished) {
      return;
    }

    const currentCount = counts[currentRoutineIndex];
    if (typeof currentCount !== "number") {
      return;
    }

    if (
      currentCount <
      (setTargets[currentRoutineIndex] ?? currentExercise.set)
    ) {
      return;
    }

    if (currentRoutineIndex + 1 < totalRoutines) {
      dispatch({ type: "MOVE_NEXT_ROUTINE" });
    } else {
      dispatch({ type: "FINISH" });
    }
  }, [
    counts,
    currentExercise,
    currentRoutineIndex,
    setTargets,
    totalRoutines,
    finished,
  ]);

  const completedRoutine = useMemo<ICompletedRoutine | null>(() => {
    if (!routineDetail) return null;

    return {
      ...routineDetail,
      routine: routineDetail.routine.map((item, index) => ({
        ...item,
        set: setTargets[index] ?? item.set,
        setKgs: (setWeights[index] ?? []).map(Number),
        setReps: (setReps[index] ?? []).map((reps) =>
          reps.trim() ? Number(reps) : null
        ),
      })),
    };
  }, [routineDetail, setReps, setTargets, setWeights]);

  useEffect(() => {
    if (
      !finished ||
      !completedRoutine ||
      recordAdded ||
      recordSaving ||
      recordSaveFailed ||
      recordSaveInFlight.current
    ) {
      return;
    }

    recordSaveInFlight.current = true;
    dispatch({ type: "SET_RECORD_SAVING", payload: true });

    addRecordMutation
      .mutateAsync(completedRoutine)
      .then(() => {
        dispatch({ type: "SET_RECORD_ADDED", payload: true });
      })
      .catch(() => {
        dispatch({ type: "SET_RECORD_SAVE_FAILED", payload: true });
      })
      .finally(() => {
        recordSaveInFlight.current = false;
        dispatch({ type: "SET_RECORD_SAVING", payload: false });
      });
  }, [
    finished,
    completedRoutine,
    recordAdded,
    recordSaving,
    recordSaveFailed,
    addRecordMutation,
  ]);

  const handleRetrySaveRecord = useCallback(() => {
    if (!finished || !completedRoutine || recordSaving || recordAdded || recordSaveInFlight.current) {
      return;
    }

    recordSaveInFlight.current = true;
    dispatch({ type: "SET_RECORD_SAVE_FAILED", payload: false });
    dispatch({ type: "SET_RECORD_SAVING", payload: true });

    addRecordMutation
      .mutateAsync(completedRoutine)
      .then(() => {
        dispatch({ type: "SET_RECORD_ADDED", payload: true });
      })
      .catch(() => {
        dispatch({ type: "SET_RECORD_SAVE_FAILED", payload: true });
      })
      .finally(() => {
        recordSaveInFlight.current = false;
        dispatch({ type: "SET_RECORD_SAVING", payload: false });
      });
  }, [finished, completedRoutine, recordSaving, recordAdded, addRecordMutation]);

  useEffect(() => {
    if (!finished) {
      return;
    }

    cancelRestTimerNotifications().catch((error) => {
      console.error("Failed to cancel rest timer notifications", error);
    });
  }, [finished]);

  return {
    routineId,
    routineDetail,
    isLoading,
    isError,
    defaultTime,
    currentRoutineIndex,
    counts,
    setTargets,
    setWeights,
    setReps,
    weightError,
    repsError,
    finished,
    totalRoutines,
    isTimerModal,
    countdown,
    recordAdded,
    recordSaving,
    recordSaveFailed,
    handleCompleteSet,
    handleSetWeightChange,
    handleSetRepsChange,
    handleAddSet,
    handleRemoveSet,
    handleUndoLastSet,
    handleStartNextSet,
    handleRetrySaveRecord,
  };
}
