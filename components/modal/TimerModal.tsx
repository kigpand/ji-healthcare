import ModalContainer from "@/components/modal/ModalContainer";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
    <ModalContainer
      visible={modalVisible}
      onClose={onClose}
      title="휴식 시간을 설정하세요"
      footer={
        <View style={styles.bottomButtons}>
          <Pressable style={[styles.button, styles.cancel]} onPress={onClose}>
            <Text style={[styles.buttonText, styles.cancelText]}>취소</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.confirm]}
            onPress={() => handleConfirmRestTime(time)}
          >
            <Text style={styles.buttonText}>확인</Text>
          </Pressable>
        </View>
      }
    >
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
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
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
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirm: {
    backgroundColor: "#2563eb",
  },
  cancel: {
    backgroundColor: "#e5e7eb",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cancelText: {
    color: "#111827",
  },
});
