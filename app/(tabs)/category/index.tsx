import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function Cateogry() {
  return (
    <View>
      <Stack.Screen options={{ title: "카테고리" }} />
      <Text>category</Text>
    </View>
  );
}
