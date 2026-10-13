import { stationsOfLine, tripViaStations } from '../../src/features/planner/transitHelpers';
import { findForwardRides, lineRunsForwardOn } from '../../src/services/repositories/gtfs/timetable';
import { getTripShapeSlice } from '../../src/services/repositories/gtfs/shapes';

// Sunday 2026-10-11, full service day window (deterministic).
const DAY_START = new Date(2026, 9, 11, 0, 0, 0).getTime();

function distKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const p1 = (aLat * Math.PI) / 180;
  const p2 = (bLat * Math.PI) / 180;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

describe('E2 shape sweep (no spikes anywhere on the line)', () => {
  it('draws every forward station pair on the exact path', () => {
    const e2 = stationsOfLine().get('E2') ?? [];
    expect(e2.length).toBeGreaterThan(10);
    let checked = 0;
    let exact = 0;
    const failures: string[] = [];
    for (const board of e2) {
      for (const alight of e2) {
        if (board.id === alight.id) continue;
        if (!lineRunsForwardOn(board.id, alight.id, 'E2', DAY_START)) continue;
        checked += 1;
        const rides = findForwardRides(board.id, alight.id, 'E2', DAY_START, 1440, 1);
        if (rides.length === 0) continue;
        const ride = rides[0];
        const via = tripViaStations(ride.tripIdx, ride.boardSec, ride.alightSec);
        const slice = getTripShapeSlice(ride.tripIdx, [board, ...via, alight]);
        const tag = `${board.name}(${board.id}) -> ${alight.name}(${alight.id})`;
        if (!slice) {
          failures.push(`${tag}: no slice`);
          continue;
        }
        exact += 1;
        const first = slice[0];
        const last = slice[slice.length - 1];
        if (distKm(first.lat, first.lng, board.lat, board.lng) > 0.15) {
          failures.push(`${tag}: slice starts far from board`);
        }
        if (distKm(last.lat, last.lng, alight.lat, alight.lng) > 0.15) {
          failures.push(`${tag}: slice ends far from alight`);
        }
        let path = 0;
        for (let i = 1; i < slice.length; i++) {
          path += distKm(slice[i - 1].lat, slice[i - 1].lng, slice[i].lat, slice[i].lng);
        }
        const bee = distKm(board.lat, board.lng, alight.lat, alight.lng);
        if (bee > 0.3 && path / bee > 4) {
          failures.push(`${tag}: path/beeline ${(path / bee).toFixed(2)}`);
        }
      }
    }
    expect(checked).toBeGreaterThan(20);
    expect(failures).toEqual([]);
    // The exact shape must cover the line, not just a few pairs.
    expect(exact / checked).toBeGreaterThan(0.9);
  }, 120000);
});
