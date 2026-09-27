import React from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useRoutineRunner } from "@/hooks/useRoutineRunner";
import { scheduleRestTimerNotification } from "@/service/notificationService";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockRoutine = {
  id: 1, title: "하체", categoryId: 1, category: "하체",
  createdAt: "2026-09-01T00:00:00.000Z",
  routine: [{ title: "스쿼트", set: 3, kg: 20 }],
};

jest.mock("@/hooks/queries/useRoutine", () => ({
  useRoutineDetail: () => ({ data: mockRoutine, isLoading: false, isError: false }),
}));
jest.mock("@/hooks/mutate/useAddRecord", () => ({
  useAddRecord: () => ({ mutateAsync: jest.fn().mockResolvedValue(true) }),
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
const listeners = new Set<(state: AppStateStatus) => void>();
const start = new Date("2026-09-27T00:00:00.000Z").getTime();

function changeAppState(state: AppStateStatus) {
  act(() => { listeners.forEach((listener) => listener(state)); });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(start);
  jest.spyOn(AppState, "addEventListener").mockImplementation((_, listener) => {
    listeners.add(listener);
    return { remove: () => { listeners.delete(listener); } };
  });
  function Probe() {
    model = useRoutineRunner();
    return null;
  }
  act(() => { renderer = TestRenderer.create(<Probe />); });
  act(() => { model.handleCompleteSet(); });
});

afterEach(() => {
  act(() => { renderer.unmount(); });
  listeners.clear();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test("전경에서 60초가 지나면 0초에서 멈추고 다음 세트를 진행한다", () => {
  act(() => { jest.advanceTimersByTime(60_000); });
  expect(model.countdown).toBe(0);
  expect(model.counts).toEqual([0]);
  act(() => { jest.advanceTimersByTime(5_000); });
  expect(model.countdown).toBe(0);
  act(() => { model.handleStartNextSet(); });
  expect(model.isTimerModal).toBe(false);
  expect(model.counts).toEqual([1]);
});

test.each([[70_000, 0], [20_500, 40], [59_999, 1]])(
  "JS 타이머 중단 후 %ims에 복귀하면 즉시 %i초를 표시한다",
  (elapsed, expected) => {
    changeAppState("background");
    // 타이머 콜백을 실행하지 않고 실제 시각만 이동해 JS 중단을 재현한다.
    jest.setSystemTime(start + elapsed);
    changeAppState("active");
    expect(model.countdown).toBe(expected);
    expect(model.counts).toEqual([0]);
    expect(scheduleRestTimerNotification).toHaveBeenCalledTimes(1);
  }
);

test("지연된 타이머 콜백도 실제 경과 시간을 반영한다", () => {
  jest.setSystemTime(start + 30_000);
  act(() => { jest.advanceTimersByTime(1_000); });
  expect(model.countdown).toBe(29);
});

test("알림 권한이 없어도 복귀 후 진행하며 다음 휴식은 새로 60초를 센다", () => {
  expect(scheduleRestTimerNotification).toHaveBeenCalledWith(60);
  changeAppState("background");
  jest.setSystemTime(start + 70_000);
  changeAppState("active");
  expect(model.countdown).toBe(0);
  act(() => { model.handleStartNextSet(); });
  act(() => { model.handleCompleteSet(); });
  expect(model.countdown).toBe(60);
  act(() => { jest.advanceTimersByTime(1_000); });
  expect(model.countdown).toBe(59);
  expect(model.counts).toEqual([1]);
});

test("화면을 닫으면 타이머와 앱 상태 구독을 정리한다", () => {
  act(() => { renderer.unmount(); });
  expect(listeners.size).toBe(0);
  expect(jest.getTimerCount()).toBe(0);
});
