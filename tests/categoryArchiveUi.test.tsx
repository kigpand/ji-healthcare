import React from "react";
import { Alert } from "react-native";
import CategoryList from "@/components/category/CategoryList";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;
const mockArchive = jest.fn().mockResolvedValue(true);
const mockDelete = jest.fn().mockResolvedValue(true);

jest.mock("@/hooks/mutate/useSetCategoryArchived", () => ({
  useSetCategoryArchived: () => ({
    mutateAsync: mockArchive,
    isPending: false,
    variables: undefined,
  }),
}));
jest.mock("@/hooks/mutate/useDeleteCategory", () => ({
  useDeleteCategory: () => ({
    mutateAsync: mockDelete,
    isPending: false,
    variables: undefined,
  }),
}));
jest.mock("@/utils/showToast", () => ({ showToast: jest.fn() }));

const category = { id: "7", name: "하체" };

function button(renderer: ReturnType<typeof TestRenderer.create>, label: string) {
  return renderer.root.findAll((node: { props: { onPress?: unknown; children?: React.ReactElement<{ children: string }> } }) =>
    typeof node.props.onPress === "function" && node.props.children?.props?.children === label)[0];
}

test("사용 중 카테고리는 삭제 대신 보관할 수 있다", async () => {
  let renderer: ReturnType<typeof TestRenderer.create>;
  await act(async () => { renderer = TestRenderer.create(<CategoryList item={category} />); });
  expect(button(renderer!, "삭제")).toBeUndefined();
  await act(async () => { await button(renderer!, "보관").props.onPress(); });
  expect(mockArchive).toHaveBeenCalledWith({ id: "7", archived: true });
  act(() => { renderer!.unmount(); });
});

test("보관 카테고리는 복원하거나 영구 삭제를 확인할 수 있다", async () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  let renderer: ReturnType<typeof TestRenderer.create>;
  await act(async () => { renderer = TestRenderer.create(<CategoryList item={category} archived />); });
  await act(async () => { await button(renderer!, "복원").props.onPress(); });
  expect(mockArchive).toHaveBeenCalledWith({ id: "7", archived: false });
  act(() => { button(renderer!, "삭제").props.onPress(); });
  expect(alert).toHaveBeenCalledWith("카테고리 삭제", "정말 삭제하시겠습니까?", expect.any(Array));
  const confirm = alert.mock.calls[0][2]?.find((item) => item.style === "destructive");
  await act(async () => { await confirm?.onPress?.(); });
  expect(mockDelete).toHaveBeenCalledWith("7");
  act(() => { renderer!.unmount(); });
  alert.mockRestore();
});
