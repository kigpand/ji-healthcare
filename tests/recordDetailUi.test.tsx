import React from "react";
import RecordCardModal from "@/components/modal/RecordCardModal";
import { Alert, Dimensions, StyleSheet, Text } from "react-native";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockPush = jest.fn();
const mockRefetch = jest.fn();
const mockDelete = jest.fn().mockResolvedValue(true);
let mockDeletePending = false;
let mockItems = [
  {
    id: 1,
    title: "스쿼트",
    kg: 22.5,
    set: 3,
    sortOrder: 0,
    sets: [
      { id: 1, setNumber: 1, kg: 20, reps: 12 },
      { id: 2, setNumber: 2, kg: 22.5, reps: 10 },
      { id: 3, setNumber: 3, kg: 25, reps: null },
    ],
  },
];

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("@/hooks/queries/useRecord", () => ({
  useRecordDetail: () => ({
    data: {
      id: 7,
      _id: "7",
      routineId: 3,
      title: "하체 루틴",
      category: "하체",
      date: "2026-10-02T01:00:00.000Z",
      items: mockItems,
    },
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  }),
}));
jest.mock("@/hooks/mutate/useDeleteRecord", () => ({
  useDeleteRecord: () => ({
    mutateAsync: mockDelete,
    isPending: mockDeletePending,
  }),
}));

const record = {
  id: 7,
  _id: "7",
  routineId: 3,
  title: "하체 루틴",
  category: "하체",
  date: "2026-10-02T01:00:00.000Z",
};

function textValues(renderer: ReturnType<typeof TestRenderer.create>) {
  return renderer.root
    .findAllByType(Text)
    .map((node: { props: { children: unknown } }) => node.props.children)
    .flat(Infinity)
    .join(" ");
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDeletePending = false;
  Dimensions.set({
    window: { width: 390, height: 844, scale: 3, fontScale: 1 },
    screen: { width: 390, height: 844, scale: 3, fontScale: 1 },
  });
  mockItems = [
    {
      id: 1,
      title: "스쿼트",
      kg: 22.5,
      set: 3,
      sortOrder: 0,
      sets: [
        { id: 1, setNumber: 1, kg: 20, reps: 12 },
        { id: 2, setNumber: 2, kg: 22.5, reps: 10 },
        { id: 3, setNumber: 3, kg: 25, reps: null },
      ],
    },
  ];
});

test("확인 후 완료 기록을 삭제하고 상세 모달을 닫는다", async () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  const handleChangeRecord = jest.fn();
  let renderer: ReturnType<typeof TestRenderer.create>;
  await act(async () => {
    renderer = TestRenderer.create(
      <RecordCardModal
        selectedRecord={record}
        handleChangeRecord={handleChangeRecord}
      />
    );
  });

  const deleteButton = renderer!.root.findAll(
    (node: any) =>
      typeof node.props.onPress === "function" &&
      node.props.children?.props?.children === "기록 삭제"
  )[0];
  act(() => {
    deleteButton.props.onPress();
  });
  expect(alert).toHaveBeenCalledWith(
    "운동 기록 삭제",
    "이 기록과 세트별 상세 내역을 삭제하시겠습니까?",
    expect.any(Array),
    expect.any(Object)
  );

  const confirm = alert.mock.calls[0][2]?.find(
    (item) => item.style === "destructive"
  );
  await act(async () => {
    await confirm?.onPress?.();
  });
  expect(mockDelete).toHaveBeenCalledWith("7");
  expect(handleChangeRecord).toHaveBeenCalledWith(null);

  act(() => {
    renderer!.unmount();
  });
  alert.mockRestore();
});

test("완료 기록 삭제 실패 시 상세 모달을 유지한다", async () => {
  const error = new Error("삭제 실패");
  mockDelete.mockRejectedValueOnce(error);
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  const handleChangeRecord = jest.fn();
  let renderer: ReturnType<typeof TestRenderer.create>;
  await act(async () => {
    renderer = TestRenderer.create(
      <RecordCardModal
        selectedRecord={record}
        handleChangeRecord={handleChangeRecord}
      />
    );
  });

  const deleteButton = renderer!.root.findAll(
    (node: any) =>
      typeof node.props.onPress === "function" &&
      node.props.children?.props?.children === "기록 삭제"
  )[0];
  act(() => {
    deleteButton.props.onPress();
  });
  const confirm = alert.mock.calls[0][2]?.find(
    (item) => item.style === "destructive"
  );
  await act(async () => {
    await confirm?.onPress?.();
  });

  expect(handleChangeRecord).not.toHaveBeenCalled();
  expect(consoleError).toHaveBeenCalledWith(
    "Failed to delete workout record",
    error
  );

  act(() => {
    renderer!.unmount();
  });
  alert.mockRestore();
  consoleError.mockRestore();
});

test("삭제 확인을 연속 요청해도 확인창과 삭제를 한 번만 실행한다", async () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  let renderer: ReturnType<typeof TestRenderer.create>;
  await act(async () => {
    renderer = TestRenderer.create(
      <RecordCardModal selectedRecord={record} handleChangeRecord={jest.fn()} />
    );
  });
  const deleteButton = renderer!.root.findAll(
    (node: any) =>
      typeof node.props.onPress === "function" &&
      node.props.children?.props?.children === "기록 삭제"
  )[0];

  act(() => {
    deleteButton.props.onPress();
    deleteButton.props.onPress();
  });
  expect(alert).toHaveBeenCalledTimes(1);
  const confirm = alert.mock.calls[0][2]?.find(
    (item) => item.style === "destructive"
  );
  await act(async () => {
    confirm?.onPress?.();
    confirm?.onPress?.();
  });
  expect(mockDelete).toHaveBeenCalledTimes(1);

  act(() => {
    renderer!.unmount();
  });
  alert.mockRestore();
});

test("삭제 중에는 Android 뒤로가기로 상세 모달을 닫지 않는다", () => {
  mockDeletePending = true;
  const handleChangeRecord = jest.fn();
  let renderer: ReturnType<typeof TestRenderer.create>;
  act(() => {
    renderer = TestRenderer.create(
      <RecordCardModal
        selectedRecord={record}
        handleChangeRecord={handleChangeRecord}
      />
    );
  });

  act(() => {
    renderer!.root.findByType(require("react-native").Modal).props.onRequestClose();
  });
  expect(handleChangeRecord).not.toHaveBeenCalled();

  act(() => {
    renderer!.unmount();
  });
});

test("완료 기록의 운동 항목과 세트·무게를 표시하고 같은 루틴을 시작한다", () => {
  let renderer: ReturnType<typeof TestRenderer.create>;
  act(() => {
    renderer = TestRenderer.create(
      <RecordCardModal
        selectedRecord={record}
        handleChangeRecord={jest.fn()}
      />
    );
  });

  expect(textValues(renderer!)).toContain("스쿼트");
  expect(textValues(renderer!).replace(/\s/g, "")).toContain("3세트·22.5kg");
  expect(textValues(renderer!).replace(/\s/g, "")).toContain(
    "1세트20kg·12회/2세트22.5kg·10회/3세트25kg"
  );

  const restart = renderer!.root.findAll(
    (node: any) =>
      typeof node.props.onPress === "function" &&
      node.props.children?.props?.children === "이 루틴 다시 시작"
  )[0];
  act(() => {
    restart.props.onPress();
  });

  expect(mockPush).toHaveBeenCalledWith({
    pathname: "/play",
    params: { routineId: "3" },
  });
  act(() => {
    renderer!.unmount();
  });
});

test("마이그레이션 이전 기록은 상세 항목이 없음을 안내한다", () => {
  mockItems = [];
  let renderer: ReturnType<typeof TestRenderer.create>;
  act(() => {
    renderer = TestRenderer.create(
      <RecordCardModal
        selectedRecord={record}
        handleChangeRecord={jest.fn()}
      />
    );
  });

  expect(textValues(renderer!)).toContain(
    "상세 운동 항목이 없는 이전 기록입니다."
  );
  act(() => {
    renderer!.unmount();
  });
});

test("화면 폭과 글꼴 크기 변화에 맞춰 상세 모달 버튼을 재배치한다", () => {
  let renderer: ReturnType<typeof TestRenderer.create>;
  act(() => {
    renderer = TestRenderer.create(
      <RecordCardModal
        selectedRecord={record}
        handleChangeRecord={jest.fn()}
      />
    );
  });

  const actions = renderer!.root.findByProps({
    testID: "record-detail-actions",
  });
  expect(StyleSheet.flatten(actions.props.style)).toMatchObject({
    flexDirection: "column",
  });

  act(() => {
    Dimensions.set({
      window: { width: 320, height: 568, scale: 2, fontScale: 1 },
      screen: { width: 320, height: 568, scale: 2, fontScale: 1 },
    });
  });
  expect(StyleSheet.flatten(actions.props.style)).toMatchObject({
    flexDirection: "column",
  });
  const content = renderer!.root.findByProps({ testID: "modal-content" });
  const body = renderer!.root.findByProps({ testID: "modal-body" });
  const recordBody = renderer!.root.findByProps({
    testID: "record-detail-body",
  });
  expect(StyleSheet.flatten(content.props.style).maxHeight).toBe("90%");
  expect(StyleSheet.flatten(body.props.style).flexShrink).toBe(1);
  expect(StyleSheet.flatten(recordBody.props.style).flexShrink).toBe(1);

  act(() => {
    Dimensions.set({
      window: { width: 568, height: 320, scale: 2, fontScale: 2 },
      screen: { width: 568, height: 320, scale: 2, fontScale: 2 },
    });
  });
  expect(StyleSheet.flatten(actions.props.style)).toMatchObject({
    flexDirection: "column",
  });
  expect(
    renderer!.root
      .findByProps({ testID: "record-detail-body" })
      .findByProps({ testID: "record-detail-actions" })
  ).toBeTruthy();

  act(() => {
    Dimensions.set({
      window: { width: 768, height: 1024, scale: 2, fontScale: 1 },
      screen: { width: 768, height: 1024, scale: 2, fontScale: 1 },
    });
  });
  expect(StyleSheet.flatten(actions.props.style)).toMatchObject({
    flexDirection: "row",
  });
  act(() => {
    renderer!.unmount();
  });
});
