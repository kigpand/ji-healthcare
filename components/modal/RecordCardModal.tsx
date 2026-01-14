import ModalContainer from "@/components/modal/ModalContainer";
import { PATH } from "@/constants/path";
import { IRecord } from "@/interface/record";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  selectedRecord: IRecord | null;
  handleChangeRecord: (record: IRecord | null) => void;
};

export default function RecordCardModal({
  selectedRecord,
  handleChangeRecord,
}: Props) {
  const router = useRouter();

  return (
    <ModalContainer
      visible={!!selectedRecord}
      onClose={() => handleChangeRecord(null)}
      title="이 운동을 다시 시작할까요?"
      footer={
        <View style={styles.modalButtons}>
          <Pressable
            style={[styles.modalButton, styles.modalCancel]}
            onPress={() => handleChangeRecord(null)}
          >
            <Text style={styles.modalButtonText}>아니오</Text>
          </Pressable>
          <Pressable
            style={[styles.modalButton, styles.modalConfirm]}
            onPress={() => {
              if (selectedRecord?.routineId) {
                router.push({
                  pathname: PATH.play,
                  params: {
                    routineId: selectedRecord._id.toString(),
                  },
                });
              }
              handleChangeRecord(null);
            }}
          >
            <Text style={[styles.modalButtonText, styles.modalConfirmText]}>
              예
            </Text>
          </Pressable>
        </View>
      }
    >
      <Text style={styles.modalSubtitle}>{selectedRecord?.title ?? ""}</Text>
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
  modalSubtitle: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
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
