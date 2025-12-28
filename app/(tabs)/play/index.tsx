import { useRoutineDetail } from "@/hooks/queries/useRoutine";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Play() {
  const { routineId, timer } = useLocalSearchParams<{
    routineId?: string;
    timer?: string;
  }>();
  const { data: routineDetail } = useRoutineDetail(routineId);
  const parsingTimer = timer ? parseInt(timer, 10) : undefined;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "시작" }} />
      <Text style={styles.title}>루틴 시작</Text>
      {routineId ? (
        <>
          <Text style={styles.subtitle}>루틴 ID: {routineId}</Text>
          {routineDetail?.title && (
            <Text style={styles.subtitle}>루틴명: {routineDetail.title}</Text>
          )}
        </>
      ) : (
        <Text style={styles.subtitle}>루틴을 선택해주세요.</Text>
      )}
      <Text style={styles.restText}>세트 사이 휴식: {parsingTimer}초</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
  restText: {
    fontSize: 16,
    color: "#2563eb",
    marginTop: 12,
    fontWeight: "600",
  },
});
