import { formatMinutes, formatRon } from '../src/core/utils/format';
import { haversineKm } from '../src/core/utils/geo';

describe('format utils', () => {
  it('formats lei with two decimals', () => {
    expect(formatRon(8)).toBe('8.00 lei');
  });

  it('formats minutes', () => {
    expect(formatMinutes(4.6)).toBe('5 min');
  });
});

describe('geo utils', () => {
  it('returns ~0 for the same point', () => {
    const point = { lat: 44.43, lng: 26.1 };
    expect(haversineKm(point, point)).toBeCloseTo(0, 5);
  });
});
