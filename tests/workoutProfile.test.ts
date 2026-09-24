import type { WorkoutProfile } from '@/interface/coach';
import { getDatabase } from '@/lib/database';
import { validateWorkoutProfile } from '@/schema/workoutProfile.schema';
import { getWorkoutProfile, saveWorkoutProfile } from '@/service/workoutProfileService';

jest.mock('@/lib/database', () => ({ getDatabase: jest.fn() }));
const profile: WorkoutProfile = { goal: '체력 유지', environment: '홈트', minutes: 30, equipment: '  없음  ' };
const runAsync = jest.fn().mockResolvedValue({ changes: 1 });
const getFirstAsync = jest.fn();

beforeEach(() => {
  jest.mocked(getDatabase).mockResolvedValue({ runAsync, getFirstAsync } as unknown as Awaited<ReturnType<typeof getDatabase>>);
});

test.each([0, 4, 181, 30.5, NaN, Infinity])('잘못된 운동 시간 %p를 거부한다', (minutes) => {
  expect(() => validateWorkoutProfile({ ...profile, minutes })).toThrow('운동 시간');
});

test('장비 미입력, 너무 긴 장비 설명과 잘못된 선택값을 거부한다', () => {
  expect(() => validateWorkoutProfile({ ...profile, equipment: ' ' })).toThrow('장비');
  expect(() => validateWorkoutProfile({ ...profile, equipment: 'a'.repeat(301) })).toThrow('장비');
  expect(() => validateWorkoutProfile({ ...profile, goal: 'unknown' as WorkoutProfile['goal'] })).toThrow('목표');
  expect(() => validateWorkoutProfile({ ...profile, environment: 'unknown' as WorkoutProfile['environment'] })).toThrow('장소');
});

test('검증 실패 시 DB를 수정하지 않는다', async () => {
  await expect(saveWorkoutProfile({ ...profile, minutes: 0 })).rejects.toThrow();
  expect(runAsync).not.toHaveBeenCalled();
});

test('저장과 수정은 동일한 개인 설정 행에 적용한다', async () => {
  const saved = await saveWorkoutProfile(profile);
  expect(saved.equipment).toBe('없음');
  expect(runAsync).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT(id) DO UPDATE'), '체력 유지', '홈트', 30, '없음');
  await saveWorkoutProfile({ ...profile, minutes: 60 });
  expect(runAsync).toHaveBeenLastCalledWith(expect.stringContaining('VALUES (1,'), '체력 유지', '홈트', 60, '없음');
});

test('최초 실행은 설정 없음, 재조회는 저장된 설정을 반환한다', async () => {
  getFirstAsync.mockResolvedValueOnce(null).mockResolvedValueOnce(profile);
  await expect(getWorkoutProfile()).resolves.toBeNull();
  await expect(getWorkoutProfile()).resolves.toEqual(profile);
});
