import React from "react";
import RecordCardModal from "@/components/modal/RecordCardModal";
import { Dimensions, StyleSheet, Text } from "react-native";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockPush = jest.fn();
const mockRefetch = jest.fn();
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
    flexDirection: "row",
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
      window: { width: 390, height: 844, scale: 3, fontScale: 1.5 },
      screen: { width: 390, height: 844, scale: 3, fontScale: 1.5 },
    });
  });
  expect(StyleSheet.flatten(actions.props.style)).toMatchObject({
    flexDirection: "column",
  });

  act(() => {
    Dimensions.set({
      window: { width: 390, height: 844, scale: 3, fontScale: 1 },
      screen: { width: 390, height: 844, scale: 3, fontScale: 1 },
    });
  });
  expect(StyleSheet.flatten(actions.props.style)).toMatchObject({
    flexDirection: "row",
  });
  act(() => {
    renderer!.unmount();
  });
});
