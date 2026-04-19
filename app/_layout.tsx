import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "react-native-reanimated";

import Header from "@/components/layout/Header";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initializeDatabase } from "@/lib/database";
import { configureNotifications } from "@/service/notificationService";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  useEffect(() => {
    configureNotifications().catch((error) => {
      console.error("Failed to configure notifications", error);
    });
  }, []);

  useEffect(() => {
    initializeDatabase()
      .then(() => {
        setIsDatabaseReady(true);
      })
      .catch((error) => {
        console.error("Failed to initialize database", error);
        setDatabaseError(
          "로컬 데이터를 준비하지 못했습니다. 앱을 다시 실행해주세요."
        );
      });
  }, []);

  if (databaseError) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>앱 초기화 실패</Text>
          <Text style={styles.feedbackText}>{databaseError}</Text>
        </View>
      </ThemeProvider>
    );
  }

  if (!isDatabaseReady) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={styles.feedbackContainer}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.feedbackText}>로컬 데이터를 준비하는 중입니다.</Text>
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <Header />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  feedbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  feedbackText: {
    marginTop: 10,
    textAlign: "center",
    color: "#64748b",
    lineHeight: 20,
  },
});
