import React from "react";

import { useEditRoutineViewModel } from "@/hooks/useEditRoutineViewModel";

const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;

const categories = [
  { id: "1", name: "하체" },
  { id: "2", name: "상체" },
];

const routineDetail = {
  id: 1,
  title: "하체 루틴",
  categoryId: 1,
  category: "하체",
  createdAt: "2026-09-01T00:00:00.000Z",
  routine: [{ title: "스쿼트", set: 3, kg: 20 }],
};

jest.mock("@/hooks/queries/useCategory", () => ({
  useCategory: () => ({
    data: categories,
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

jest.mock("@/hooks/queries/useRoutine", () => ({
  useRoutineDetail: () => ({
    data: routineDetail,
    isLoading: false,
    isError: false,
  }),
}));

jest.mock("@/hooks/mutate/useUpdateRoutine", () => ({
  useUpdateRoutine: () => ({ isPending: false, mutateAsync: jest.fn() }),
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ routineId: "1" }),
  useRouter: () => ({ back: jest.fn() }),
}));

test("루틴 수정 중 사용자가 선택한 카테고리를 유지한다", () => {
  let viewModel: ReturnType<typeof useEditRoutineViewModel> | undefined;

  function Probe() {
    viewModel = useEditRoutineViewModel();
    return null;
  }

  act(() => {
    TestRenderer.create(<Probe />);
  });

  expect(viewModel?.selectedCategory?.id).toBe("1");

  act(() => {
    viewModel?.handleChangeCategory(categories[1]);
  });

  expect(viewModel?.selectedCategory?.id).toBe("2");
});
