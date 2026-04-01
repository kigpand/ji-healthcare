import type { IRecord } from "@/interface/record";
import { formatRecordDate } from "@/utils/date";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  records: IRecord[];
};

export default function RecentRecordSection({ records }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>최근 운동 기록</Text>
      {records.length ? (
        records.map((record) => (
          <View key={record._id} style={styles.recordCard}>
            <View style={styles.recordMeta}>
              <Text style={styles.recordTitle}>{record.title}</Text>
              <Text style={styles.recordCategory}>
                {record.category || "미분류"}
              </Text>
            </View>
            <Text style={styles.recordDate}>
              {formatRecordDate(record.date)}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>아직 최근 기록이 없습니다.</Text>
          <Text style={styles.emptyText}>
            루틴을 실행하면 이 영역에 최근 운동 기록이 표시됩니다.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  recordMeta: {
    flex: 1,
    gap: 4,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  recordCategory: {
    fontSize: 13,
    color: "#64748b",
  },
  recordDate: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  emptyCard: {
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
  },
});
