import { DAILY_CAP_RON, CHECKOUT_LOST_MS, SINGLE_FARE_RON, ULTRASOUND_LISTEN_MS } from '../src/core/config';
import { lightColors } from '../src/core/theme';

describe('phase1 constants', () => {
  it('defines detection and fare thresholds', () => {
    expect(ULTRASOUND_LISTEN_MS).toBe(3000);
    expect(CHECKOUT_LOST_MS).toBe(120_000);
    expect(SINGLE_FARE_RON).toBe(3);
    expect(DAILY_CAP_RON).toBe(8);
  });

  it('uses the product primary color', () => {
    expect(lightColors.primary).toBe('#3F7DF4');
  });
});
