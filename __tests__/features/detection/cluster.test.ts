import { confirmBoarding, initCluster, isNearBus, nextCluster } from '../../../src/features/detection/cluster';
import type { RssiDbm } from '../../../src/features/detection/types';

function run(trace: Array<RssiDbm | null>): string {
  let t = initCluster();
  for (const rssi of trace) t = nextCluster(t, rssi);
  return t.state;
}

describe('cluster BLE (îmbarcare / mers / coborâre)', () => {
  it('confirmă îmbarcarea după 3 poll-uri tari consecutive', () => {
    expect(run([-85, -80, -70, -62, -60, -58])).toBe('inside');
  });

  it('un vârf izolat nu bagă înăuntru', () => {
    expect(run([-85, -50, -85, -85])).toBe('outside');
  });

  it('o cădere izolată nu scoate afară (fără oscilații)', () => {
    expect(run([-62, -60, -58, -60, -78, -61, -60])).toBe('inside');
  });

  it('confirmă coborârea după 5 poll-uri slabe consecutive', () => {
    expect(run([-60, -60, -60, -76, -78, -80, -82, -85, -90])).toBe('outside');
  });

  it('poll-urile lipsă duc spre outside', () => {
    expect(run([-60, -60, -60, null, null, null, null, null, null])).toBe('outside');
  });

  it('GPS aproape/departe de autobuz', () => {
    const bus = { lat: 45.7489, lng: 21.2087 };
    expect(isNearBus(bus, bus)).toBe(true);
    expect(isNearBus({ lat: 45.7489, lng: 21.2087 }, { lat: 45.7589, lng: 21.2087 })).toBe(false);
  });

  it('plata cere BLE înăuntru ȘI GPS aproape', () => {
    expect(confirmBoarding(true, true)).toBe(true);
    expect(confirmBoarding(true, false)).toBe(false);
    expect(confirmBoarding(false, true)).toBe(false);
  });
});
