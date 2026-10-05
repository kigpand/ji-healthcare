import { ReactNode } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  constrainHeight?: boolean;
};

export default function ModalContainer({
  visible,
  title,
  children,
  footer,
  onClose,
  constrainHeight = false,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          testID="modal-content"
          style={[
            styles.content,
            constrainHeight && styles.contentConstrained,
          ]}
        >
          {title && <Text style={styles.title}>{title}</Text>}
          <View
            testID="modal-body"
            style={[styles.body, constrainHeight && styles.bodyConstrained]}
          >
            {children}
          </View>
          {footer}
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
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    gap: 12,
  },
  contentConstrained: {
    maxHeight: "90%",
  },
  bodyConstrained: {
    flexShrink: 1,
  },
});
