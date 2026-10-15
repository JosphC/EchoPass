import { formatLei, formatMinutes, formatRon, formatShortDateTime, formatTime, timeAgoShort } from '../../src/core/utils/format';
import { contrastText } from '../../src/core/utils/contrast';
import { lineColor } from '../../src/core/theme/lineColors';
import { haversineKm, metersPerPixel, pointsAlong } from '../../src/core/utils/geo';
import { formatTransitTime, transitMidnightMs, transitParts } from '../../src/core/utils/timezone';

describe('format utils', () => {
  it('formats lei with two decimals', () => {
    expect(formatRon(8)).toBe('8.00 lei');
  });

  it('formats lei with comma decimals in Romanian', () => {
    expect(formatLei(3)).toBe('3,00 lei');
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

  it('formats short stamps like 24 Mar · 07:42', () => {
    expect(formatShortDateTime('2026-03-24T07:42:00Z')).toBe('24 mar · 07:42');
  });

  it('formats wall-clock time', () => {
    expect(formatTime('2026-10-04T09:05:00Z')).toMatch(/^\d{2}:\d{2}$/);
  });

  it('picks readable text for route colors', () => {
    expect(contrastText('#FFFFFF')).toBe('#111827');
    expect(contrastText('#111827')).toBe('#FFFFFF');
    expect(contrastText('nope')).toBe('#FFFFFF');
  });

  it('assigns stable line colors', () => {
    expect(lineColor('17')).toBe(lineColor('17'));
    expect(lineColor('17')).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe('geo utils', () => {
  it('returns ~0 for the same point', () => {
    const point = { lat: 44.43, lng: 26.1 };
    expect(haversineKm(point, point)).toBeCloseTo(0, 5);
  });
});

describe('pointsAlong (buline pentru mersul pe jos)', () => {
  const a = { lat: 45.75, lng: 21.22 };
  const b = { lat: 45.751, lng: 21.22 }; // ~111 m north
  const c = { lat: 45.751, lng: 21.2214 }; // ~109 m east

  it('spaces points evenly and keeps both ends', () => {
    const pts = pointsAlong([a, b], 10);
    expect(pts[0]).toEqual(a);
    expect(pts[pts.length - 1]).toEqual(b);
    expect(pts.length).toBeGreaterThanOrEqual(11);
    expect(pts.length).toBeLessThanOrEqual(13);
  });

  it('carries the spacing across corners instead of restarting at every vertex', () => {
    const pts = pointsAlong([a, b, c], 25);
    // ~220 m / 25 m ≈ 9 gaps → ~10 points (+ forced end).
    expect(pts.length).toBeGreaterThanOrEqual(9);
    expect(pts.length).toBeLessThanOrEqual(11);
  });

  it('handles degenerate input', () => {
    expect(pointsAlong([], 10)).toEqual([]);
    expect(pointsAlong([a], 10)).toEqual([a]);
    expect(pointsAlong([a, b], 0)).toEqual([a, b]);
  });

  it('halves ground meters per pixel with every zoom level', () => {
    expect(metersPerPixel(15, 45.75) / metersPerPixel(16, 45.75)).toBeCloseTo(2, 5);
  });
});

describe('ora Timișoarei (orar GTFS)', () => {
  it('uses Romanian summer and winter time, whatever the phone zone', () => {
    expect(formatTransitTime(new Date('2026-07-01T06:30:00Z').getTime())).toBe('09:30'); // EEST +3
    expect(formatTransitTime(new Date('2026-12-01T06:30:00Z').getTime())).toBe('08:30'); // EET +2
  });

  it('rolls the service day over at Romanian midnight', () => {
    const lateUtc = new Date('2026-10-14T21:30:00Z').getTime(); // 00:30 on the 15th in Timișoara
    const p = transitParts(lateUtc);
    expect([p.year, p.month, p.day, p.hour]).toEqual([2026, 10, 15, 0]);
    expect(p.weekdayIdx).toBe(3); // Thursday
    expect(transitMidnightMs(lateUtc)).toBe(new Date('2026-10-14T21:00:00Z').getTime());
  });
});
