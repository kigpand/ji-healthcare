import AddCategory from "@/components/category/AddCategory";
import CategoryList from "@/components/category/CategoryList";
import { useCategory } from "@/hooks/queries/useCategory";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Category() {
  const { data: categories, isLoading, isError } = useCategory();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "카테고리" }} />
      <AddCategory />
      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator />
        ) : isError ? (
          <Text>카테고리를 불러오지 못했습니다.</Text>
        ) : (
          <FlatList
            data={categories ?? []}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              return <CategoryList item={item} />;
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>등록된 카테고리가 없습니다.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
  emptyText: {
    marginTop: 32,
    textAlign: "center",
    color: "#6b7280",
  },
});
