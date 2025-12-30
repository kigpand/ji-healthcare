import type { IRoutineData } from "@/interface/routine";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  index: number;
  counts: number[];
  routine: IRoutineData;
  finished: boolean;
  currentRoutineIndex: number;
  totalRoutines: number;
  handleCompleteSet: () => void;
};

export default function PlayCard({
  index,
  counts,
  routine,
  finished,
  currentRoutineIndex,
  totalRoutines,
  handleCompleteSet,
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
      <Text style={styles.countText}>
        진행: {count}/{routine.set}
      </Text>
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
  countText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
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
