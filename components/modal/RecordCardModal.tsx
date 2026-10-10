import ModalContainer from "@/components/modal/ModalContainer";
import { PATH } from "@/constants/path";
import { useDeleteRecord } from "@/hooks/mutate/useDeleteRecord";
import { useRecordDetail } from "@/hooks/queries/useRecord";
import { IRecord } from "@/interface/record";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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
  const { width, fontScale } = useWindowDimensions();
  const detailQuery = useRecordDetail(selectedRecord?._id);
  const deleteRecordMutation = useDeleteRecord();
  const deletePhaseRef = useRef<"idle" | "confirming" | "deleting">("idle");
  const detail = detailQuery.data;
  const compactActions = width < 500 || fontScale > 1.2;
  const isDeleting = deleteRecordMutation.isPending;

  function handleDeleteRecord() {
    if (!selectedRecord || isDeleting || deletePhaseRef.current !== "idle") {
      return;
    }

    deletePhaseRef.current = "confirming";
    const recordId = selectedRecord._id;

    Alert.alert(
      "운동 기록 삭제",
      "이 기록과 세트별 상세 내역을 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
          onPress: () => {
            deletePhaseRef.current = "idle";
          },
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            if (deletePhaseRef.current !== "confirming") return;
            deletePhaseRef.current = "deleting";
            deleteRecordMutation
              .mutateAsync(recordId)
              .then(() => handleChangeRecord(null))
              .catch((error) => {
                console.error("Failed to delete workout record", error);
              })
              .finally(() => {
                deletePhaseRef.current = "idle";
              });
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          if (deletePhaseRef.current === "confirming") {
            deletePhaseRef.current = "idle";
          }
        },
      }
    );
  }

  function handleClose() {
    if (isDeleting || deletePhaseRef.current !== "idle") return;
    handleChangeRecord(null);
  }

  return (
    <ModalContainer
      visible={!!selectedRecord}
      onClose={handleClose}
      title="운동 기록 상세"
      constrainHeight
    >
      <ScrollView
        testID="record-detail-body"
        style={styles.recordBody}
        contentContainerStyle={styles.recordBodyContent}
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
          <View>
            {detail.items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemTitle}>
                  {index + 1}. {item.title}
                </Text>
                <Text style={styles.itemValue}>
                  {item.sets?.length ? "계획: " : ""}
                  {item.set}세트 · {item.kg}kg
                </Text>
                {item.sets?.length ? (
                  <Text style={styles.setValues}>
                    {item.sets
                      .map(
                        (set) =>
                          `${set.setNumber}세트 ${set.kg}kg${
                            set.reps === null ? "" : ` · ${set.reps}회`
                          }`
                      )
                      .join(" / ")}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.feedbackText}>
            상세 운동 항목이 없는 이전 기록입니다.
          </Text>
        )}
        <View
          testID="record-detail-actions"
          style={[
            styles.modalButtons,
            compactActions && styles.modalButtonsCompact,
          ]}
        >
          <Pressable
            style={[
              styles.modalButton,
              styles.modalCancel,
              compactActions && styles.modalButtonCompact,
              isDeleting && styles.modalButtonDisabled,
            ]}
            onPress={handleClose}
            disabled={isDeleting}
          >
            <Text style={styles.modalButtonText}>
              {isDeleting ? "삭제 중" : "닫기"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.modalButton,
              styles.modalDelete,
              compactActions && styles.modalButtonCompact,
              isDeleting && styles.modalButtonDisabled,
            ]}
            onPress={handleDeleteRecord}
            disabled={isDeleting}
          >
            <Text style={[styles.modalButtonText, styles.modalDeleteText]}>
              기록 삭제
            </Text>
          </Pressable>
          {selectedRecord?.routineId ? (
            <Pressable
              style={[
                styles.modalButton,
                styles.modalConfirm,
                compactActions && styles.modalButtonCompact,
                isDeleting && styles.modalButtonDisabled,
              ]}
              onPress={() => {
                if (isDeleting || deletePhaseRef.current !== "idle") return;
                router.push({
                  pathname: PATH.play,
                  params: {
                    routineId: selectedRecord.routineId.toString(),
                  },
                });
                handleChangeRecord(null);
              }}
              disabled={isDeleting}
            >
              <Text style={[styles.modalButtonText, styles.modalConfirmText]}>
                이 루틴 다시 시작
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
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
  recordBody: {
    flexShrink: 1,
  },
  recordBodyContent: {
    gap: 12,
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
  setValues: {
    marginTop: 4,
    color: "#2563eb",
    lineHeight: 20,
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
    maxWidth: "100%",
  },
  modalButtonsCompact: {
    flexDirection: "column",
  },
  modalButtonCompact: {
    alignItems: "center",
  },
  modalCancel: {
    backgroundColor: "#e5e7eb",
  },
  modalConfirm: {
    backgroundColor: "#2563eb",
  },
  modalDelete: {
    backgroundColor: "#fee2e2",
  },
  modalDeleteText: {
    color: "#dc2626",
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  modalConfirmText: {
    color: "#fff",
  },
});
