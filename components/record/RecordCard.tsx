import { IRecord } from "@/interface/record";
import { format } from "date-fns";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  record: IRecord;
  onPress?: () => void;
};

export default function RecordCard({ record, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.cardTitle}>{record.title}</Text>
      <Text style={styles.cardCategory}>{record.category}</Text>
      <Text style={styles.cardDate}>
        {format(new Date(record.date), "yyyy.MM.dd HH:mm")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardCategory: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },
  cardDate: {
    marginTop: 8,
    fontSize: 12,
    color: "#9ca3af",
  },
  pressed: {
    opacity: 0.85,
  },
});
