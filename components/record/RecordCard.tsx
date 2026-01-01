import { IRecord } from "@/interface/record";
import { format } from "date-fns";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  record: IRecord;
};

export default function RecordCard({ record }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{record.title}</Text>
      <Text style={styles.cardCategory}>{record.category}</Text>
      <Text style={styles.cardDate}>
        {format(new Date(record.date), "yyyy.MM.dd HH:mm")}
      </Text>
    </View>
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
});
