import ModalContainer from "@/components/modal/ModalContainer";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  seconds: number;
  onStartNext: () => void;
};

export default function CountdownModal({
  visible,
  seconds,
  onStartNext,
}: Props) {
  const isReady = seconds <= 0;

  return (
    <ModalContainer
      visible={visible}
      title={isReady ? "휴식 완료!" : "휴식 중입니다."}
    >
      <View style={styles.content}>
        <Text style={styles.counter}>{Math.max(seconds, 0)}초</Text>
        <Text style={styles.description}>
          {isReady
            ? "시작 버튼을 눌러 다음 세트를 진행하세요."
            : "잠시 호흡을 가다듬고 다음 세트를 준비하세요."}
        </Text>
        {isReady && (
          <Pressable style={styles.startButton} onPress={onStartNext}>
            <Text style={styles.startText}>시작</Text>
          </Pressable>
        )}
      </View>
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
  },
  counter: {
    fontSize: 48,
    fontWeight: "700",
    color: "#2563eb",
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
  },
  startButton: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  startText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
