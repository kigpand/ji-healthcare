import { RANGE_OPTIONS } from "@/constants/dateOption";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  selectedRange: number;
  handleChangeSelectedRange: (selected: number) => void;
};

export default function DateButton({
  selectedRange,
  handleChangeSelectedRange,
}: Props) {
  return (
    <View style={styles.filterRow}>
      {RANGE_OPTIONS.map((option) => {
        const isSelected = option.value === selectedRange;
        return (
          <Pressable
            key={option.value}
            style={[
              styles.filterButton,
              isSelected && styles.filterButtonSelected,
            ]}
            onPress={() => handleChangeSelectedRange(option.value)}
          >
            <Text
              style={[
                styles.filterText,
                isSelected && styles.filterTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterButton: {
    width: "48%",
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 8,
  },
  filterButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  filterTextSelected: {
    color: "#fff",
  },
});
