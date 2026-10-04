import { formatMinutes, formatRon, timeAgoShort } from '../../src/core/utils/format';
import { haversineKm } from '../../src/core/utils/geo';

describe('format utils', () => {
  it('formats lei with two decimals', () => {
    expect(formatRon(8)).toBe('8.00 lei');
  });

  it('formats minutes', () => {
    expect(formatMinutes(4.6)).toBe('5 min');
  });

  it('formats compact ages', () => {
    const now = new Date('2026-10-03T09:00:00Z').getTime();
    expect(timeAgoShort('2026-10-03T08:51:00Z', now)).toBe('9min');
    expect(timeAgoShort('2026-10-03T07:00:00Z', now)).toBe('2h');
    expect(timeAgoShort('2026-10-01T09:00:00Z', now)).toBe('2z');
    expect(timeAgoShort('2026-10-04T09:00:00Z', now)).toBe('0min');
  });
});

describe('geo utils', () => {
  it('returns ~0 for the same point', () => {
    const point = { lat: 44.43, lng: 26.1 };
    expect(haversineKm(point, point)).toBeCloseTo(0, 5);
  });
});
