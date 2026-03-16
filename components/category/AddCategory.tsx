import AddCategoryModal from "@/components/modal/AddCategoryModal";
import { useAddCategory } from "@/hooks/mutate/useAddCategory";
import { validateCategoryRequestInput } from "@/schema/category.schema";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function AddCategory() {
  const addCategoryMutation = useAddCategory();
  const [newCategory, setNewCategory] = useState("");
  const [visible, setVisible] = useState(false);

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
    setVisible(false);
  }, [addCategoryMutation, newCategory]);

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.triggerButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => setVisible(true)}
      >
        <View style={styles.triggerAccent}>
          <Text style={styles.triggerAccentText}>+</Text>
        </View>
        <View style={styles.triggerCopy}>
          <Text style={styles.triggerEyebrow}>NEW CATEGORY</Text>
          <Text style={styles.triggerTitle}>카테고리 등록</Text>
          <Text style={styles.triggerDescription}>
            버튼을 눌러 새 운동 분류를 추가하세요.
          </Text>
        </View>
      </Pressable>

      <AddCategoryModal
        visible={visible}
        value={newCategory}
        isPending={addCategoryMutation.isPending}
        onChangeText={setNewCategory}
        onClose={() => setVisible(false)}
        onSubmit={handleAddCategory}
      />
    </>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: "#2563eb",
    padding: 18,
    shadowColor: "#1d4ed8",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 4,
    marginTop: 4,
  },
  triggerAccent: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  triggerAccentText: {
    color: "#ffffff",
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "700",
  },
  triggerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  triggerEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "rgba(219,234,254,0.95)",
    marginBottom: 4,
  },
  triggerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  triggerDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#dbeafe",
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
