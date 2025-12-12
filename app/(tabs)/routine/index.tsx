import { Stack } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const categories = [
  { id: "chest", name: "가슴" },
  { id: "back", name: "등" },
  { id: "shoulder", name: "어깨" },
  { id: "legs", name: "하체" },
  { id: "arms", name: "팔" },
];

export default function Routine() {
  return (
    <View style={{ flex: 1, paddingTop: 60, padding: 20 }}>
      <Stack.Screen options={{ title: "루틴" }} />

      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 20 }}>
        운동 카테고리
      </Text>

      {categories.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={{
            padding: 16,
            backgroundColor: "#dddddd",
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>{c.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
