import AddRoutineCard from "@/components/add-routine/AddRoutineCard";
import RoutineCategorySelect from "@/components/add-routine/RoutineCategorySelect";
import { useAddRoutineViewModel } from "@/hooks/useAddRoutineViewModel";
import { Stack } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AddRoutineScreen() {
  const {
    categories,
    categoryLoading,
    categoryError,
    selectedCategory,
    handleChangeCategory,
    title,
    sets,
    isSubmitting,
    handleChangeTitle,
    handleChangeSet,
    handleAddSet,
    handleRemoveSet,
    handleSubmit,
  } = useAddRoutineViewModel();

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
            onChangeText={handleChangeTitle}
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
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "등록 중..." : "루틴 등록"}
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
