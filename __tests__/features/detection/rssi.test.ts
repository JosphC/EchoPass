import { isStrong, isWeak, smoothRssi } from '../../../src/features/detection/ble/rssi';

describe('netezire RSSI (BLE)', () => {
  it('primul eșantion trece nemodificat', () => {
    expect(smoothRssi(null, -70)).toBe(-70);
  });

  it('taie din zgomot fără să întârzie mult', () => {
    const v = smoothRssi(-60, -80);
    expect(v).toBeGreaterThan(-80);
    expect(v).toBeLessThan(-60);
  });

  it('poll-ul lipsă contează ca semnal foarte slab', () => {
    expect(smoothRssi(-60, null)).toBeLessThan(-75);
  });

  it('clasifică pragurile de intrare/ieșire', () => {
    expect(isStrong(-65, -65)).toBe(true);
    expect(isStrong(-66, -65)).toBe(false);
    expect(isWeak(-75, -75)).toBe(true);
    expect(isWeak(-74, -75)).toBe(false);
  });
});
