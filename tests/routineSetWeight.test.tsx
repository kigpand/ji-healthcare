import React from "react";
import { useRoutineRunner } from "@/hooks/useRoutineRunner";
import { scheduleRestTimerNotification } from "@/service/notificationService";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockSave = jest.fn().mockResolvedValue(true);
const createMockRoutine = () => ({
  id: 1,
  title: "하체",
  categoryId: 1,
  category: "하체",
  createdAt: "2026-09-01T00:00:00.000Z",
  routine: [{ title: "스쿼트", set: 2, kg: 20 }],
});
let mockRoutine = createMockRoutine();

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
  mockRoutine = createMockRoutine();
  mockSave.mockClear();
  (scheduleRestTimerNotification as jest.Mock).mockClear();
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

test("운동 중 추가한 세트를 최종 구성과 함께 저장한다", async () => {
  act(() => {
    model.handleAddSet();
  });
  expect(model.setTargets).toEqual([3]);
  expect(model.setWeights).toEqual([["20", "20", "20"]]);
  expect(model.setReps).toEqual([["", "", ""]]);

  act(() => {
    model.handleCompleteSet();
  });
  act(() => {
    model.handleStartNextSet();
  });
  act(() => {
    model.handleCompleteSet();
  });
  act(() => {
    model.handleStartNextSet();
  });
  await act(async () => {
    model.handleCompleteSet();
  });

  expect(mockSave).toHaveBeenCalledTimes(1);
  expect(mockSave.mock.calls[0][0].routine[0]).toMatchObject({
    set: 3,
    setKgs: [20, 20, 20],
    setReps: [null, null, null],
  });
});

test("아직 수행하지 않은 마지막 세트만 삭제한다", () => {
  act(() => {
    model.handleAddSet();
    model.handleRemoveSet();
  });
  expect(model.setTargets).toEqual([2]);

  act(() => {
    model.handleCompleteSet();
  });
  act(() => {
    model.handleStartNextSet();
  });
  act(() => {
    model.handleRemoveSet();
  });

  expect(model.counts).toEqual([1]);
  expect(model.setTargets).toEqual([2]);
  expect(model.setWeights[0]).toHaveLength(2);
});

test("휴식 완료를 빠르게 연속 실행해도 다음 세트로 한 번만 이동한다", () => {
  act(() => {
    model.handleAddSet();
    model.handleCompleteSet();
  });
  expect(model.isTimerModal).toBe(true);

  act(() => {
    model.handleStartNextSet();
    model.handleStartNextSet();
  });

  expect(model.isTimerModal).toBe(false);
  expect(model.counts).toEqual([1]);
  expect(model.setTargets).toEqual([3]);
});

test("세트 완료를 빠르게 연속 실행해도 휴식 알림을 한 번만 예약한다", () => {
  act(() => {
    model.handleCompleteSet();
    model.handleCompleteSet();
  });

  expect(model.isTimerModal).toBe(true);
  expect(scheduleRestTimerNotification).toHaveBeenCalledTimes(1);
});

test("최근 완료 세트를 한 번만 취소하고 기존 입력값을 다시 수정한다", () => {
  act(() => {
    model.handleSetWeightChange("22.5");
    model.handleSetRepsChange("10");
  });
  act(() => {
    model.handleCompleteSet();
  });
  act(() => {
    model.handleStartNextSet();
  });
  expect(model.counts).toEqual([1]);

  act(() => {
    model.handleUndoLastSet();
    model.handleUndoLastSet();
  });
  expect(model.counts).toEqual([0]);
  expect(model.currentRoutineIndex).toBe(0);
  expect(model.setWeights[0][0]).toBe("22.5");
  expect(model.setReps[0][0]).toBe("10");

  act(() => {
    model.handleSetWeightChange("20");
    model.handleSetRepsChange("12");
  });
  expect(model.setWeights[0][0]).toBe("20");
  expect(model.setReps[0][0]).toBe("12");
});

test("다음 운동으로 이동한 직후 직전 운동의 마지막 세트를 취소한다", () => {
  act(() => {
    renderer.unmount();
  });
  mockRoutine = {
    ...createMockRoutine(),
    routine: [
      { title: "스쿼트", set: 1, kg: 20 },
      { title: "런지", set: 1, kg: 10 },
    ],
  };
  act(() => {
    renderer = TestRenderer.create(<Probe />);
  });

  act(() => {
    model.handleCompleteSet();
  });
  act(() => {
    model.handleStartNextSet();
  });
  expect(model.currentRoutineIndex).toBe(1);
  expect(model.counts).toEqual([1, 0]);

  act(() => {
    model.handleUndoLastSet();
  });
  expect(model.currentRoutineIndex).toBe(0);
  expect(model.counts).toEqual([0, 0]);
});
