import { estimateArrivals, haversineKm, nearestStation } from '../../../src/features/map/arrivals';
import type { BusMarker } from '../../../src/features/map';
import type { Station } from '../../../src/features/map';
import rawShapes from '../../../src/assets/shapes.json';

function marker(line: string, lat: number, lng: number, speedKmh?: number, destination = 'X'): BusMarker {
  return {
    bus: { id: `${line}-1`, line, destination, crowd: 1, delayMin: 0, delayReason: null },
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

  it('keeps a bus waiting at a light instead of dropping it (speed 0 → urban average)', () => {
    const stopped = marker('5', 45.759, 21.22, 0);
    const arrivals = estimateArrivals(station, [stopped]);
    expect(arrivals).toHaveLength(1);
    // ~1 km × road factor at 18 km/h ≈ 4 min, not 60+ min at 1 km/h.
    expect(arrivals[0].etaMin).toBeGreaterThanOrEqual(2);
    expect(arrivals[0].etaMin).toBeLessThan(10);
  });

  it('caps a boulevard speed burst to the urban average', () => {
    const fast = estimateArrivals(station, [marker('5', 45.79, 21.22, 70)]);
    const capped = estimateArrivals(station, [marker('5', 45.79, 21.22, 35)]);
    expect(fast[0].etaMin).toBe(capped[0].etaMin);
  });

  describe('direction along the GTFS shape (line 15 → T. Grozăvescu)', () => {
    const shapes = rawShapes as { ids: string[]; coords: number[][][] };
    const pts = shapes.coords[shapes.ids.indexOf('15.1_T')];
    const stop: Station = { id: '174', name: 'Casa Tineretului', lat: 45.74169, lng: 21.23922, lines: ['15'] };
    const nearest = pts.reduce(
      (best, p, i) => (Math.hypot(p[0] - stop.lat, p[1] - stop.lng) < Math.hypot(pts[best][0] - stop.lat, pts[best][1] - stop.lng) ? i : best),
      0,
    );
    const before = pts[Math.max(0, nearest - 3)];
    const after = pts[Math.min(pts.length - 1, nearest + 3)];
    const headsign = 'T. Grozăvescu (Poșta Mare)';

    it('shows a bus that still has to reach the stop', () => {
      const arrivals = estimateArrivals(stop, [marker('15', before[0], before[1], 20, headsign)]);
      expect(arrivals).toHaveLength(1);
      expect(arrivals[0].etaMin).toBeGreaterThan(0);
    });

    it('hides a bus that already passed the stop (driving away)', () => {
      expect(estimateArrivals(stop, [marker('15', after[0], after[1], 20, headsign)])).toEqual([]);
    });

    it('matches headsigns regardless of diacritics', () => {
      const plain = estimateArrivals(stop, [marker('15', after[0], after[1], 20, 't. grozavescu (posta mare)')]);
      expect(plain).toEqual([]);
    });
  });
});
