/** Timișoara's wall clock: GTFS times and every displayed time use it. */
export const TRANSIT_TIME_ZONE = 'Europe/Bucharest';

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 0 = Monday … 6 = Sunday (GTFS calendar order). */
  weekdayIdx: number;
}

let formatter: Intl.DateTimeFormat | null | undefined;

function getFormatter(): Intl.DateTimeFormat | null {
  if (formatter === undefined) {
    try {
      formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: TRANSIT_TIME_ZONE,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      // Engine without time-zone data: fall back to the device clock.
      formatter = null;
    }
  }
  return formatter;
}

/** Wall-clock parts in Timișoara for an instant (device time zone as fallback). */
export function transitParts(ms: number): ZonedParts {
  const match = getFormatter()?.format(new Date(ms)).match(/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+)/);
  const [year, month, day, hour, minute] = match
    ? [Number(match[3]), Number(match[1]), Number(match[2]), Number(match[4]) % 24, Number(match[5])]
    : (() => {
        const d = new Date(ms);
        return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];
      })();
  const weekdayIdx = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
  return { year, month, day, hour, minute, weekdayIdx };
}

/** Instant of local midnight in Timișoara on the calendar day of `ms`. */
export function transitMidnightMs(ms: number): number {
  const p = transitParts(ms);
  // Wall-clock minutes elapsed since midnight; seconds are below display precision.
  const sinceMidnightMs = (p.hour * 60 + p.minute) * 60_000 + (ms % 60_000);
  return ms - sinceMidnightMs;
}

/** "HH:MM" on Timișoara's clock. */
export function formatTransitTime(ms: number): string {
  const p = transitParts(ms);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}
