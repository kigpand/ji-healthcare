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
        setWeights: string[][];
        setReps: string[][];
      };
    }
  | { type: "OPEN_TIMER"; payload: { countdown: number; endsAt: number } }
  | { type: "CLOSE_TIMER"; payload: { countdown: number } }
  | { type: "SYNC_TIMER"; payload: number }
  | { type: "INCREMENT_SET"; payload: { index: number; max: number } }
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
      return;
    }

    cancelRestTimerNotifications().catch((error) => {
      console.error("Failed to cancel rest timer notifications", error);
    });
  }, [isTimerModal]);

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

    if (currentCount >= currentExercise.set) {
      return;
    }

    const isLastExercise = currentRoutineIndex === totalRoutines - 1;
    const isFinalSet = currentCount + 1 >= currentExercise.set;

    if (isLastExercise && isFinalSet) {
      dispatch({
        type: "INCREMENT_SET",
        payload: { index: currentRoutineIndex, max: currentExercise.set },
      });
      return;
    }

    dispatch({
      type: "OPEN_TIMER",
      payload: { countdown: defaultTime, endsAt: Date.now() + defaultTime * 1000 },
    });
    scheduleRestTimerNotification(defaultTime).catch((error) => {
      console.error("Failed to schedule rest timer notification", error);
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

    dispatch({ type: "CLOSE_TIMER", payload: { countdown: defaultTime } });
    dispatch({
      type: "INCREMENT_SET",
      payload: { index: currentRoutineIndex, max: currentExercise.set },
    });
  }, [currentExercise, currentRoutineIndex, defaultTime]);

  useEffect(() => {
    if (!currentExercise || finished) {
      return;
    }

    const currentCount = counts[currentRoutineIndex];
    if (typeof currentCount !== "number") {
      return;
    }

    if (currentCount < currentExercise.set) {
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
    totalRoutines,
    finished,
  ]);

  const completedRoutine = useMemo<ICompletedRoutine | null>(() => {
    if (!routineDetail) return null;

    return {
      ...routineDetail,
      routine: routineDetail.routine.map((item, index) => ({
        ...item,
        setKgs: (setWeights[index] ?? []).map(Number),
        setReps: (setReps[index] ?? []).map((reps) =>
          reps.trim() ? Number(reps) : null
        ),
      })),
    };
  }, [routineDetail, setReps, setWeights]);

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
    handleStartNextSet,
    handleRetrySaveRecord,
  };
}
