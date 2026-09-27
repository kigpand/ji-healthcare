import React from "react";
import { Alert, TextInput } from "react-native";
import AddRoutineCard from "@/components/add-routine/AddRoutineCard";
import { useAddRoutineViewModel } from "@/hooks/useAddRoutineViewModel";
import { useEditRoutineViewModel } from "@/hooks/useEditRoutineViewModel";
import { useRoutineForm } from "@/hooks/useRoutineForm";
import { validateRoutineRequestInput } from "@/schema/routine.schema";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockSave = jest.fn().mockResolvedValue(true);
const mockCategories = [{ id: "1", name: "하체" }];
const mockRoutine = {
  id: 1, title: "하체", categoryId: 1, category: "하체",
  createdAt: "2026-09-01T00:00:00.000Z",
  routine: [{ title: "스쿼트", set: 3, kg: 2.5 }],
};

jest.mock("@/hooks/queries/useCategory", () => ({
  useCategory: () => ({ data: mockCategories, isLoading: false, isError: false }),
}));
jest.mock("@/hooks/queries/useRoutine", () => ({
  useRoutineDetail: () => ({ data: mockRoutine, isLoading: false, isError: false }),
}));
jest.mock("@/hooks/mutate/useAddRoutine", () => ({
  useAddRoutine: () => ({ isPending: false, mutateAsync: mockSave }),
}));
jest.mock("@/hooks/mutate/useUpdateRoutine", () => ({
  useUpdateRoutine: () => ({ isPending: false, mutateAsync: mockSave }),
}));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ routineId: "1" }),
  useRouter: () => ({ back: jest.fn() }),
}));

test.each(["등록", "수정"] as const)("%s 화면에서 소수점 무게를 입력하고 저장한다", async (mode) => {
  const useViewModel = mode === "등록" ? useAddRoutineViewModel : useEditRoutineViewModel;
  let model: ReturnType<typeof useViewModel>;
  let renderer: ReturnType<typeof TestRenderer.create>;
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  function Probe() {
    model = useViewModel();
    return <AddRoutineCard index={0} sets={model.sets} set={model.sets[0]}
      handleChangeSet={model.handleChangeSet} handleRemoveSet={model.handleRemoveSet} />;
  }
  try {
    act(() => { renderer = TestRenderer.create(<Probe />); });
    act(() => {
      model.handleChangeTitle("하체");
      model.handleChangeCategory(mockCategories[0]);
      model.handleChangeSet(0, "title", "스쿼트");
      model.handleChangeSet(0, "set", "3", { numeric: true });
    });
    const weight = () => renderer.root.findAllByType(TextInput)
      .find((input: { props: { placeholder: string } }) => input.props.placeholder === "무게 (kg)");
    expect(weight().props.inputMode).toBe("decimal");
    for (const value of ["1", "12", "12.", "12.5"]) {
      act(() => { weight().props.onChangeText(value); });
      expect(model!.sets[0].kg).toBe(value);
    }
    for (const value of ["-2.5", "12..5"]) {
      act(() => { weight().props.onChangeText(value); });
      await act(async () => { await model.handleSubmit(); });
      expect(mockSave).not.toHaveBeenCalled();
    }
    act(() => { weight().props.onChangeText("12.5"); });
    await act(async () => { await model.handleSubmit(); });
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      routine: [expect.objectContaining({ kg: 12.5, set: 3 })],
    }));
    expect(mockSave).toHaveBeenCalledTimes(1);
  } finally {
    act(() => { renderer?.unmount(); });
    alert.mockRestore();
  }
});

test.each(["2.5", "", "12..5", "-2.5"])("AI 편집 폼에서 무게 %p를 보존하고 저장 전 검증한다", (value) => {
  let form: ReturnType<typeof useRoutineForm>;
  let renderer: ReturnType<typeof TestRenderer.create>;
  function Probe() {
    form = useRoutineForm();
    return <AddRoutineCard index={0} sets={form.state.sets} set={form.state.sets[0]}
      handleRemoveSet={() => {}}
      handleChangeSet={(index, key, value) => form.dispatch({ type: "UPDATE_SET", index, key, value })} />;
  }
  try {
    act(() => { renderer = TestRenderer.create(<Probe />); });
    act(() => {
      renderer.root.findAllByType(TextInput)
        .find((input: { props: { placeholder: string } }) => input.props.placeholder === "무게 (kg)")
        .props.onChangeText(value);
    });
    expect(form!.state.sets[0].kg).toBe(value);
    const result = validateRoutineRequestInput({ title: "하체", categoryId: 1,
      routine: [{ ...form!.state.sets[0], title: "스쿼트", set: "3" }] });
    expect(result.success).toBe(value === "2.5" || value === "");
    if (result.success) expect(result.data.routine[0].kg).toBe(value === "" ? 0 : 2.5);
  } finally {
    act(() => { renderer?.unmount(); });
  }
});
