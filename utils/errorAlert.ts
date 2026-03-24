import { Alert } from "react-native";

const DEFAULT_MESSAGE = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

export function showApiErrorAlert(error: unknown, title = "요청 실패") {
  console.error(error);

  if (error instanceof Error) {
    Alert.alert(title, error.message || DEFAULT_MESSAGE);
    return;
  }

  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    Alert.alert(title, error.message || DEFAULT_MESSAGE);
    return;
  }

  Alert.alert(title, DEFAULT_MESSAGE);
}
