import { PATH } from "@/constants/path";
import { IRecord } from "@/interface/record";
import { useRouter } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

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
    <Modal
      visible={!!selectedRecord}
      transparent
      animationType="fade"
      onRequestClose={() => handleChangeRecord(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>이 운동을 다시 시작할까요?</Text>
          <Text style={styles.modalSubtitle}>
            {selectedRecord?.title ?? ""}
          </Text>
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
                if (selectedRecord?.id != null) {
                  router.push({
                    pathname: PATH.play,
                    params: {
                      routineId: selectedRecord.id.toString(),
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
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
