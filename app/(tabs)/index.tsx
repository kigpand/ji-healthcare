import { PATH } from "@/constants/path";
import { Stack, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: "운동 기록" }} />

      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>오늘의 루틴</Text>
        </View>
        <Text style={styles.heroTitle}>꾸준함이 최고의 운동입니다</Text>
        <Text style={styles.heroSubtitle}>
          지금 바로 루틴을 확인하고 나만의 운동 기록을 채워보세요.
        </Text>
      </View>

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

type ButtonProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

function HomeButton({ title, subtitle, onPress }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
      <Text style={styles.buttonSubText}>{subtitle}</Text>
    </TouchableOpacity>
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
  grid: {
    marginTop: 24,
    gap: 16,
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
  },
  button: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
  },
  buttonSubText: {
    marginTop: 6,
    color: "#6b7280",
    fontSize: 14,
  },
});
