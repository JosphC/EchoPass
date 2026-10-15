interface TimetableCalendar {
  services: [number[], number, number][];
  exceptions: Record<string, { add: number[]; remove: number[] }>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

let lastDay: number | null | undefined;

function dateIntToMs(dateInt: number): number {
  return new Date(Math.floor(dateInt / 10000), (Math.floor(dateInt / 100) % 100) - 1, dateInt % 100).getTime();
}

/** Last calendar day (YYYYMMDD) any bundled GTFS service still runs. */
export function timetableLastServiceDay(calendar?: TimetableCalendar): number | null {
  if (!calendar && lastDay !== undefined) return lastDay;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const tt = calendar ?? (require('../../../assets/timetable.json') as TimetableCalendar);
  let max = 0;
  for (const [, , end] of tt.services) max = Math.max(max, end);
  for (const [day, ex] of Object.entries(tt.exceptions)) {
    if (ex.add.length > 0) max = Math.max(max, Number(day));
  }
  const result = max > 0 ? max : null;
  if (!calendar) lastDay = result;
  return result;
}

/**
 * Whole days the offline timetable stays valid, counting today: 1 = last
 * day, 0 or less = expired (rides fall back to estimates). null = unknown.
 */
export function timetableDaysLeft(nowMs: number, calendar?: TimetableCalendar): number | null {
  const last = timetableLastServiceDay(calendar);
  if (last === null) return null;
  const now = new Date(nowMs);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((dateIntToMs(last) - today) / DAY_MS) + 1;
}
