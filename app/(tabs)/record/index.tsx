import RecordCardModal from "@/components/modal/RecordCardModal";
import DateButton from "@/components/record/DateButton";
import RecordCard from "@/components/record/RecordCard";
import { RANGE_OPTIONS } from "@/constants/dateOption";
import { useRecord } from "@/hooks/queries/useRecord";
import { IRecord } from "@/interface/record";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Record() {
  const [selectedRange, setSelectedRange] = useState<number>(
    RANGE_OPTIONS[0].value
  );
  const [selectedRecord, setSelectedRecord] = useState<IRecord | null>(null);
  const { data: record, isLoading, isError } = useRecord(selectedRange);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "기록" }} />
      <Text style={styles.title}>최근 운동 기록</Text>
      <DateButton
        selectedRange={selectedRange}
        handleChangeSelectedRange={setSelectedRange}
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : isError ? (
        <Text style={styles.message}>기록을 불러오지 못했습니다.</Text>
      ) : (
        <FlatList
          data={record ?? []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RecordCard record={item} onPress={() => setSelectedRecord(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.message}>아직 기록이 없습니다.</Text>
          }
          contentContainerStyle={
            !record?.length ? styles.emptyContainer : undefined
          }
        />
      )}
      <RecordCardModal
        selectedRecord={selectedRecord}
        handleChangeRecord={setSelectedRecord}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  separator: {
    height: 12,
  },
  message: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
