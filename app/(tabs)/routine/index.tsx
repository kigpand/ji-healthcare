import RoutineCategoryList from "@/components/routine/RoutineCategoryList";
import RoutineListContainer from "@/components/routine/RoutineListContainer";
import { useCategorySelection } from "@/hooks/useCategorySelection";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Routine() {
  const {
    categories,
    isLoading,
    isError,
    selectedCategory,
    handleChangeCategory,
  } = useCategorySelection();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "루틴" }} />
      <Text style={styles.sectionTitle}>운동 카테고리</Text>
      <RoutineCategoryList
        categories={categories}
        isLoading={isLoading}
        isError={isError}
        selectedCategory={selectedCategory}
        handleChangeCategory={handleChangeCategory}
      />

      <View style={styles.routineHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory ? `${selectedCategory.category} 루틴` : "루틴 목록"}
        </Text>
      </View>

      <RoutineListContainer selectedCategory={selectedCategory} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  routineHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
});
