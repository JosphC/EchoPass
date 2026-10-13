import { formatLei, formatMinutes, formatRon, formatShortDateTime, formatTime, timeAgoShort } from '../../src/core/utils/format';
import { contrastText } from '../../src/core/utils/contrast';
import { lineColor } from '../../src/core/theme/lineColors';
import { haversineKm } from '../../src/core/utils/geo';

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
