import { PATH } from "@/constants/path";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
      <View style={styles.container}>
        {!isHome ? (
          <Pressable onPress={() => router.replace(PATH.home)}>
            <Text style={styles.home}>홈</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.title}>오늘의 운동은?</Text>
        <View style={{ width: 40 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  home: {
    color: "#007AFF",
    fontSize: 16,
  },
});
