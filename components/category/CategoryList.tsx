import { useDeleteCategory } from "@/hooks/mutate/useDeleteCategory";
import { useSetCategoryArchived } from "@/hooks/mutate/useSetCategoryArchived";
import type { ICategory } from "@/interface/category";
import { showToast } from "@/utils/showToast";
import { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: ICategory;
  archived?: boolean;
};

export default function CategoryList({ item, archived = false }: Props) {
  const deleteCategoryMutation = useDeleteCategory();
  const archiveMutation = useSetCategoryArchived();
  const deletingCategory = deleteCategoryMutation.variables;

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (deleteCategoryMutation.isPending) {
        return;
      }

      await deleteCategoryMutation.mutateAsync(id);
      showToast("카테고리가 삭제되었습니다.");
    },
    [deleteCategoryMutation]
  );

  const isDeleting =
    deleteCategoryMutation.isPending && deletingCategory === item.id;
  const isArchiving =
    archiveMutation.isPending && archiveMutation.variables?.id === item.id;
  const isPending = deleteCategoryMutation.isPending || archiveMutation.isPending;

  const handleArchive = useCallback(async () => {
    if (isPending) return;
    await archiveMutation.mutateAsync({ id: item.id, archived: !archived });
    showToast(`카테고리가 ${archived ? "복원" : "보관"}되었습니다.`);
  }, [archiveMutation, archived, isPending, item.id]);

  return (
    <View style={styles.listItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryText}>{item.name}</Text>
        <Text style={styles.categoryStatus}>{archived ? "보관됨" : "사용 중"}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.archiveButton,
            isPending && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            handleArchive().catch((error) => {
              console.error("Failed to update category archive state", error);
            });
          }}
          disabled={isPending}
        >
          <Text style={styles.archiveButtonText}>
            {isArchiving ? "처리중" : archived ? "복원" : "보관"}
          </Text>
        </Pressable>
        {archived ? (
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              isPending && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={() =>
              Alert.alert("카테고리 삭제", "정말 삭제하시겠습니까?", [
                {
                  text: "아니오",
                  style: "cancel",
                },
                {
                  text: "예",
                  style: "destructive",
                  onPress: () => {
                    handleDeleteCategory(item.id).catch((error) => {
                      console.error("Failed to delete category", error);
                    });
                  },
                },
              ])
            }
            disabled={isPending}
          >
            <Text style={styles.buttonText}>
              {isDeleting ? "삭제중" : "삭제"}
            </Text>
          </Pressable>
        ) : null}
      </View>
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
  },
  categoryStatus: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  archiveButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#dbeafe",
  },
  archiveButtonText: {
    color: "#1d4ed8",
    fontWeight: "600",
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
