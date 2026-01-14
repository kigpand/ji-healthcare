import { useAddRecord } from "@/hooks/mutate/useAddRecord";
import { useRoutineDetail } from "@/hooks/queries/useRoutine";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useReducer } from "react";

type RoutineRunnerState = {
  currentRoutineIndex: number;
  counts: number[];
  isTimerModal: boolean;
  countdown: number;
  isTimerRunning: boolean;
  finished: boolean;
  recordAdded: boolean;
};

type RoutineRunnerAction =
  | { type: "RESET"; payload: { countdown: number; counts: number[] } }
  | { type: "OPEN_TIMER"; payload: { countdown: number } }
  | { type: "CLOSE_TIMER"; payload: { countdown: number } }
  | { type: "TICK" }
  | { type: "SET_RUNNING"; payload: boolean }
  | { type: "INCREMENT_SET"; payload: { index: number; max: number } }
  | { type: "MOVE_NEXT_ROUTINE" }
  | { type: "FINISH" }
  | { type: "SET_RECORD_ADDED"; payload: boolean };

function runnerReducer(state: RoutineRunnerState, action: RoutineRunnerAction) {
  switch (action.type) {
    case "RESET":
      return {
        currentRoutineIndex: 0,
        counts: action.payload.counts,
        isTimerModal: false,
        countdown: action.payload.countdown,
        isTimerRunning: false,
        finished: false,
        recordAdded: false,
      };
    case "OPEN_TIMER":
      return {
        ...state,
        isTimerModal: true,
        isTimerRunning: true,
        countdown: action.payload.countdown,
      };
    case "CLOSE_TIMER":
      return {
        ...state,
        isTimerModal: false,
        isTimerRunning: false,
        countdown: action.payload.countdown,
      };
    case "TICK":
      return {
        ...state,
        countdown: state.countdown > 0 ? state.countdown - 1 : 0,
      };
    case "SET_RUNNING":
      return {
        ...state,
        isTimerRunning: action.payload,
      };
    case "INCREMENT_SET":
      return {
        ...state,
        counts: state.counts.map((count, idx) =>
          idx === action.payload.index
            ? Math.min(count + 1, action.payload.max)
            : count,
        ),
      };
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
    default:
      return state;
  }
}

const initialRunnerState: RoutineRunnerState = {
  currentRoutineIndex: 0,
  counts: [],
  isTimerModal: false,
  countdown: 60,
  isTimerRunning: false,
  finished: false,
  recordAdded: false,
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

  const {
    currentRoutineIndex,
    counts,
    isTimerModal,
    countdown,
    isTimerRunning,
    finished,
    recordAdded,
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
          countdown: defaultTime,
        },
      });
    }
  }, [routineDetail, defaultTime]);

  useEffect(() => {
    if (!isTimerModal || !isTimerRunning) {
      return;
    }

    if (countdown <= 0) {
      dispatch({ type: "SET_RUNNING", payload: false });
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerModal, isTimerRunning, countdown]);

  const handleCompleteSet = () => {
    if (!currentExercise || finished) {
      return;
    }

    if (counts[currentRoutineIndex] >= currentExercise.set) {
      return;
    }

    dispatch({ type: "OPEN_TIMER", payload: { countdown: defaultTime } });
  };

  const handleStartNextSet = useCallback(() => {
    if (!currentExercise) {
      dispatch({ type: "CLOSE_TIMER", payload: { countdown: defaultTime } });
      return;
    }

    dispatch({ type: "CLOSE_TIMER", payload: { countdown: defaultTime } });
    dispatch({
      type: "INCREMENT_SET",
      payload: { index: currentRoutineIndex, max: currentExercise.set },
    });

    const updatedCount =
      counts[currentRoutineIndex] + 1 >= currentExercise.set
        ? currentExercise.set
        : counts[currentRoutineIndex] + 1;

    if (updatedCount >= currentExercise.set) {
      if (currentRoutineIndex + 1 < totalRoutines) {
        dispatch({ type: "MOVE_NEXT_ROUTINE" });
      } else {
        dispatch({ type: "FINISH" });
      }
    }
  }, [currentExercise, currentRoutineIndex, defaultTime, totalRoutines]);

  useEffect(() => {
    if (finished && routineDetail && !recordAdded) {
      addRecordMutation.mutate(routineDetail);
      dispatch({ type: "SET_RECORD_ADDED", payload: true });
    }
  }, [finished, routineDetail, recordAdded, addRecordMutation]);

  return {
    routineId,
    routineDetail,
    isLoading,
    isError,
    defaultTime,
    currentRoutineIndex,
    counts,
    finished,
    totalRoutines,
    isTimerModal,
    countdown,
    handleCompleteSet,
    handleStartNextSet,
  };
}
