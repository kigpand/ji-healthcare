import { useRoutineDetail } from "@/hooks/queries/useRoutine";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Record() {
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const { data: routineDetail } = useRoutineDetail(routineId);
  console.log(routineId);

  useEffect(() => {
    console.log(routineDetail);
  }, [routineDetail]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "시작" }} />
      <Text style={styles.title}>루틴 시작</Text>
      {routineId ? (
        <Text style={styles.subtitle}>루틴 ID: {routineId}</Text>
      ) : (
        <Text style={styles.subtitle}>루틴을 선택해주세요.</Text>
      )}
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
});
