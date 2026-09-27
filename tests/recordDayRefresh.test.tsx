import React from "react";
import { AppState, type AppStateStatus } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import { useRecord } from "@/hooks/queries/useRecord";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockRoutines = { routines: [] };
const mockCategories: never[] = [];
const mockGetAll = jest.fn();
jest.mock("@/hooks/queries/useRoutine", () => ({
  useRoutine: () => ({ data: mockRoutines, isLoading: false, isError: false }),
}));
jest.mock("@/hooks/queries/useCategory", () => ({
  useCategory: () => ({ data: mockCategories, isLoading: false, isError: false }),
}));
jest.mock("@/lib/database", () => ({
  getDatabase: async () => ({ getAllAsync: mockGetAll }),
}));

let home: ReturnType<typeof useHomeDashboard>;
let weekly: ReturnType<typeof useRecord>;
let monthly: ReturnType<typeof useRecord>;
let renderer: ReturnType<typeof TestRenderer.create>;
let client: QueryClient;
const listeners = new Set<(state: AppStateStatus) => void>();

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(AppState, "addEventListener").mockImplementation((_, listener) => {
    listeners.add(listener);
    return { remove: () => { listeners.delete(listener); } };
  });
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
});
afterEach(() => {
  act(() => { renderer?.unmount(); });
  client.clear();
  listeners.clear();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

async function flush() {
  await act(async () => { await jest.advanceTimersByTimeAsync(1); });
}

async function mount(now: string) {
  jest.setSystemTime(new Date(now));
  const rows = [1, 6, 29, 29, 29].map((daysAgo, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(12, 0, 0, 0);
    return { id: index + 1, routine_id: 1, title: "운동",
      recorded_at: date.toISOString(), category_name: daysAgo === 29 ? "오래된 카테고리" : "최근 카테고리" };
  });
  mockGetAll.mockImplementation(async (_sql, from?: string) =>
    rows.filter((row) => !from || row.recorded_at >= from));
  function Probe() {
    home = useHomeDashboard();
    weekly = useRecord(7);
    monthly = useRecord(30);
    return null;
  }
  await act(async () => {
    renderer = TestRenderer.create(<QueryClientProvider client={client}><Probe /></QueryClientProvider>);
  });
  await flush();
  expect(home.dashboard.weeklyCount).toBe(2);
  expect(home.dashboard.currentStreak).toBe(1);
  expect(home.dashboard.topCategory).toBe("오래된 카테고리");
  expect(weekly.data).toHaveLength(2);
  expect(monthly.data).toHaveLength(5);
}

function expectNewDay() {
  expect(home.dashboard.weeklyCount).toBe(1);
  expect(home.dashboard.currentStreak).toBe(0);
  expect(home.dashboard.topCategory).toBe("최근 카테고리");
  expect(weekly.data).toHaveLength(1);
  expect(monthly.data).toHaveLength(2);
  expect(home.dashboard.recentRecords).toHaveLength(3);
}

test.each([
  "2026-09-27T23:59:59+09:00",
  "2026-09-30T23:59:59+09:00",
  "2026-12-31T23:59:59+09:00",
])("%s 자정에 데이터 변경 없이 홈 통계와 기간별 기록을 갱신한다", async (now) => {
  await mount(now);
  await act(async () => { await jest.advanceTimersByTimeAsync(1_000); });
  await flush();
  expectNewDay();
});

test("타이머가 멈춘 채 이틀 후 복귀해도 현재 날짜로 갱신하고 다음 자정을 예약한다", async () => {
  await mount("2026-09-27T23:59:59+09:00");
  act(() => { listeners.forEach((listener) => listener("background")); });
  jest.setSystemTime(new Date("2026-09-29T23:59:59+09:00"));
  act(() => { listeners.forEach((listener) => listener("active")); });
  await flush();
  expectNewDay();
  const queriesBefore = mockGetAll.mock.calls.length;
  await act(async () => { await jest.advanceTimersByTimeAsync(1_000); });
  await flush();
  expect(mockGetAll.mock.calls.length).toBeGreaterThan(queriesBefore);
});

test("같은 날짜에 복귀하면 기록을 불필요하게 다시 조회하지 않는다", async () => {
  await mount("2026-09-27T12:00:00+09:00");
  const queriesBefore = mockGetAll.mock.calls.length;
  jest.setSystemTime(new Date("2026-09-27T13:00:00+09:00"));
  act(() => { listeners.forEach((listener) => listener("active")); });
  await flush();
  expect(mockGetAll.mock.calls).toHaveLength(queriesBefore);
  expect(home.dashboard.weeklyCount).toBe(2);
});

test("화면을 닫으면 날짜 타이머와 앱 상태 구독을 정리한다", async () => {
  await mount("2026-09-27T12:00:00+09:00");
  act(() => { renderer.unmount(); });
  expect(listeners.size).toBe(0);
  expect(jest.getTimerCount()).toBe(0);
});
