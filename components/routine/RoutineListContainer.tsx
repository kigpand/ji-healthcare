import { useRoutine } from "@/hooks/queries/useRoutine";
import { ICategory } from "@/interface/category";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  selectedCategory: ICategory | null;
};

export default function RoutineListContainer({ selectedCategory }: Props) {
  const {
    data: routines,
    isLoading: routineLoading,
    isError: routineError,
  } = useRoutine(selectedCategory?._id);

  if (routineLoading) return <ActivityIndicator />;

  if (routineError) return <Text>루틴을 불러오지 못했습니다.</Text>;

  return (
    <FlatList
      data={routines ?? []}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.routineCard}>
          <Text style={styles.routineTitle}>{item.title}</Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <Text style={styles.emptyText}>등록된 루틴이 없습니다.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  routineCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  separator: {
    height: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 24,
  },
});
