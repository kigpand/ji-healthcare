const DAY_IN_MS = 1000 * 60 * 60 * 24;

// DB에는 UTC ISO 문자열을 저장하고, 조회 후에는 로컬 Date로 해석합니다.
export function parseStoredUtcDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

// 일간 집계 기준은 기기 로컬 시간대의 자정입니다.
export function getStartOfLocalDayTimestamp(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

// 로컬 자정을 UTC ISO 문자열로 바꿔 SQLite의 UTC 저장값과 비교합니다.
export function getStartOfLocalDayUtcIsoString(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).toISOString();
}

export function getCurrentUtcIsoString() {
  return new Date().toISOString();
}

export function formatRecordDate(value: string) {
  const date = parseStoredUtcDate(value);

  if (!date) {
    return value;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function getDayDifference(laterTimestamp: number, earlierTimestamp: number) {
  return Math.round((laterTimestamp - earlierTimestamp) / DAY_IN_MS);
}
