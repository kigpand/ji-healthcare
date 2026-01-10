import AddRoutineCard from "@/components/add-routine/AddRoutineCard";
import RoutineCategorySelect from "@/components/add-routine/RoutineCategorySelect";
import { useAddRoutine } from "@/hooks/mutate/useAddRoutine";
import { useCategorySelection } from "@/hooks/useCategorySelection";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type RoutineSetForm = {
  title: string;
  set: string;
  kg: string;
};

export default function AddRoutineScreen() {
  const addRoutineMutation = useAddRoutine();
  const [title, setTitle] = useState<string>("");
  const {
    categories,
    isLoading: categoryLoading,
    isError: categoryError,
    selectedCategory,
    handleChangeCategory,
    resetCategorySelection,
  } = useCategorySelection();
  const [sets, setSets] = useState<RoutineSetForm[]>([
    { title: "", set: "", kg: "" },
  ]);

  const handleChangeSet = (
    index: number,
    key: keyof RoutineSetForm,
    value: string
  ) => {
    setSets((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const handleAddSet = () => {
    setSets((prev) => [...prev, { title: "", set: "", kg: "" }]);
  };

  const handleRemoveSet = (index: number) => {
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !selectedCategory?.category) {
      Alert.alert("입력 확인", "루틴 이름과 카테고리를 모두 선택해주세요.");
      return;
    }

    if (
      sets.some(
        (s) =>
          !s.title.trim() ||
          Number.isNaN(Number(s.set)) ||
          Number(s.set) <= 0 ||
          Number.isNaN(Number(s.kg))
      )
    ) {
      Alert.alert(
        "세트 정보를 확인해주세요",
        "세트 이름, 횟수, 무게를 모두 정확히 입력해주세요."
      );
      return;
    }

    try {
      await addRoutineMutation.mutateAsync({
        title: title.trim(),
        category: selectedCategory.category,
        routine: sets.map((s) => ({
          title: s.title.trim(),
          set: Number(s.set),
          kg: Number(s.kg) || 0,
        })),
      });
      Alert.alert("등록 완료", "새로운 루틴이 추가되었습니다.");
      setTitle("");
      resetCategorySelection();
      setSets([{ title: "", set: "", kg: "" }]);
    } catch (error) {
      console.error(error);
      Alert.alert(`등록 실패", "루틴을 추가하는데 실패했습니다`);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "루틴 추가" }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>루틴 이름</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="예: 상체 루틴"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>카테고리</Text>
          <RoutineCategorySelect
            selectedCategory={selectedCategory}
            categories={categories}
            isLoading={categoryLoading}
            isError={categoryError}
            onSelectCategory={handleChangeCategory}
          />
        </View>

        <Text style={styles.sectionTitle}>세트 구성</Text>
        {sets.map((set, index) => (
          <AddRoutineCard
            key={index}
            index={index}
            sets={sets}
            set={set}
            handleChangeSet={handleChangeSet}
            handleRemoveSet={handleRemoveSet}
          />
        ))}
        <Pressable style={styles.addSetButton} onPress={handleAddSet}>
          <Text style={styles.addSetText}>세트 추가</Text>
        </Pressable>

        <Pressable
          style={[
            styles.submitButton,
            addRoutineMutation.isPending && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={addRoutineMutation.isPending}
        >
          <Text style={styles.submitText}>
            {addRoutineMutation.isPending ? "등록 중..." : "루틴 등록"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
  },

  addSetButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addSetText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
