import React from "react";
import RecordCardModal from "@/components/modal/RecordCardModal";
import { Text } from "react-native";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockPush = jest.fn();
const mockRefetch = jest.fn();
let mockItems = [
  { id: 1, title: "스쿼트", kg: 22.5, set: 3, sortOrder: 0 },
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
  mockItems = [
    { id: 1, title: "스쿼트", kg: 22.5, set: 3, sortOrder: 0 },
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
