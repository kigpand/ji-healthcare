import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  modalVisible: boolean;
  initialValue: number;
  handleConfirmRestTime: (timer: string) => void;
  onClose?: () => void;
};

export default function TimerModal({
  modalVisible,
  initialValue,
  handleConfirmRestTime,
  onClose,
}: Props) {
  const [time, setTime] = useState<string>(initialValue.toString());

  useEffect(() => {
    if (modalVisible) {
      setTime(initialValue.toString());
    }
  }, [modalVisible, initialValue]);

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>휴식 시간을 설정하세요</Text>
          <Text style={styles.modalDescription}>
            한 세트 사이에 쉴 시간을 초 단위로 입력해주세요.
          </Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            keyboardType="number-pad"
            style={styles.input}
            placeholder="초 단위 입력"
          />
          <Pressable
            style={styles.confirmButton}
            onPress={() => handleConfirmRestTime(time)}
          >
            <Text style={styles.buttonText}>확인</Text>
          </Pressable>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>취소</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 4,
    backgroundColor: "#ff6d6d",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
