import { formatRecordDate, getCurrentUtcIsoString, getStartOfLocalDayUtcIsoString, parseStoredUtcDate } from '@/utils/date';

afterEach(() => jest.useRealTimers());

test('잘못된 저장 날짜를 거부한다', () => {
  expect(parseStoredUtcDate('invalid')).toBeNull();
});

test('한국 시간 자정 경계에서 날짜와 조회 시작점을 계산한다', () => {
  expect(formatRecordDate('2026-09-18T15:00:00.000Z')).toBe('2026.09.19');
  expect(formatRecordDate('2026-09-18T14:59:59.000Z')).toBe('2026.09.18');
  expect(getStartOfLocalDayUtcIsoString(new Date('2026-09-19T03:00:00Z')))
    .toBe('2026-09-18T15:00:00.000Z');
});

test('현재 시간을 UTC ISO로 저장한다', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-09-19T03:00:00Z'));
  expect(getCurrentUtcIsoString()).toBe('2026-09-19T03:00:00.000Z');
});
