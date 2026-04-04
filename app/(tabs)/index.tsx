import DashboardCard from "@/components/home/DashboardCard";
import HomeButton from "@/components/home/HomeButton";
import RecentRecordSection from "@/components/home/RecentRecordSection";
import { PATH } from "@/constants/path";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import {
  cancelWorkoutReminderNotifications,
  hasScheduledWorkoutReminder,
  scheduleDailyWorkoutReminder,
} from "@/service/notificationService";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { isLoading, isError, dashboard } = useHomeDashboard();
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [isReminderLoading, setIsReminderLoading] = useState(true);

  useEffect(() => {
    loadReminderState().catch((error) => {
      console.error("Failed to load reminder state", error);
    });
  }, []);

  function handleOpenRecord(range?: number) {
    if (!range) {
      router.navigate(PATH.record);
      return;
    }

    router.push({
      pathname: PATH.record,
      params: { range: range.toString() },
    });
  }

  async function loadReminderState() {
    try {
      const enabled = await hasScheduledWorkoutReminder();
      setIsReminderEnabled(enabled);
    } catch (error) {
      console.error("Failed to read scheduled workout reminders", error);
      setIsReminderEnabled(false);
    } finally {
      setIsReminderLoading(false);
    }
  }

  async function handleToggleReminder() {
    setIsReminderLoading(true);

    try {
      if (isReminderEnabled) {
        await cancelWorkoutReminderNotifications();
        setIsReminderEnabled(false);
        return;
      }

      const scheduled = await scheduleDailyWorkoutReminder();
      setIsReminderEnabled(scheduled);
    } catch (error) {
      console.error("Failed to toggle workout reminder", error);
      Alert.alert(
        "리마인더 설정 실패",
        "운동 리마인더를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setIsReminderLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: "운동 기록" }} />

      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>홈 대시보드</Text>
        </View>
        <Text style={styles.heroTitle}>오늘의 흐름을 한눈에 확인하세요</Text>
        <Text style={styles.heroSubtitle}>
          최근 기록, 이번 주 운동 횟수, 자주 하는 카테고리를 바로 볼 수
          있습니다.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.loadingText}>
            대시보드 데이터를 불러오는 중입니다.
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.loadingCard}>
          <Text style={styles.errorTitle}>대시보드를 불러오지 못했습니다.</Text>
          <Text style={styles.loadingText}>
            잠시 후 다시 시도해 주세요.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <DashboardCard
              label="연속 운동일"
              value={`${dashboard.currentStreak}일`}
              onPress={() => handleOpenRecord()}
            />
            <DashboardCard
              label="최근 7일 운동"
              value={`${dashboard.weeklyCount}회`}
              onPress={() => handleOpenRecord(7)}
            />
            <DashboardCard
              label="주요 카테고리"
              value={dashboard.topCategory ?? "데이터 없음"}
              onPress={() => handleOpenRecord(30)}
            />
            <DashboardCard
              label="등록된 루틴"
              value={`${dashboard.routineCount}개`}
              onPress={() => router.navigate(PATH.routine)}
            />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>현재 앱 현황</Text>
            <Text style={styles.summaryText}>
              최근 운동일은 {dashboard.lastWorkoutDate ?? "아직 없습니다"}.
            </Text>
            <Text style={styles.summaryText}>
              카테고리 {dashboard.categoryCount}개, 루틴{" "}
              {dashboard.routineCount}개가 등록되어 있습니다.
            </Text>
            <Text style={styles.summaryText}>
              최근 30일 기준 가장 자주 수행한 카테고리는{" "}
              {dashboard.topCategory ?? "아직 없습니다"}.
            </Text>
          </View>

          <RecentRecordSection records={dashboard.recentRecords} />

          <View style={styles.reminderCard}>
            <View style={styles.reminderTextWrapper}>
              <Text style={styles.reminderTitle}>매일 운동 리마인더</Text>
              <Text style={styles.reminderDescription}>
                매일 오후 8시에 운동 시작 알림을 보냅니다.
              </Text>
            </View>
            <Pressable
              style={[
                styles.reminderButton,
                isReminderEnabled && styles.reminderButtonActive,
                isReminderLoading && styles.reminderButtonDisabled,
              ]}
              onPress={() => {
                handleToggleReminder().catch((error) => {
                  console.error("Unexpected reminder toggle failure", error);
                });
              }}
              disabled={isReminderLoading}
              accessibilityRole="button"
              accessibilityLabel="운동 리마인더 토글"
            >
              <Text
                style={[
                  styles.reminderButtonText,
                  isReminderEnabled && styles.reminderButtonTextActive,
                ]}
              >
                {isReminderLoading
                  ? "확인 중..."
                  : isReminderEnabled
                    ? "켜짐"
                    : "켜기"}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      <View style={styles.grid}>
        <HomeButton
          title="운동 루틴"
          subtitle="카테고리별 루틴을 확인하세요"
          onPress={() => router.navigate(PATH.routine)}
        />
        <HomeButton
          title="최근 운동"
          subtitle="최근 기록을 빠르게 복습"
          onPress={() => router.navigate(PATH.record)}
        />
        <HomeButton
          title="카테고리"
          subtitle="운동 분류를 간편하게 관리"
          onPress={() => router.navigate(PATH.category)}
        />
        <HomeButton
          title="루틴 추가"
          subtitle="나만의 맞춤 루틴을 구성"
          onPress={() => router.navigate(PATH.addRoutine)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 24,
    paddingBottom: 32,
    gap: 24,
  },
  hero: {
    width: "100%",
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    gap: 16,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeText: {
    color: "#60a5fa",
    fontWeight: "600",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#cbd5f5",
    fontSize: 16,
    lineHeight: 24,
  },
  loadingCard: {
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCard: {
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
  reminderCard: {
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  reminderTextWrapper: {
    gap: 6,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  reminderDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
  reminderButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#dbeafe",
  },
  reminderButtonActive: {
    backgroundColor: "#2563eb",
  },
  reminderButtonDisabled: {
    opacity: 0.7,
  },
  reminderButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  reminderButtonTextActive: {
    color: "#fff",
  },
  grid: {
    marginTop: 8,
    gap: 16,
  },
});
