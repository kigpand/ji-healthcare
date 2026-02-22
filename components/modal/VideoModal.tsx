import ModalContainer from "@/components/modal/ModalContainer";
import { getYoutubeEmbedUrl } from "@/utils/youtube";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  visible: boolean;
  link?: string | null;
  onClose: () => void;
};

export default function VideoModal({ visible, link, onClose }: Props) {
  const embedUrl = getYoutubeEmbedUrl(link ?? undefined);

  return (
    <ModalContainer
      visible={visible}
      onClose={onClose}
      title="운동 영상"
      footer={
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>닫기</Text>
        </Pressable>
      }
    >
      {!embedUrl ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            영상을 불러올 수 없습니다. 링크를 다시 확인해주세요.
          </Text>
        </View>
      ) : (
        <View style={styles.playerWrapper}>
          <WebView
            source={{ uri: embedUrl }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            style={styles.webview}
          />
        </View>
      )}
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
  playerWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  messageBox: {
    paddingVertical: 20,
    alignItems: "center",
  },
  messageText: {
    fontSize: 14,
    color: "#374151",
  },
  closeButton: {
    alignSelf: "center",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  closeText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
