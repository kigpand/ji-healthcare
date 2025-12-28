import TimerModal from "@/components/modal/TimerModal";
import { PATH } from "@/constants/path";
import { useRoutine } from "@/hooks/queries/useRoutine";
import { ICategory } from "@/interface/category";
import { IRoutineInfo } from "@/interface/routine";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  selectedCategory: ICategory | null;
};

export default function RoutineListContainer({ selectedCategory }: Props) {
  const router = useRouter();
  const {
    data: routines,
    isLoading: routineLoading,
    isError: routineError,
  } = useRoutine(selectedCategory?.category);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<IRoutineInfo | null>(
    null
  );
  const [timer, setTimer] = useState(60);

  if (routineLoading) return <ActivityIndicator />;

  if (routineError) return <Text>루틴을 불러오지 못했습니다.</Text>;

  function handleRoutineStart(item: IRoutineInfo) {
    setSelectedRoutine(item);
    setModalVisible(true);
  }

  function handleConfirmRestTime(time: string) {
    const parsed = parseInt(time, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert(
        "휴식 시간을 확인해주세요",
        "1초 이상의 숫자를 입력해주세요."
      );
      return;
    }

    if (!selectedRoutine) {
      setModalVisible(false);
      return;
    }

    setTimer(parsed);
    setModalVisible(false);
    router.push({
      pathname: PATH.play,
      params: {
        routineId: selectedRoutine.id.toString(),
        timer: parsed.toString(),
      },
    });
    setSelectedRoutine(null);
  }

  function handleCloseModal() {
    setModalVisible(false);
    setSelectedRoutine(null);
  }

  return (
    <>
      <FlatList
        data={routines?.routines ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.routineCard}>
            <Text style={styles.routineTitle}>{item.title}</Text>
            <TouchableOpacity onPress={() => handleRoutineStart(item)}>
              <Text style={styles.routineStartButton}>시작</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>등록된 루틴이 없습니다.</Text>
        }
      />

      <TimerModal
        modalVisible={modalVisible}
        initialValue={timer}
        handleConfirmRestTime={handleConfirmRestTime}
        onClose={handleCloseModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  routineCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  routineStartButton: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: 8,
    borderRadius: 6,
  },
  separator: {
    height: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 24,
  },
});
