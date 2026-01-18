import { IRecord } from "@/interface/record";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  records: IRecord[];
};

type ChartItem = {
  category: string;
  count: number;
};

const BAR_HEIGHT = 160;
const CHART_COLOR = "#2563eb";
const TRACK_COLOR = "#e5e7eb";

export default function RecordChart({ records }: Props) {
  const chartItems = useMemo<ChartItem[]>(() => {
    if (!records.length) return [];

    const categoryMap = new Map<string, number>();
    records.forEach((record) => {
      categoryMap.set(
        record.category,
        (categoryMap.get(record.category) ?? 0) + 1
      );
    });

    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
      }))
      .sort((a, b) => (a.category > b.category ? 1 : -1));
  }, [records]);

  if (!records.length) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>차트를 표시할 기록이 없습니다.</Text>
      </View>
    );
  }

  const maxTotal = Math.max(...chartItems.map((item) => item.count), 1);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.header}>
        <Text style={styles.chartTitle}>카테고리별 수행 횟수</Text>
        <Text style={styles.chartSubtitle}>기간 내 카테고리별 총 횟수</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartRow}>
          {chartItems.map((item) => {
            const filledHeight = (item.count / maxTotal) * BAR_HEIGHT;
            return (
              <View key={item.category} style={styles.barWrapper}>
                <View style={[styles.barTrack, { height: BAR_HEIGHT }]}>
                  <View
                    style={[
                      styles.filledBar,
                      { height: filledHeight, backgroundColor: CHART_COLOR },
                    ]}
                  />
                </View>
                <Text style={styles.dateLabel}>{item.category}</Text>
                <Text style={styles.countLabel}>{item.count}회</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: "#f9fafb",
  },
  header: {
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  chartSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#6b7280",
  },
  chartRow: {
    flexDirection: "row",
    gap: 20,
    paddingVertical: 8,
  },
  barWrapper: {
    alignItems: "center",
    gap: 4,
  },
  barTrack: {
    width: 32,
    borderRadius: 12,
    backgroundColor: TRACK_COLOR,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  filledBar: {
    width: "100%",
    borderRadius: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  countLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyChart: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 13,
  },
});
