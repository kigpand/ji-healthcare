import { useAddCategory } from "@/hooks/mutate/useAddCategory";
import { validateCategoryRequestInput } from "@/schema/category.schema";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AddCategory() {
  const addCategoryMutation = useAddCategory();
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = useCallback(async () => {
    if (addCategoryMutation.isPending) {
      return;
    }

    const validated = validateCategoryRequestInput({ category: newCategory });
    if (!validated.success) {
      Alert.alert("입력 확인", validated.message ?? "입력값을 확인해주세요.");
      return;
    }

    await addCategoryMutation.mutateAsync(validated.data.category);
    setNewCategory("");
  }, [addCategoryMutation, newCategory]);

  return (
    <View style={styles.form}>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>새 카테고리</Text>
        <Text style={styles.helperText}>
          운동 루틴을 더 쉽게 분류할 수 있게 이름을 추가하세요.
        </Text>
        <TextInput
          style={styles.input}
          value={newCategory}
          onChangeText={setNewCategory}
          placeholder="예: 하체, 스트레칭, 유산소"
          placeholderTextColor="#94a3b8"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleAddCategory}
        />
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          (addCategoryMutation.isPending || !newCategory.trim()) &&
            styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleAddCategory}
        disabled={addCategoryMutation.isPending || !newCategory.trim()}
      >
        <Text style={styles.buttonText}>
          {addCategoryMutation.isPending ? "추가중" : "추가"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 3,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748b",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbe4f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f8fbff",
    fontSize: 15,
    color: "#0f172a",
  },
  addButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
