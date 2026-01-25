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
      <Text style={styles.categoryText}>{item.category}</Text>
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
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  categoryText: {
    fontSize: 16,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#dc2626",
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
