import { validateCategoryRequestInput } from '@/schema/category.schema';
import { validateRoutineRequestInput } from '@/schema/routine.schema';

const routine = {
  title: ' 하체 ',
  categoryId: '1',
  routine: [{ title: ' 스쿼트 ', set: '3', kg: '2.5', link: '' }],
};

test('루틴 입력을 정규화하고 소수점 무게를 보존한다', () => {
  const result = validateRoutineRequestInput(routine);
  expect(result.success).toBe(true);
  if (!result.success) throw new Error(result.messages);
  expect(result.data).toEqual({
    title: '하체', categoryId: 1,
    routine: [{ title: '스쿼트', set: 3, kg: 2.5, link: undefined }],
  });
});

test.each([0, -1, 1.5, 'abc', ''])('잘못된 세트 수 %p를 거부한다', (set) => {
  expect(validateRoutineRequestInput({
    ...routine, routine: [{ ...routine.routine[0], set }],
  }).success).toBe(false);
});

test.each([-1, Infinity, 'abc'])('잘못된 무게 %p를 거부한다', (kg) => {
  expect(validateRoutineRequestInput({
    ...routine, routine: [{ ...routine.routine[0], kg }],
  }).success).toBe(false);
});

test('카테고리 미선택과 빈 이름을 거부한다', () => {
  expect(validateRoutineRequestInput({ ...routine, categoryId: '' }).success).toBe(false);
  expect(validateRoutineRequestInput({ ...routine, title: '  ' }).success).toBe(false);
  expect(validateCategoryRequestInput({ category: '  ' }).success).toBe(false);
});

test('카테고리 이름의 공백을 정리한다', () => {
  expect(validateCategoryRequestInput({ category: ' 하체 ' })).toEqual({
    success: true, data: { category: '하체' },
  });
});
