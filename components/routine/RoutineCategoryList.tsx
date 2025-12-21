import { useCategory } from "@/hooks/queries/useCategory";
import { ICategory } from "@/interface/category";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  selectedCategoryId: ICategory | null;
  handleChangeCategory: (category: ICategory) => void;
};

export default function RoutineCategoryList({
  selectedCategoryId,
  handleChangeCategory,
}: Props) {
  const {
    data: categories,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useCategory();

  useEffect(() => {
    if (!selectedCategoryId && categories?.length) {
      handleChangeCategory(categories[0]);
    }
  }, [categories, selectedCategoryId, handleChangeCategory]);

  if (categoryLoading) return <ActivityIndicator />;

  if (categoryError) return <Text>카테고리를 불러오지 못했습니다.</Text>;

  return (
    <View style={styles.categoryWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {categories?.map((category) => {
          const isSelected = category._id === selectedCategoryId?._id;
          return (
            <Pressable
              key={category._id}
              style={[
                styles.categoryButton,
                isSelected && styles.categoryButtonSelected,
              ]}
              onPress={() => handleChangeCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                ]}
              >
                {category.category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryWrapper: {
    height: 48,
    justifyContent: "center",
  },
  categoryList: {
    paddingRight: 12,
    alignItems: "center",
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    marginRight: 12,
  },
  categoryButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  categoryText: {
    fontSize: 12,
    color: "#374151",
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});
