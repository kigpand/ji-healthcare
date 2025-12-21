import RoutineCategoryList from "@/components/routine/RoutineCategoryList";
import RoutineListContainer from "@/components/routine/RoutineListContainer";
import { ICategory } from "@/interface/category";
import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Routine() {
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "루틴" }} />
      <Text style={styles.sectionTitle}>운동 카테고리</Text>
      <RoutineCategoryList
        selectedCategoryId={selectedCategory}
        handleChangeCategory={setSelectedCategory}
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
