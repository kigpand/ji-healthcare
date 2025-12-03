import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import { Button, StyleSheet, View } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View
        style={styles.layout}
        accessible={true}
        accessibilityLabel="앱 관련 기능 메뉴"
        accessibilityHint="운동을 시작하거나 최근 기록을 확인할 수 있습니다"
      >
        <Button title="운동 시작" accessibilityLabel="운동을 시작하기" />
        <Button title="운동 기록" accessibilityLabel="나의 운동 기록 보기" />
        <Button title="최근 기록" accessibilityLabel="최근 운동 기록 보기" />
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});
