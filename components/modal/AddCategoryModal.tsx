import ModalContainer from "@/components/modal/ModalContainer";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  visible: boolean;
  value: string;
  isPending: boolean;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function AddCategoryModal({
  visible,
  value,
  isPending,
  onChangeText,
  onClose,
  onSubmit,
}: Props) {
  return (
    <ModalContainer
      visible={visible}
      title="카테고리 추가"
      onClose={onClose}
      footer={
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onClose}
          >
            <Text style={styles.secondaryButtonText}>닫기</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              (isPending || !value.trim()) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={onSubmit}
            disabled={isPending || !value.trim()}
          >
            <Text style={styles.buttonText}>
              {isPending ? "추가중" : "추가"}
            </Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.form}>
        <Text style={styles.helperText}>
          운동 루틴을 더 쉽게 분류할 수 있게 이름을 추가하세요.
        </Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="예: 하체, 스트레칭, 유산소"
          placeholderTextColor="#94a3b8"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </View>
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbe4f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f8fbff",
    fontSize: 15,
    color: "#0f172a",
  },
  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 15,
  },
  addButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
