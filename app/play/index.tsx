import CompletionModal from "@/components/modal/CompletionModal";
import CountdownModal from "@/components/modal/CountdownModal";
import VideoModal from "@/components/modal/VideoModal";
import PlayCard from "@/components/play/PlayCard";
import { useRoutineRunner } from "@/hooks/useRoutineRunner";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState, useCallback } from "react";

export default function Play() {
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [videoVisible, setVideoVisible] = useState(false);

  const openVideo = useCallback((link: string) => {
    setVideoLink(link);
    setVideoVisible(true);
  }, []);

  const closeVideo = useCallback(() => {
    setVideoVisible(false);
  }, []);
  const {
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
  } = useRoutineRunner();

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
              onPressVideo={openVideo}
            />
          );
        })}
      </ScrollView>

      <CountdownModal
        visible={isTimerModal}
        seconds={countdown}
        onStartNext={handleStartNextSet}
      />
      <CompletionModal visible={finished} />
      <VideoModal visible={videoVisible} link={videoLink ?? undefined} onClose={closeVideo} />
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
