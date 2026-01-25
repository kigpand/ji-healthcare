import { useAddCategory } from "@/hooks/mutate/useAddCategory";
import { useCallback, useState } from "react";
import {
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
    const trimmed = newCategory.trim();
    if (!trimmed || addCategoryMutation.isPending) {
      return;
    }

    await addCategoryMutation.mutateAsync(trimmed);
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
