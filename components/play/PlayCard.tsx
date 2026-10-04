import type { IRoutineData } from "@/interface/routine";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  index: number;
  counts: number[];
  routine: IRoutineData;
  finished: boolean;
  currentRoutineIndex: number;
  totalRoutines: number;
  currentSetWeight?: string;
  weightError?: string | null;
  handleCompleteSet: () => void;
  onChangeSetWeight?: (value: string) => void;
  onPressVideo?: (link: string) => void;
};

export default function PlayCard({
  index,
  counts,
  routine,
  finished,
  currentRoutineIndex,
  totalRoutines,
  currentSetWeight,
  weightError,
  handleCompleteSet,
  onChangeSetWeight,
  onPressVideo,
}: Props) {
  const count = counts[index] ?? 0;
  const isActive = index === currentRoutineIndex;
  const isCompleted = count >= routine.set;
  const isLastExercise = index === totalRoutines - 1;
  const isFinalSet = isActive && isCompleted && isLastExercise;

  return (
    <View
      style={[
        styles.exerciseCard,
        isActive && styles.activeExercise,
        isCompleted && styles.completedExercise,
      ]}
    >
      <Text style={styles.exerciseTitle}>
        {index + 1}. {routine.title}
      </Text>
      <Text style={styles.exerciseDetail}>
        {routine.set}세트 · {routine.kg}kg
      </Text>
      {routine.link ? (
        <Pressable
          style={styles.videoButton}
          onPress={() => onPressVideo?.(routine.link!)}
        >
          <Text style={styles.videoButtonText}>영상 보기</Text>
        </Pressable>
      ) : null}
      <Text style={styles.countText}>
        진행: {count}/{routine.set}
      </Text>
      {isActive && !isCompleted && !finished ? (
        <View style={styles.weightField}>
          <Text style={styles.weightLabel}>{count + 1}세트 무게</Text>
          <View style={styles.weightInputRow}>
            <TextInput
              accessibilityLabel={`${routine.title} ${count + 1}세트 무게`}
              style={[styles.weightInput, weightError && styles.weightInputError]}
              value={currentSetWeight ?? ""}
              onChangeText={onChangeSetWeight}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
            <Text style={styles.weightUnit}>kg</Text>
          </View>
          {weightError ? (
            <Text style={styles.weightError}>{weightError}</Text>
          ) : null}
        </View>
      ) : null}
      {isFinalSet && finished && (
        <Text style={styles.finishText}>운동 끝!</Text>
      )}
      {isActive && !isCompleted && !finished && (
        <Pressable style={styles.completeButton} onPress={handleCompleteSet}>
          <Text style={styles.completeText}>완료</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  activeExercise: {
    borderColor: "#2563eb",
  },
  completedExercise: {
    opacity: 0.7,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseDetail: {
    fontSize: 14,
    color: "#4b5563",
  },
  videoButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  videoButtonText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 13,
  },
  countText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  weightField: {
    marginTop: 12,
    gap: 6,
  },
  weightLabel: {
    color: "#374151",
    fontWeight: "600",
  },
  weightInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weightInput: {
    minWidth: 100,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  weightInputError: {
    borderColor: "#dc2626",
  },
  weightUnit: {
    color: "#4b5563",
  },
  weightError: {
    color: "#dc2626",
  },
  finishText: {
    marginTop: 12,
    fontSize: 18,
    color: "#16a34a",
    fontWeight: "700",
  },
  completeButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  completeText: {
    color: "#fff",
    fontWeight: "600",
  },
});
