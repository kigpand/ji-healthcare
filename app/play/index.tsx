import CountdownModal from "@/components/modal/CountdownModal";
import PlayCard from "@/components/play/PlayCard";
import { useRoutineDetail } from "@/hooks/queries/useRoutine";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Play() {
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

  const [currentRoutineIndex, setCurrentRoutineIndex] = useState(0);
  const [counts, setCounts] = useState<number[]>([]);
  const [isTimerModal, setIsTimerModal] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(defaultTime);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const totalRoutines = routineDetail?.routine?.length ?? 0;
  const currentExercise =
    totalRoutines > 0 ? routineDetail?.routine?.[currentRoutineIndex] : null;

  useEffect(() => {
    if (routineDetail?.routine?.length) {
      setCounts(routineDetail.routine.map(() => 0));
      setCurrentRoutineIndex(0);
      setFinished(false);
    }
  }, [routineDetail]);

  useEffect(() => {
    if (!isTimerModal || !isTimerRunning) {
      return;
    }

    if (countdown <= 0) {
      setIsTimerRunning(false);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
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

    setCountdown(defaultTime);
    setIsTimerModal(true);
    setIsTimerRunning(true);
  };

  const handleStartNextSet = useCallback(() => {
    if (!currentExercise) {
      setIsTimerModal(false);
      return;
    }

    setIsTimerModal(false);
    setCountdown(defaultTime);
    setIsTimerRunning(false);

    setCounts((prev) => {
      if (!prev.length) return prev;
      const updated = [...prev];
      updated[currentRoutineIndex] = Math.min(
        (updated[currentRoutineIndex] ?? 0) + 1,
        currentExercise.set
      );

      const updatedCount = updated[currentRoutineIndex];
      if (updatedCount >= currentExercise.set) {
        if (currentRoutineIndex + 1 < totalRoutines) {
          setCurrentRoutineIndex((idx) => idx + 1);
        } else {
          setFinished(true);
        }
      }

      return updated;
    });
  }, [currentExercise, currentRoutineIndex, defaultTime, totalRoutines]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !routineDetail) {
    return (
      <View style={styles.center}>
        <Text>루틴 정보를 불러오지 못했습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "시작" }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{routineDetail.title}</Text>
        <Text style={styles.subtitle}>세트 사이 휴식: {defaultTime}초</Text>

        {routineDetail.routine.map((routine, index) => {
          return (
            <PlayCard
              key={`${routine.title}-${index}`}
              index={index}
              counts={counts}
              routine={routine}
              finished={finished}
              currentRoutineIndex={currentRoutineIndex}
              totalRoutines={totalRoutines}
              handleCompleteSet={handleCompleteSet}
            />
          );
        })}
      </ScrollView>

      <CountdownModal
        visible={isTimerModal}
        seconds={countdown}
        onStartNext={handleStartNextSet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
  },
});
