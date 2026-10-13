import { loadStations } from '../../src/features/map';
import { findForwardRides } from '../../src/services/repositories/gtfs/timetable';
import { getTripShapeId, getTripShapeSlice } from '../../src/services/repositories/gtfs/shapes';

const NOON_SUNDAY = new Date(2026, 9, 11, 12, 0, 0).getTime();

function distKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const p1 = (aLat * Math.PI) / 180;
  const p2 = (bLat * Math.PI) / 180;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

describe('GTFS shapes (exact bus paths)', () => {
  it('draws E2 Sala C. Jude -> Consiliul Europei on the real Tur shape', () => {
    const stations = loadStations();
    const board = stations.find((s) => s.id === '175')!;
    const alight = stations.find((s) => s.id === '300')!;
    const rides = findForwardRides('175', '300', 'E2', NOON_SUNDAY, 120, 1);
    expect(rides.length).toBeGreaterThan(0);
    const trip = rides[0];

    expect(getTripShapeId(trip.tripIdx)).toBe('E2.1_T');

    const slice = getTripShapeSlice(trip.tripIdx, [board, alight]);
    expect(slice).not.toBeNull();
    expect(slice!.length).toBeGreaterThan(10);
    // Touches both stations (snap guard is 300 m).
    const first = slice![0];
    const last = slice![slice!.length - 1];
    expect(distKm(first.lat, first.lng, board.lat, board.lng)).toBeLessThan(0.15);
    expect(distKm(last.lat, last.lng, alight.lat, alight.lng)).toBeLessThan(0.15);
    // Stays inside Timișoara.
    for (const p of slice!) {
      expect(p.lat).toBeGreaterThan(45.55);
      expect(p.lat).toBeLessThan(45.85);
      expect(p.lng).toBeGreaterThan(21.1);
      expect(p.lng).toBeLessThan(21.35);
    }
    // Follows streets, not a straight line: deviates from the beeline.
    let maxDev = 0;
    for (const p of slice!) {
      const t =
        ((p.lat - board.lat) * (alight.lat - board.lat) + (p.lng - board.lng) * (alight.lng - board.lng)) /
        ((alight.lat - board.lat) ** 2 + (alight.lng - board.lng) ** 2 || 1);
      const c = Math.max(0, Math.min(1, t));
      const projLat = board.lat + c * (alight.lat - board.lat);
      const projLng = board.lng + c * (alight.lng - board.lng);
      maxDev = Math.max(maxDev, distKm(p.lat, p.lng, projLat, projLng));
    }
    expect(maxDev).toBeGreaterThan(0.05);
  });

  it('refuses the reverse direction on the same trip', () => {
    const stations = loadStations();
    const board = stations.find((s) => s.id === '300')!;
    const alight = stations.find((s) => s.id === '175')!;
    const rides = findForwardRides('175', '300', 'E2', NOON_SUNDAY, 120, 1);
    expect(rides.length).toBeGreaterThan(0);
    // Same physical trip cannot draw 300 -> 175: the shape only goes forward.
    expect(getTripShapeSlice(rides[0].tripIdx, [board, alight])).toBeNull();
  });
});
