import { PATH } from "@/constants/path";
import { useRoutine } from "@/hooks/queries/useRoutine";
import { ICategory } from "@/interface/category";
import { IRoutine } from "@/interface/routine";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  selectedCategory: ICategory | null;
};

export default function RoutineListContainer({ selectedCategory }: Props) {
  const router = useRouter();
  const {
    data: routines,
    isLoading: routineLoading,
    isError: routineError,
  } = useRoutine(selectedCategory?._id);

  if (routineLoading) return <ActivityIndicator />;

  if (routineError) return <Text>루틴을 불러오지 못했습니다.</Text>;

  function handleRoutineStart(item: IRoutine) {
    router.push({
      pathname: PATH.play,
      params: { routineId: item.id.toString() },
    });
  }

  return (
    <FlatList
      data={routines ?? []}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.routineCard}>
          <Text style={styles.routineTitle}>{item.title}</Text>
          <TouchableOpacity onPress={() => handleRoutineStart(item)}>
            <Text style={styles.routineStartButton}>시작</Text>
          </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  routineStartButton: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: 8,
    borderRadius: 6,
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
