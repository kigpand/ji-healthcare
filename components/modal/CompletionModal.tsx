import ModalContainer from "@/components/modal/ModalContainer";
import { PATH } from "@/constants/path";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  visible: boolean;
};

export default function CompletionModal({ visible }: Props) {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace(PATH.home);
  };

  return (
    <ModalContainer
      visible={visible}
      title="운동 완료!"
      onClose={handleGoHome}
      footer={
        <Pressable style={styles.button} onPress={handleGoHome}>
          <Text style={styles.buttonText}>홈으로 이동</Text>
        </Pressable>
      }
    >
      <Text style={styles.description}>
        오늘의 운동을 잘 마쳤어요. 홈으로 돌아가 다음 운동을 준비해볼까요?
      </Text>
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
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
