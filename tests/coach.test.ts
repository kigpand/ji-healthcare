import type { WorkoutProfile } from '@/interface/coach';
import type { IRecord } from '@/interface/record';
import type { IRoutineInfo } from '@/interface/routine';
import { buildCoachRequest } from '@/utils/coach';

const profile: WorkoutProfile = { goal: '체력 유지', environment: '홈트', minutes: 30, equipment: '없음' };
const record = (date: string, id = 1): IRecord => ({ id, _id: String(id), routineId: 1, title: '운동', category: '하체', date });
const routine: IRoutineInfo = { id: 1, title: '하체', category: '하체', categoryId: 1,
  createdAt: '2026-09-01T00:00:00Z', routine: [{ title: '스쿼트', set: 3, kg: 0 }] };

test('월요일 자정부터 현재까지만 조회하고 같은 날 여러 기록은 하루로 집계한다', () => {
  const result = buildCoachRequest(profile, [
    record('2026-09-13T14:59:59Z'), // 일요일 23:59:59 KST
    record('2026-09-13T15:00:00Z', 2), // 월요일 00:00 KST
    record('2026-09-13T16:00:00Z', 3),
    record('2026-09-20T03:00:00Z', 4),
    record('2026-09-20T03:00:01Z', 5),
    record('invalid', 6),
  ], [], [], new Date('2026-09-20T03:00:00Z'));
  expect(result.records.map((item) => item.id)).toEqual([2, 3, 4]);
  expect(result.summary).toEqual({ workoutCount: 3, workoutDays: 2 });
  expect(result.period.start).toBe('2026-09-13T15:00:00.000Z');
});

test('월요일과 연도 경계에도 같은 주의 월요일을 기준으로 한다', () => {
  expect(buildCoachRequest(profile, [], [], [], new Date('2026-09-20T15:00:00Z')).period.start)
    .toBe('2026-09-20T15:00:00.000Z');
  expect(buildCoachRequest(profile, [], [], [], new Date('2026-01-01T03:00:00Z')).period.start)
    .toBe('2025-12-28T15:00:00.000Z');
});

test('변경한 설정, 실제 루틴과 기록 한계를 추천 요청에 포함한다', () => {
  const changed: WorkoutProfile = { ...profile, goal: '근육 증가', environment: '헬스장', minutes: 60, equipment: '덤벨, 벤치' };
  const request = buildCoachRequest(changed, [], [routine], [{ id: '1', name: '하체' }]);
  expect(request.profile).toEqual(changed);
  expect(request.routines).toEqual([routine]);
  expect(request.summary).toEqual({ workoutCount: 0, workoutDays: 0 });
  expect(request.limitations.length).toBeGreaterThan(0);
});

test('삭제된 루틴의 과거 기록은 nullable 루틴 ID로 보존한다', () => {
  const deletedRoutineRecord = { ...record('2026-09-24T03:00:00Z'), routineId: 0 };
  const request = buildCoachRequest(
    profile,
    [deletedRoutineRecord],
    [],
    [],
    new Date('2026-09-25T03:00:00Z')
  );

  expect(request.records[0].routineId).toBeNull();
});

test('AI 요청 크기 제한을 넘는 데이터는 일부만 포함하고 제외 사실을 알린다', () => {
  const routines = Array.from({ length: 101 }, (_, index) => ({
    ...routine,
    id: index + 1,
  }));
  const records = Array.from({ length: 101 }, (_, index) =>
    record('2026-09-24T03:00:00Z', index + 1)
  );
  const request = buildCoachRequest(
    profile,
    records,
    routines,
    [],
    new Date('2026-09-25T03:00:00Z')
  );

  expect(request.records).toHaveLength(100);
  expect(request.routines).toHaveLength(100);
  expect(request.routines[0].id).toBe(2);
  expect(request.summary.workoutCount).toBe(101);
  expect(request.limitations).toEqual(
    expect.arrayContaining([
      expect.stringContaining('이번 주 기록 중 최근 100개'),
      expect.stringContaining('등록 루틴 중 최근 100개'),
    ])
  );
});
