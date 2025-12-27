import TimerModal from "@/components/modal/TimerModal";
import { useRoutineDetail } from "@/hooks/queries/useRoutine";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function Play() {
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const { data: routineDetail } = useRoutineDetail(routineId);
  const [timer, setTimer] = useState(60);
  const [modalVisible, setModalVisible] = useState(true);

  const handleConfirmRestTime = (time: string) => {
    const parsed = parseInt(time, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert(
        "휴식 시간을 확인해주세요",
        "1초 이상의 숫자를 입력해주세요."
      );
      return;
    }
    setTimer(parsed);
    setModalVisible(false);
  };

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
      <Text style={styles.restText}>세트 사이 휴식: {timer}초</Text>
      <TimerModal
        modalVisible={modalVisible}
        handleConfirmRestTime={handleConfirmRestTime}
      />
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
