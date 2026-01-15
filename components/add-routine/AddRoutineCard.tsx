import { RoutineSetForm } from "@/hooks/useRoutineForm";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  index: number;
  sets: RoutineSetForm[];
  set: RoutineSetForm;
  handleChangeSet: (
    index: number,
    key: keyof RoutineSetForm,
    value: string,
    options?: { numeric?: boolean },
  ) => void;
  handleRemoveSet: (idx: number) => void;
};

export default function AddRoutineCard({
  index,
  sets,
  set,
  handleChangeSet,
  handleRemoveSet,
}: Props) {
  return (
    <View style={styles.setCard}>
      <View style={styles.setHeader}>
        <Text style={styles.setTitle}>세트 {index + 1}</Text>
        {sets.length > 1 && (
          <Pressable onPress={() => handleRemoveSet(index)}>
            <Text style={styles.removeText}>삭제</Text>
          </Pressable>
        )}
      </View>
      <TextInput
        style={styles.input}
        value={set.title}
        onChangeText={(text) => handleChangeSet(index, "title", text)}
        placeholder="운동 이름"
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          value={set.set}
          onChangeText={(text) =>
            handleChangeSet(index, "set", text, { numeric: true })
          }
          placeholder="세트 수"
          keyboardType="number-pad"
          inputMode="numeric"
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          value={set.kg}
          onChangeText={(text) =>
            handleChangeSet(index, "kg", text, { numeric: true })
          }
          placeholder="무게 (kg)"
          keyboardType="number-pad"
          inputMode="numeric"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  setCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  removeText: {
    color: "#dc2626",
    fontSize: 14,
  },
  setHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  setTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowInput: {
    flex: 1,
  },
});
