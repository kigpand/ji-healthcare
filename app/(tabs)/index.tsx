import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "운동 기록" }} />

      <Text style={styles.title}>운동 기록</Text>
      <Text style={styles.subText}>오늘도 한 번 달려볼까요?</Text>

      <View style={styles.grid}>
        {/* <HomeButton
          title="📘 운동 루틴"
          onPress={() => router.push("(tabs)/routine")}
        /> */}
        {/* <HomeButton
          title="📅 최근 운동"
          onPress={() => router.push("/recent")}
        />
        <HomeButton
          title="📂 카테고리"
          onPress={() => router.push("/categories")}
        /> */}
      </View>
    </View>
  );
}

function HomeButton({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  grid: {
    marginTop: 12,
    gap: 16,
  },
  button: {
    padding: 20,
    backgroundColor: "#f2f2f2",
    borderRadius: 14,
    alignItems: "flex-start",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
  },
});
