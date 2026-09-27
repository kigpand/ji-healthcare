import React from "react";
import { Alert, Modal } from "react-native";
import CompletionModal from "@/components/modal/CompletionModal";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockDispatch = jest.fn();
const mockRetry = jest.fn();
let mockPrevented = false;
let mockOnRemove: (event: { data: { action: { type: string } } }) => void;
const mockReplace = jest.fn(() => mockNavigate({ type: "REPLACE" }));

function mockNavigate(action: { type: string }) {
  if (mockPrevented) mockOnRemove({ data: { action } });
  else mockDispatch(action);
}

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useNavigation: () => ({ dispatch: mockDispatch }),
}));
jest.mock("expo-router/react-navigation", () => ({
  usePreventRemove: (prevented: boolean, callback: typeof mockOnRemove) => {
    mockPrevented = prevented;
    mockOnRemove = callback;
  },
}));

let renderer: ReturnType<typeof TestRenderer.create>;
let alert: jest.SpyInstance;
const defaults = {
  visible: true, recordAdded: false, recordSaving: false, recordSaveFailed: false,
  onRetrySaveRecord: mockRetry,
};

function render(props: Partial<typeof defaults>) {
  act(() => {
    const element = <CompletionModal {...defaults} {...props} />;
    if (renderer) renderer.update(element);
    else renderer = TestRenderer.create(element);
  });
}

function button(label: string) {
  return renderer.root.findAll((node: { props: { onPress?: unknown; children?: React.ReactElement<{ children: string }> } }) =>
    typeof node.props.onPress === "function" && node.props.children?.props?.children === label)[0];
}

function press(label: string) {
  act(() => { button(label).props.onPress(); });
}

beforeEach(() => {
  mockPrevented = false;
  alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => {
  act(() => { renderer?.unmount(); });
  renderer = undefined;
  alert.mockRestore();
});

test.each([false, true])("저장 대기/진행 중에는 버튼·모달 뒤로가기·라우트 이탈을 막는다 (%p)", (recordSaving) => {
  render({ recordSaving });
  press("홈으로 이동");
  act(() => { renderer.root.findByType(Modal).props.onRequestClose(); });
  act(() => { mockNavigate({ type: "GO_BACK" }); });
  expect(mockDispatch).not.toHaveBeenCalled();
  expect(alert).not.toHaveBeenCalled();
  const home = button("홈으로 이동");
  expect(home.props.disabled).toBe(true);
});

test.each(["홈", "뒤로가기", "라우트"])("실패 후 %s 이탈은 확인 취소 시 유지하고 포기 확인 시에만 이동한다", (source) => {
  render({ recordSaveFailed: true });
  const leave = () => {
    if (source === "홈") press("홈으로 이동");
    else if (source === "뒤로가기") act(() => { renderer.root.findByType(Modal).props.onRequestClose(); });
    else act(() => { mockNavigate({ type: "GO_BACK" }); });
  };
  leave();
  expect(mockDispatch).not.toHaveBeenCalled();
  expect(alert).toHaveBeenCalledTimes(1);
  const buttons = alert.mock.calls[0][2];
  act(() => { buttons.find((button: { style: string }) => button.style === "cancel").onPress?.(); });
  expect(mockDispatch).not.toHaveBeenCalled();
  leave();
  const confirm = alert.mock.calls[1][2].find((button: { style: string }) => button.style === "destructive");
  act(() => { confirm.onPress(); });
  expect(mockDispatch).toHaveBeenCalledWith({ type: source === "라우트" ? "GO_BACK" : "REPLACE" });
});

test("실패 후 재시도 중에는 이탈을 막고 저장 성공 후 홈으로 이동한다", () => {
  render({ recordSaveFailed: true });
  press("다시 저장");
  expect(mockRetry).toHaveBeenCalledTimes(1);
  render({ recordSaving: true });
  act(() => { renderer.root.findByType(Modal).props.onRequestClose(); });
  expect(mockDispatch).not.toHaveBeenCalled();
  render({ recordAdded: true });
  press("홈으로 이동");
  expect(mockDispatch).toHaveBeenCalledTimes(1);
  expect(alert).not.toHaveBeenCalled();
});

test("운동 완료 전에는 이탈을 차단하지 않는다", () => {
  render({ visible: false });
  act(() => { mockNavigate({ type: "GO_BACK" }); });
  expect(mockDispatch).toHaveBeenCalledWith({ type: "GO_BACK" });
});
