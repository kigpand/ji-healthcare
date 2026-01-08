import { useCategory } from "@/hooks/queries/useCategory";
import { ICategory } from "@/interface/category";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  selectedCategory: ICategory | null;
  onSelectCategory: (category: ICategory) => void;
};

export default function RoutineCategorySelect({
  selectedCategory,
  onSelectCategory,
}: Props) {
  const { data: categories, isLoading, isError } = useCategory();
  const [visible, setVisible] = useState(false);

  const handleSelect = (category: ICategory) => {
    onSelectCategory(category);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        style={styles.selectButton}
        onPress={() => setVisible(true)}
        disabled={isLoading || isError || !categories?.length}
      >
        <Text style={styles.selectText}>
          {isLoading
            ? "카테고리를 불러오는 중..."
            : isError
            ? "카테고리를 불러오지 못했습니다."
            : selectedCategory?.category ?? "카테고리를 선택해주세요"}
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>카테고리 선택</Text>
            {isLoading ? (
              <ActivityIndicator />
            ) : isError ? (
              <Text>카테고리를 불러오지 못했습니다.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {categories?.map((category) => {
                  const selected = category._id === selectedCategory?._id;
                  return (
                    <Pressable
                      key={category._id}
                      style={[
                        styles.categoryItem,
                        selected && styles.categoryItemSelected,
                      ]}
                      onPress={() => handleSelect(category)}
                    >
                      <Text
                        style={[
                          styles.categoryItemText,
                          selected && styles.categoryItemTextSelected,
                        ]}
                      >
                        {category.category}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
            <Pressable
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  selectText: {
    fontSize: 16,
    color: "#111827",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  categoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryItemSelected: {
    backgroundColor: "#e0ecff",
  },
  categoryItemText: {
    paddingHorizontal: 8,
    fontSize: 16,
  },
  categoryItemTextSelected: {
    fontWeight: "700",
    color: "#2563eb",
  },
  closeButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
