import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  label: string;
  value: string;
  onPress?: () => void;
};

export default function DashboardCard({ label, value, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        onPress && styles.cardInteractive,
        pressed && onPress && styles.cardPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardInteractive: {
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
});
