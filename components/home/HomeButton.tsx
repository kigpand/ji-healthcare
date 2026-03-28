import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

export default function HomeButton({ title, subtitle, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
      <Text style={styles.buttonSubText}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
