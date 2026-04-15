import ModalContainer from "@/components/modal/ModalContainer";
import { PATH } from "@/constants/path";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  recordAdded: boolean;
  recordSaving: boolean;
  recordSaveFailed: boolean;
  onRetrySaveRecord: () => void;
};

export default function CompletionModal({
  visible,
  recordAdded,
  recordSaving,
  recordSaveFailed,
  onRetrySaveRecord,
}: Props) {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace(PATH.home);
  };

  const isHomeDisabled = recordSaving;

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
      title="운동 완료!"
      onClose={handleGoHome}
      footer={
        <Pressable
          style={[styles.button, isHomeDisabled && styles.buttonDisabled]}
          onPress={handleGoHome}
          disabled={isHomeDisabled}
        >
          <Text style={styles.buttonText}>홈으로 이동</Text>
        </Pressable>
      }
    >
      <Text style={styles.description}>
        오늘의 운동을 잘 마쳤어요. 홈으로 돌아가 다음 운동을 준비해볼까요?
      </Text>
      {renderStatus()}
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
