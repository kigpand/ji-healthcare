import React from "react";
import { useRoutineRunner } from "@/hooks/useRoutineRunner";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockSave = jest.fn();
const mockRoutine = {
  id: 1, title: "하체", categoryId: 1, category: "하체",
  createdAt: "2026-09-01T00:00:00.000Z",
  routine: [{ title: "스쿼트", set: 1, kg: 20 }],
};

jest.mock("@/hooks/queries/useRoutine", () => ({
  useRoutineDetail: () => ({ data: mockRoutine, isLoading: false, isError: false }),
}));
jest.mock("@/hooks/mutate/useAddRecord", () => ({
  useAddRecord: () => ({ mutateAsync: mockSave }),
}));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ routineId: "1" }),
}));
jest.mock("@/service/notificationService", () => ({
  cancelRestTimerNotifications: jest.fn().mockResolvedValue(undefined),
  scheduleRestTimerNotification: jest.fn().mockResolvedValue(undefined),
}));

test("기록 저장 실패 후 연속 재시도와 성공 후 재시도로 중복 저장하지 않는다", async () => {
  let model: ReturnType<typeof useRoutineRunner>;
  let renderer: ReturnType<typeof TestRenderer.create>;
  let resolveSave!: (value: boolean) => void;
  mockSave.mockRejectedValueOnce(new Error("DB 실패"));
  mockSave.mockImplementation(() => new Promise<boolean>((resolve) => { resolveSave = resolve; }));
  function Probe() {
    model = useRoutineRunner();
    return null;
  }
  try {
    await act(async () => { renderer = TestRenderer.create(<Probe />); });
    await act(async () => { model.handleCompleteSet(); });
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(model!.recordSaveFailed).toBe(true);
    expect(model!.recordAdded).toBe(false);
    act(() => {
      model.handleRetrySaveRecord();
      model.handleRetrySaveRecord();
    });
    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(model!.recordSaving).toBe(true);
    await act(async () => { resolveSave(true); });
    expect(model!.recordAdded).toBe(true);
    expect(model!.recordSaveFailed).toBe(false);
    expect(model!.recordSaving).toBe(false);
    act(() => { model.handleRetrySaveRecord(); });
    expect(mockSave).toHaveBeenCalledTimes(2);
  } finally {
    act(() => { renderer?.unmount(); });
  }
});
