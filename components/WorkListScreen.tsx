import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  memo: string;
};

type Props = {
  /** 저장 버튼 눌렀을 때 운동 리스트를 상위에서 받는 콜백 */
  onSave?: (exercises: Exercise[]) => void;
};

export default function WorkoutListScreen({ onSave }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "1",
      name: "",
      sets: "",
      reps: "",
      weight: "",
      memo: "",
    },
  ]);

  const handleChangeField = (
    id: string,
    field: keyof Exercise,
    value: string
  ) => {
    setExercises((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleAddExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        sets: "",
        reps: "",
        weight: "",
        memo: "",
      },
    ]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    // 간단 검증: 이름이 하나도 없는 경우 경고
    const hasAtLeastOneName = exercises.some((ex) => ex.name.trim().length > 0);
    if (!hasAtLeastOneName) {
      Alert.alert("알림", "최소 한 개 이상의 운동 이름을 입력해주세요.");
      return;
    }

    onSave?.(exercises);
    Alert.alert("저장 완료", "운동 기록이 저장되었습니다.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>오늘의 운동 기록</Text>
        <Text style={styles.subtitle}>운동을 추가하고 저장해보세요.</Text>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>운동 {index + 1}</Text>
              <Pressable
                hitSlop={8}
                onPress={() => handleRemoveExercise(item.id)}
                disabled={exercises.length === 1}
                style={({ pressed }) => [
                  styles.deleteButton,
                  exercises.length === 1 && styles.deleteButtonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.deleteText}>
                  {exercises.length === 1 ? "고정" : "삭제"}
                </Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="운동 이름 (예: 벤치프레스)"
              value={item.name}
              onChangeText={(text) => handleChangeField(item.id, "name", text)}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.rowInput]}
                placeholder="세트"
                keyboardType="numeric"
                value={item.sets}
                onChangeText={(text) =>
                  handleChangeField(item.id, "sets", text)
                }
              />
              <TextInput
                style={[styles.input, styles.rowInput]}
                placeholder="회수"
                keyboardType="numeric"
                value={item.reps}
                onChangeText={(text) =>
                  handleChangeField(item.id, "reps", text)
                }
              />
              <TextInput
                style={[styles.input, styles.rowInput]}
                placeholder="중량(kg)"
                keyboardType="numeric"
                value={item.weight}
                onChangeText={(text) =>
                  handleChangeField(item.id, "weight", text)
                }
              />
            </View>

            <TextInput
              style={[styles.input, styles.memoInput]}
              placeholder="메모 (선택: RPE, 폼 느낌 등)"
              value={item.memo}
              onChangeText={(text) => handleChangeField(item.id, "memo", text)}
              multiline
            />
          </View>
        )}
        ListFooterComponent={
          <Pressable
            onPress={handleAddExercise}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.addButtonText}>+ 운동 추가</Text>
          </Pressable>
        }
      />

      <View style={styles.footer}>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.saveButtonText}>저장하기</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteText: {
    fontSize: 12,
    color: "#b91c1c",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#f9fafb",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  rowInput: {
    flex: 1,
  },
  memoInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  addButton: {
    marginTop: 4,
    marginBottom: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  addButtonText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
