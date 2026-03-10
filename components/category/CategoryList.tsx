import { useDeleteCategory } from "@/hooks/mutate/useDeleteCategory";
import type { ICategory } from "@/interface/category";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: ICategory;
};

export default function CategoryList({ item }: Props) {
  const deleteCategoryMutation = useDeleteCategory();
  const deletingCategory = deleteCategoryMutation.variables;

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (deleteCategoryMutation.isPending) {
        return;
      }

      await deleteCategoryMutation.mutateAsync(id);
    },
    [deleteCategoryMutation]
  );

  const isDeleting =
    deleteCategoryMutation.isPending && deletingCategory === item.category;

  return (
    <View style={styles.listItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          deleteCategoryMutation.isPending && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => handleDeleteCategory(item._id)}
        disabled={deleteCategoryMutation.isPending}
      >
        <Text style={styles.buttonText}>{isDeleting ? "삭제중" : "삭제"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 2,
  },
  categoryInfo: {
    flex: 1,
    paddingRight: 16,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  deleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#dc2626",
    fontWeight: "600",
  },
});
