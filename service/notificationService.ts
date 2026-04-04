import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

const REST_TIMER_NOTIFICATION_TYPE = "rest-timer";
const WORKOUT_REMINDER_NOTIFICATION_TYPE = "workout-reminder";
const DEFAULT_REMINDER_HOUR = 20;
const DEFAULT_REMINDER_MINUTE = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function configureNotifications() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "기본 알림",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestNotificationPermission() {
  const permissions = await Notifications.getPermissionsAsync();

  if (permissions.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleRestTimerNotification(seconds: number) {
  if (seconds <= 0) {
    return null;
  }

  const granted = await requestNotificationPermission();

  if (!granted) {
    return null;
  }

  await cancelRestTimerNotifications();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "휴식이 끝났습니다",
      body: "다음 세트를 시작할 시간입니다.",
      data: { type: REST_TIMER_NOTIFICATION_TYPE },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });
}

export async function cancelRestTimerNotifications() {
  await cancelNotificationsByType(REST_TIMER_NOTIFICATION_TYPE);
}

export async function scheduleDailyWorkoutReminder() {
  const granted = await requestNotificationPermission();

  if (!granted) {
    Alert.alert(
      "알림 권한 필요",
      "운동 리마인더를 사용하려면 기기 알림 권한을 허용해 주세요."
    );
    return false;
  }

  await cancelWorkoutReminderNotifications();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "오늘 운동하실 시간입니다",
      body: "짧게라도 루틴을 시작해서 흐름을 이어가세요.",
      data: { type: WORKOUT_REMINDER_NOTIFICATION_TYPE },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: DEFAULT_REMINDER_HOUR,
      minute: DEFAULT_REMINDER_MINUTE,
    },
  });

  return true;
}

export async function cancelWorkoutReminderNotifications() {
  await cancelNotificationsByType(WORKOUT_REMINDER_NOTIFICATION_TYPE);
}

export async function hasScheduledWorkoutReminder() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  return scheduled.some(
    (item) => item.content.data?.type === WORKOUT_REMINDER_NOTIFICATION_TYPE
  );
}

async function cancelNotificationsByType(type: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const matchingIds = scheduled
    .filter((item) => item.content.data?.type === type)
    .map((item) => item.identifier);

  await Promise.all(
    matchingIds.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier)
    )
  );
}
