import React from "react";
import { useRoutineRunner } from "@/hooks/useRoutineRunner";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockSave = jest.fn().mockResolvedValue(true);
const mockRoutine = {
  id: 1,
  title: "하체",
  categoryId: 1,
  category: "하체",
  createdAt: "2026-09-01T00:00:00.000Z",
  routine: [{ title: "스쿼트", set: 2, kg: 20 }],
};

jest.mock("@/hooks/queries/useRoutine", () => ({
  useRoutineDetail: () => ({ data: mockRoutine, isLoading: false, isError: false }),
}));
jest.mock("@/hooks/mutate/useAddRecord", () => ({
  useAddRecord: () => ({ mutateAsync: mockSave }),
}));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ routineId: "1", timer: "60" }),
}));
jest.mock("@/service/notificationService", () => ({
  cancelRestTimerNotifications: jest.fn().mockResolvedValue(undefined),
  scheduleRestTimerNotification: jest.fn().mockResolvedValue(null),
}));

let model: ReturnType<typeof useRoutineRunner>;
let renderer: ReturnType<typeof TestRenderer.create>;

function Probe() {
  model = useRoutineRunner();
  return null;
}

beforeEach(() => {
  mockSave.mockClear();
  act(() => {
    renderer = TestRenderer.create(<Probe />);
  });
});

afterEach(() => {
  act(() => {
    renderer.unmount();
  });
});

test("세트별로 수정한 무게와 선택 입력한 반복 횟수를 완료 기록에 전달한다", async () => {
  act(() => {
    model.handleSetWeightChange("22.5");
    model.handleSetRepsChange("12");
  });
  act(() => {
    model.handleCompleteSet();
  });
  act(() => {
    model.handleStartNextSet();
  });
  expect(model.setWeights).toEqual([["22.5", "20"]]);

  await act(async () => {
    model.handleSetWeightChange("25");
    model.handleSetRepsChange("8");
  });
  await act(async () => {
    model.handleCompleteSet();
  });

  expect(mockSave).toHaveBeenCalledTimes(1);
  expect(mockSave.mock.calls[0][0].routine[0]).toMatchObject({
    title: "스쿼트",
    kg: 20,
    set: 2,
    setKgs: [22.5, 25],
    setReps: [12, 8],
  });
});

test("빈 무게로는 현재 세트를 완료하지 않는다", () => {
  act(() => {
    model.handleSetWeightChange("");
  });
  act(() => {
    model.handleCompleteSet();
  });

  expect(model.counts).toEqual([0]);
  expect(model.isTimerModal).toBe(false);
  expect(model.weightError).toBe("0 이상의 올바른 무게를 입력해주세요.");
  expect(mockSave).not.toHaveBeenCalled();
});

test("반복 횟수를 비우면 기록을 허용하고 잘못 입력하면 세트를 완료하지 않는다", () => {
  act(() => {
    model.handleSetRepsChange("1.5");
  });
  act(() => {
    model.handleCompleteSet();
  });
  expect(model.counts).toEqual([0]);
  expect(model.isTimerModal).toBe(false);
  expect(model.repsError).toBe("반복 횟수는 1 이상의 정수로 입력해주세요.");

  act(() => {
    model.handleSetRepsChange("");
  });
  act(() => {
    model.handleCompleteSet();
  });
  expect(model.isTimerModal).toBe(true);
});

test("안전한 정수 범위를 벗어난 반복 횟수로는 세트를 완료하지 않는다", () => {
  act(() => {
    model.handleSetRepsChange("9007199254740993");
  });
  act(() => {
    model.handleCompleteSet();
  });

  expect(model.counts).toEqual([0]);
  expect(model.isTimerModal).toBe(false);
  expect(model.repsError).toBe("반복 횟수는 1 이상의 정수로 입력해주세요.");
});
