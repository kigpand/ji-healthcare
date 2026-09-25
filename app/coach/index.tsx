import AddRoutineCard from "@/components/add-routine/AddRoutineCard";
import RoutineCategorySelect from "@/components/add-routine/RoutineCategorySelect";
import WorkoutProfileForm from "@/components/coach/WorkoutProfileForm";
import { PATH } from "@/constants/path";
import { useCoachViewModel } from "@/hooks/useCoachViewModel";
import { formatRecordDate } from "@/utils/date";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function CoachScreen() {
  const vm = useCoachViewModel();
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const disabled = vm.busy || vm.saveProfile.isPending;
  const result = vm.result;
  const recommendation = result?.recommendation;
  const categories = vm.categories.data ?? [];

  if (vm.profile.isLoading) return <ActivityIndicator style={styles.loading} accessibilityLabel="설정 불러오는 중" />;
  if (vm.profile.isError) return (
    <View style={styles.content}>
      <Text>운동 설정을 불러오지 못했습니다.</Text>
      <Pressable onPress={() => vm.profile.refetch()}><Text>다시 시도</Text></Pressable>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>이번 주 분석 · 오늘의 운동</Text>
      <Text style={styles.notice}>저장한 운동 설정과 이번 주 기록을 AI 코치가 분석합니다. 통증이나 회복 상태는 포함되지 않으므로 결과를 확인한 뒤 운동 여부를 결정해주세요.</Text>
      <WorkoutProfileForm initial={vm.profile.data ?? null} disabled={disabled}
        onChange={() => { setDirty(true); vm.clearResult(); }}
        onSave={async (profile) => { await vm.saveProfile.mutateAsync(profile); setDirty(false); }} />
      <View style={styles.card}>
        <Text style={styles.heading}>오늘의 운동 추천</Text>
        <Text style={styles.text}>월요일부터 현재까지의 기록을 사용합니다. AI는 기존 루틴을 먼저 검토하고, 적합하지 않으면 새 루틴 또는 휴식을 제안합니다.</Text>
        {(!vm.profile.data || dirty) && <Text style={styles.notice}>운동 설정을 저장한 뒤 추천을 요청해주세요.</Text>}
        <Pressable accessibilityRole="button" disabled={disabled || dirty || !vm.profile.data}
            style={[styles.button, (disabled || dirty || !vm.profile.data) && styles.disabled]}
            onPress={vm.analyze}><Text style={styles.buttonText}>이번 주 분석하고 추천받기</Text></Pressable>
        {vm.busy && <ActivityIndicator />}
      </View>
      {vm.error && <Text style={styles.error}>{vm.error}</Text>}
      {result && (
        <View style={styles.card}>
          <Text style={styles.heading}>이번 주 기록 요약</Text>
          <Text>{formatRecordDate(result.request.period.start)} ~ {formatRecordDate(result.request.period.end)}</Text>
          <Text>완료한 루틴 {result.request.summary.workoutCount}회 · 운동한 날 {result.request.summary.workoutDays}일</Text>
          <Text style={styles.text}>반영할 설정: {result.request.profile.goal} / {result.request.profile.environment} / {result.request.profile.minutes}분 / {result.request.profile.equipment}</Text>
          <Text style={styles.text}>운동 당시의 실제 세트·무게와 회복 상태는 기록에 포함되어 있지 않습니다.</Text>
          <Text style={styles.notice}>{recommendation?.reason}</Text>
        </View>
      )}
      {recommendation?.kind === "existing" && (
        <View style={styles.card}>
          <Text style={styles.heading}>{recommendation.routine.title}</Text>
          {recommendation.routine.routine.map((item, index) => <Text key={index}>{item.title} · {item.set}세트 · {item.kg}kg</Text>)}
          <Pressable style={styles.button} accessibilityRole="button" onPress={() => router.push({
            pathname: PATH.play, params: { routineId: String(recommendation.routine.id) },
          })}><Text style={styles.buttonText}>이 루틴 시작 (휴식 60초)</Text></Pressable>
        </View>
      )}
      {recommendation?.kind === "new" && (
        <View style={styles.card}>
          <Text style={styles.heading}>새 루틴 확인·수정</Text>
          <Text style={styles.text}>등록하면 실제 루틴 목록에 저장됩니다. 추천 내용을 확인하고 원하는 운동으로 수정해주세요.</Text>
          {vm.registered ? <Text accessibilityRole="alert">루틴이 등록되었습니다. 운동 루틴 목록에서 확인할 수 있습니다.</Text> : (
            <View pointerEvents={disabled ? "none" : "auto"} style={disabled ? styles.disabled : undefined}>
              <Text style={styles.label}>루틴 이름</Text>
              <TextInput style={styles.input} accessibilityLabel="추천 루틴 이름" value={vm.form.state.title}
                onChangeText={(value) => vm.form.dispatch({ type: "SET_TITLE", payload: value })} />
              <Text style={styles.label}>등록할 카테고리</Text>
              <RoutineCategorySelect categories={categories} selectedCategory={categories.find((item) => item.id === vm.categoryId) ?? null}
                isLoading={vm.categories.isLoading} isError={vm.categories.isError}
                onSelectCategory={(item) => vm.setCategoryId(item?.id ?? null)} />
              {vm.categories.isError && <Pressable onPress={() => vm.categories.refetch()}><Text>카테고리 다시 불러오기</Text></Pressable>}
              {!vm.categories.isLoading && !vm.categories.isError && !categories.length && (
                <Pressable onPress={() => router.push(PATH.category)}><Text style={styles.label}>카테고리를 먼저 추가해주세요 →</Text></Pressable>
              )}
              {vm.form.state.sets.map((set, index) => (
                <AddRoutineCard key={index} index={index} set={set} sets={vm.form.state.sets}
                  handleRemoveSet={(index) => vm.form.dispatch({ type: "REMOVE_SET", index })}
                  handleChangeSet={(index, key, value) => vm.form.dispatch({ type: "UPDATE_SET", index, key, value })} />
              ))}
              <Pressable style={styles.secondaryButton} onPress={() => vm.form.dispatch({ type: "ADD_SET" })}><Text>운동 추가</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={disabled || !vm.categoryId} style={[styles.button, !vm.categoryId && styles.disabled]}
                onPress={vm.registerDraft}><Text style={styles.buttonText}>확인한 루틴 등록</Text></Pressable>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  loading: { marginTop: 40 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  heading: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  card: { padding: 18, borderRadius: 16, backgroundColor: "#fff", gap: 12 },
  text: { color: "#475569", lineHeight: 22 },
  notice: { color: "#92400e", backgroundColor: "#fffbeb", padding: 12, borderRadius: 8, lineHeight: 22 },
  error: { color: "#b91c1c" },
  button: { backgroundColor: "#2563eb", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
  disabled: { opacity: 0.5 },
  secondaryButton: { padding: 12, alignItems: "center" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, padding: 12, marginBottom: 12 },
  label: { color: "#475569", marginVertical: 10 },
});
