import { StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
};

export default function DashboardCard({ label, value }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
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
