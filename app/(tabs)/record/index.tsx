import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function Record() {
  return (
    <View>
      <Stack.Screen options={{ title: "기록" }} />
      <Text>record</Text>
    </View>
  );
}
