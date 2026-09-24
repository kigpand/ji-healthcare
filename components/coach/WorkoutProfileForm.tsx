import { WORKOUT_ENVIRONMENTS, WORKOUT_GOALS, type WorkoutProfile } from "@/interface/coach";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  initial: WorkoutProfile | null;
  disabled: boolean;
  onChange: () => void;
  onSave: (profile: WorkoutProfile) => Promise<unknown>;
};

export default function WorkoutProfileForm({ initial, disabled, onSave, onChange }: Props) {
  const [goal, setGoal] = useState<WorkoutProfile["goal"]>(initial?.goal ?? "체력 유지");
  const [environment, setEnvironment] = useState<WorkoutProfile["environment"]>(initial?.environment ?? "헬스장");
  const [minutes, setMinutes] = useState(initial?.minutes.toString() ?? "30");
  const [equipment, setEquipment] = useState(initial?.equipment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function changed() { setSaved(false); setError(null); onChange(); }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>내 운동 설정</Text>
      <Text style={styles.label}>운동 목표</Text>
      <View style={styles.options}>
        {WORKOUT_GOALS.map((value) => (
          <Pressable key={value} disabled={disabled} accessibilityRole="radio" accessibilityState={{ checked: goal === value }}
            style={[styles.option, goal === value && styles.selected]}
            onPress={() => { setGoal(value); changed(); }}>
            <Text>{value}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>운동 장소</Text>
      <View style={styles.options}>
        {WORKOUT_ENVIRONMENTS.map((value) => (
          <Pressable key={value} disabled={disabled} accessibilityRole="radio" accessibilityState={{ checked: environment === value }}
            style={[styles.option, environment === value && styles.selected]}
            onPress={() => { setEnvironment(value); changed(); }}>
            <Text>{value}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>하루 운동 시간 (5~180분)</Text>
      <TextInput accessibilityLabel="하루 운동 시간" style={styles.input} value={minutes}
        editable={!disabled} keyboardType="number-pad" onChangeText={(value) => { setMinutes(value); changed(); }} />
      <Text style={styles.label}>사용 가능한 장비</Text>
      <TextInput accessibilityLabel="사용 가능한 장비" style={styles.input} value={equipment}
        editable={!disabled} maxLength={300} placeholder="예: 덤벨, 벤치 / 장비가 없으면 없음"
        onChangeText={(value) => { setEquipment(value); changed(); }} />
      <Text style={styles.label}>저장한 설정은 추천 요청에 함께 포함됩니다. 지금은 기기에만 저장합니다.</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {saved && <Text>설정을 저장했습니다.</Text>}
      <Pressable accessibilityRole="button" style={[styles.button, disabled && styles.disabled]} disabled={disabled}
        onPress={async () => {
          try {
            await onSave({ goal, environment, minutes: Number(minutes), equipment });
            setSaved(true); setError(null);
          } catch (cause) { setError(cause instanceof Error ? cause.message : "설정을 저장하지 못했습니다."); }
        }}>
        <Text style={styles.buttonText}>설정 저장</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 16, backgroundColor: "#fff", gap: 12 },
  title: { fontSize: 19, fontWeight: "700" },
  label: { color: "#475569", lineHeight: 21 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, padding: 10 },
  selected: { backgroundColor: "#dbeafe", borderColor: "#2563eb" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", padding: 12, borderRadius: 10, color: "#0f172a" },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#b91c1c" },
  disabled: { opacity: 0.5 },
});
