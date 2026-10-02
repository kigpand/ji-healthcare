import ModalContainer from "@/components/modal/ModalContainer";
import { PATH } from "@/constants/path";
import { useRecordDetail } from "@/hooks/queries/useRecord";
import { IRecord } from "@/interface/record";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  selectedRecord: IRecord | null;
  handleChangeRecord: (record: IRecord | null) => void;
};

export default function RecordCardModal({
  selectedRecord,
  handleChangeRecord,
}: Props) {
  const router = useRouter();
  const detailQuery = useRecordDetail(selectedRecord?._id);
  const detail = detailQuery.data;

  return (
    <ModalContainer
      visible={!!selectedRecord}
      onClose={() => handleChangeRecord(null)}
      title="운동 기록 상세"
      footer={
        <View style={styles.modalButtons}>
          <Pressable
            style={[styles.modalButton, styles.modalCancel]}
            onPress={() => handleChangeRecord(null)}
          >
            <Text style={styles.modalButtonText}>닫기</Text>
          </Pressable>
          {selectedRecord?.routineId ? (
            <Pressable
              style={[styles.modalButton, styles.modalConfirm]}
              onPress={() => {
                router.push({
                  pathname: PATH.play,
                  params: {
                    routineId: selectedRecord.routineId.toString(),
                  },
                });
                handleChangeRecord(null);
              }}
            >
              <Text style={[styles.modalButtonText, styles.modalConfirmText]}>
                이 루틴 다시 시작
              </Text>
            </Pressable>
          ) : null}
        </View>
      }
    >
      <Text style={styles.recordTitle}>{selectedRecord?.title ?? ""}</Text>
      <Text style={styles.recordMeta}>
        {[
          selectedRecord?.category,
          selectedRecord?.date
            ? format(new Date(selectedRecord.date), "yyyy.MM.dd HH:mm")
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </Text>

      {detailQuery.isLoading ? (
        <ActivityIndicator accessibilityLabel="운동 기록 상세 불러오는 중" />
      ) : detailQuery.isError ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>
            운동 상세 기록을 불러오지 못했습니다.
          </Text>
          <Pressable onPress={() => detailQuery.refetch()}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : detail?.items.length ? (
        <ScrollView style={styles.itemList}>
          {detail.items.map((item, index) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemTitle}>
                {index + 1}. {item.title}
              </Text>
              <Text style={styles.itemValue}>
                {item.set}세트 · {item.kg}kg
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.feedbackText}>
          상세 운동 항목이 없는 이전 기록입니다.
        </Text>
      )}
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
  recordTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  recordMeta: {
    fontSize: 14,
    color: "#6b7280",
  },
  itemList: {
    maxHeight: 280,
  },
  itemRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemValue: {
    marginTop: 4,
    color: "#4b5563",
  },
  feedback: {
    alignItems: "center",
    gap: 8,
  },
  feedbackText: {
    color: "#6b7280",
  },
  retryText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalCancel: {
    backgroundColor: "#e5e7eb",
  },
  modalConfirm: {
    backgroundColor: "#2563eb",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  modalConfirmText: {
    color: "#fff",
  },
});
