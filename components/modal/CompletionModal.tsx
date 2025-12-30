import { PATH } from "@/constants/path";
import { useRouter } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
};

export default function CompletionModal({ visible }: Props) {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace(PATH.home);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>운동 완료!</Text>
          <Text style={styles.description}>
            오늘의 운동을 잘 마쳤어요. 홈으로 돌아가 다음 운동을 준비해볼까요?
          </Text>
          <Pressable style={styles.button} onPress={handleGoHome}>
            <Text style={styles.buttonText}>홈으로 이동</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    borderRadius: 10,
    backgroundColor: "#2563eb",
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

