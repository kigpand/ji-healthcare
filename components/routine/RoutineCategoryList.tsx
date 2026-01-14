import { ICategory } from "@/interface/category";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  categories: ICategory[];
  isLoading: boolean;
  isError: boolean;
  selectedCategory: ICategory | null;
  handleChangeCategory: (category: ICategory) => void;
};

export default function RoutineCategoryList({
  categories,
  isLoading,
  isError,
  selectedCategory,
  handleChangeCategory,
}: Props) {
  if (isLoading) return <ActivityIndicator />;

  if (isError) return <Text>카테고리를 불러오지 못했습니다.</Text>;

  return (
    <View style={styles.categoryWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {categories?.map((category) => {
          const isSelected = category._id === selectedCategory?._id;
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
