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
      <TextInput
        style={styles.input}
        value={newCategory}
        onChangeText={setNewCategory}
        placeholder="카테고리 이름"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={handleAddCategory}
      />
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
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    marginLeft: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
