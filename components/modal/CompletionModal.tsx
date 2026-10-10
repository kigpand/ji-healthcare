import ModalContainer from "@/components/modal/ModalContainer";
import { useRecordExitGuard } from "@/hooks/useRecordExitGuard";
import type { ICompletedRoutine } from "@/interface/record";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  recordAdded: boolean;
  recordSaving: boolean;
  recordSaveFailed: boolean;
  saveConfirmed: boolean;
  summary: ICompletedRoutine | null;
  onConfirmSave: () => void;
  onEditLastSet: () => void;
  onRetrySaveRecord: () => void;
};

export default function CompletionModal({
  visible,
  recordAdded,
  recordSaving,
  recordSaveFailed,
  saveConfirmed,
  summary,
  onConfirmSave,
  onEditLastSet,
  onRetrySaveRecord,
}: Props) {
  const { handleGoHome, isHomeDisabled } = useRecordExitGuard({
    visible,
    recordAdded,
    recordSaving,
    recordSaveFailed,
  });

  function renderStatus() {
    if (recordSaving) {
      return (
        <View style={styles.statusBox}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.statusText}>운동 기록을 저장하는 중입니다.</Text>
        </View>
      );
    }

    if (recordSaveFailed) {
      return (
        <View style={[styles.statusBox, styles.statusBoxError]}>
          <Text style={styles.statusErrorTitle}>기록 저장에 실패했습니다.</Text>
          <Text style={styles.statusErrorText}>
            홈으로 이동하기 전에 다시 저장해 주세요.
          </Text>
          <Pressable style={styles.retryButton} onPress={onRetrySaveRecord}>
            <Text style={styles.retryButtonText}>다시 저장</Text>
          </Pressable>
        </View>
      );
    }

    if (recordAdded) {
      return (
        <View style={[styles.statusBox, styles.statusBoxSuccess]}>
          <Text style={styles.statusSuccessText}>
            오늘 운동 기록이 정상적으로 저장되었습니다.
          </Text>
        </View>
      );
    }

    return null;
  }

  return (
    <ModalContainer
      visible={visible}
      title={saveConfirmed ? "운동 완료!" : "운동 기록 확인"}
      onClose={handleGoHome}
      constrainHeight
      footer={
        saveConfirmed ? (
          <Pressable
            accessibilityRole="button"
            style={[styles.button, isHomeDisabled && styles.buttonDisabled]}
            onPress={handleGoHome}
            disabled={isHomeDisabled}
            accessibilityState={{ disabled: isHomeDisabled }}
          >
            <Text style={styles.buttonText}>홈으로 이동</Text>
          </Pressable>
        ) : undefined
      }
    >
      {saveConfirmed ? (
        <ScrollView
          testID="completion-status"
          style={styles.summaryScroll}
          contentContainerStyle={styles.summaryContent}
        >
          <Text style={styles.description}>
            오늘의 운동을 잘 마쳤어요. 홈으로 돌아가 다음 운동을 준비해볼까요?
          </Text>
          {renderStatus()}
        </ScrollView>
      ) : (
        <ScrollView
          testID="completion-summary"
          style={styles.summaryScroll}
          contentContainerStyle={styles.summaryContent}
        >
          <Text style={styles.description}>
            저장하기 전에 오늘 수행한 세트별 기록을 확인해 주세요.
          </Text>
          {summary?.routine.map((item, itemIndex) => (
            <View key={`${item.title}-${itemIndex}`} style={styles.summaryItem}>
              <Text style={styles.summaryTitle}>
                {itemIndex + 1}. {item.title}
              </Text>
              {item.setKgs.map((kg, setIndex) => (
                <Text key={setIndex} style={styles.summarySet}>
                  {setIndex + 1}세트 · {kg}kg
                  {item.setReps[setIndex] === null
                    ? ""
                    : ` · ${item.setReps[setIndex]}회`}
                </Text>
              ))}
            </View>
          ))}
          <View testID="completion-review-actions" style={styles.reviewActions}>
            <Pressable
              accessibilityRole="button"
              style={[styles.button, styles.reviewButton, styles.editButton]}
              onPress={onEditLastSet}
            >
              <Text
                style={[
                  styles.buttonText,
                  styles.reviewButtonText,
                  styles.editButtonText,
                ]}
              >
                마지막 세트 수정
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={[styles.button, styles.reviewButton]}
              onPress={onConfirmSave}
            >
              <Text style={[styles.buttonText, styles.reviewButtonText]}>
                기록 저장
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 22,
  },
  statusBox: {
    marginTop: 8,
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    gap: 8,
  },
  statusBoxSuccess: {
    backgroundColor: "#ecfdf5",
  },
  statusBoxError: {
    backgroundColor: "#fef2f2",
  },
  statusText: {
    fontSize: 14,
    color: "#1e3a8a",
    fontWeight: "600",
    textAlign: "center",
  },
  statusSuccessText: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "600",
    textAlign: "center",
  },
  statusErrorTitle: {
    fontSize: 15,
    color: "#b91c1c",
    fontWeight: "700",
    textAlign: "center",
  },
  statusErrorText: {
    fontSize: 14,
    color: "#7f1d1d",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: "#dc2626",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    borderRadius: 10,
    backgroundColor: "#2563eb",
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 20,
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
  },
  reviewButton: {
    maxWidth: "100%",
    flexShrink: 1,
  },
  reviewButtonText: {
    flexShrink: 1,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#e5e7eb",
  },
  editButtonText: {
    color: "#111827",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  summaryScroll: {
    flexShrink: 1,
  },
  summaryContent: {
    gap: 12,
  },
  summaryItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  summarySet: {
    color: "#4b5563",
    lineHeight: 20,
  },
});
