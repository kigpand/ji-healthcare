import { Alert } from "react-native";
import { ApiError } from "@/utils/apiClient";

const DEFAULT_MESSAGE = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

export function showApiErrorAlert(error: unknown, title = "요청 실패") {
  console.error(error);

  if (error instanceof ApiError) {
    Alert.alert(title, error.message);
    return;
  }

  if (error instanceof Error) {
    Alert.alert(title, error.message || DEFAULT_MESSAGE);
    return;
  }

  Alert.alert(title, DEFAULT_MESSAGE);
}
