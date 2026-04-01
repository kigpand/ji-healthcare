const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function parseDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function getStartOfDayTimestamp(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

export function formatRecordDate(value: string) {
  const date = parseDate(value);

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
