import { estimateArrivals, haversineKm, nearestStation } from '../../../src/features/map/arrivals';
import type { BusMarker } from '../../../src/features/map';
import type { Station } from '../../../src/features/map';

function marker(line: string, lat: number, lng: number, speedKmh?: number): BusMarker {
  return {
    bus: { id: `${line}-1`, line, destination: 'X', crowd: 1, delayMin: 0, delayReason: null },
    position: { busId: `${line}-1`, lat, lng, nextStop: 'S', arrivesInMin: 0, updatedAt: '2026-10-04T09:00:00Z', speedKmh },
  };
}

const station: Station = { id: '1', name: 'Test', lat: 45.75, lng: 21.22, lines: ['5', '12'] };

describe('arrivals', () => {
  it('measures haversine distance', () => {
    expect(haversineKm({ lat: 45.75, lng: 21.22 }, { lat: 45.75, lng: 21.22 })).toBeCloseTo(0, 5);
    expect(haversineKm({ lat: 45.75, lng: 21.22 }, { lat: 45.76, lng: 21.22 })).toBeGreaterThan(1);
  });

  it('finds the nearest station to a point', () => {
    const near = nearestStation({ lat: 45.75113, lng: 21.22364 });
    expect(near.name).toBe('Catedrala Mitropolitană');
  });

  it('estimates per-line ETAs from live speed, nearest first', () => {
    const markers = [
      marker('5', 45.759, 21.22, 30),
      marker('12', 45.79, 21.22, 18),
      marker('99', 45.7501, 21.2201, 50),
      { ...marker('5', 45.8, 21.3, 30), bus: { id: 'x', line: '5', destination: 'X', crowd: 1 as const, delayMin: 0, delayReason: null } },
    ];
    const arrivals = estimateArrivals(station, markers);
    expect(arrivals.map((a) => a.line)).toEqual(['5', '12']);
    expect(arrivals[0].etaMin).toBeLessThan(arrivals[1].etaMin);
  });

  it('falls back to urban average when speed is unknown and skips positionless buses', () => {
    const noSpeed = marker('5', 45.759, 21.22);
    delete noSpeed.position?.speedKmh;
    const noPosition: BusMarker = { ...marker('12', 45.79, 21.22, 18), position: undefined };
    const arrivals = estimateArrivals(station, [noSpeed, noPosition]);
    expect(arrivals).toHaveLength(1);
    expect(arrivals[0].line).toBe('5');
    expect(arrivals[0].etaMin).toBeGreaterThan(0);
  });

  it('returns empty when no serving line has live vehicles', () => {
    expect(estimateArrivals(station, [marker('99', 45.7501, 21.2201, 50)])).toEqual([]);
  });

  it('drops guesses beyond 90 minutes', () => {
    const far = marker('5', 46.5, 22.0, 0);
    expect(estimateArrivals(station, [far])).toEqual([]);
  });
});
