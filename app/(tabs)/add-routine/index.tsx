import AddRoutineCard from "@/components/add-routine/AddRoutineCard";
import RoutineCategorySelect from "@/components/add-routine/RoutineCategorySelect";
import { useAddRoutine } from "@/hooks/mutate/useAddRoutine";
import { useCategorySelection } from "@/hooks/useCategorySelection";
import { RoutineSetForm, useRoutineForm } from "@/hooks/useRoutineForm";
import { validateRoutineRequestInput } from "@/schema/routine.schema";
import { Stack } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AddRoutineScreen() {
  const addRoutineMutation = useAddRoutine();
  const {
    categories,
    isLoading: categoryLoading,
    isError: categoryError,
    selectedCategory,
    handleChangeCategory,
    resetCategorySelection,
  } = useCategorySelection();
  const { state: formState, dispatch } = useRoutineForm();
  const { title, sets } = formState;

  const handleChangeSet = (
    index: number,
    key: keyof RoutineSetForm,
    value: string,
    options?: { numeric?: boolean }
  ) => {
    const sanitized = options?.numeric ? value.replace(/[^0-9]/g, "") : value;
    dispatch({ type: "UPDATE_SET", index, key, value: sanitized });
  };

  const handleAddSet = () => dispatch({ type: "ADD_SET" });
  const handleRemoveSet = (index: number) =>
    dispatch({ type: "REMOVE_SET", index });

  const resetForm = () => {
    dispatch({ type: "RESET" });
    resetCategorySelection();
  };

  const handleSubmit = async () => {
    const validated = validateRoutineRequestInput({
      title,
      category: selectedCategory?.category,
      routine: sets,
    });

    if (!validated.success) {
      Alert.alert("입력 확인", validated.messages ?? "입력값을 확인해주세요.");
      return;
    }

    await addRoutineMutation.mutateAsync(validated.data);
    Alert.alert("등록 완료", "새로운 루틴이 추가되었습니다.");
    resetForm();
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
            onChangeText={(text) =>
              dispatch({ type: "SET_TITLE", payload: text })
            }
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
            key={`set-${index}`}
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
