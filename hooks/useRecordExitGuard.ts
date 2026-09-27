import { PATH } from "@/constants/path";
import { useNavigation, useRouter } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { Alert } from "react-native";

type Options = {
  visible: boolean;
  recordAdded: boolean;
  recordSaving: boolean;
  recordSaveFailed: boolean;
};

export function useRecordExitGuard({
  visible,
  recordAdded,
  recordSaving,
  recordSaveFailed,
}: Options) {
  const router = useRouter();
  const navigation = useNavigation();
  const isHomeDisabled = recordSaving || (!recordAdded && !recordSaveFailed);

  usePreventRemove(visible && !recordAdded, ({ data }) => {
    if (isHomeDisabled) return;

    Alert.alert(
      "기록을 저장하지 않고 나갈까요?",
      "이번 운동 기록은 저장되지 않으며, 나가면 다시 저장할 수 없습니다.",
      [
        { text: "계속 머무르기", style: "cancel" },
        {
          text: "저장하지 않고 나가기",
          style: "destructive",
          onPress: () => navigation.dispatch(data.action),
        },
      ]
    );
  });

  const handleGoHome = () => {
    if (isHomeDisabled) return;
    router.replace(PATH.home);
  };

  return { isHomeDisabled, handleGoHome };
}
