import { render } from '@testing-library/react-native';
import rawShapes from '../../../src/assets/shapes.json';
import { DepartureRow } from '../../../src/features/home/components/arrivals/DepartureRow';
import { ageLabel } from '../../../src/features/home/components/arrivals/StationAlert';
import type { StopArrivalItem } from '../../../src/features/home/hooks/useStopArrivals';
import { bearingOnRoute } from '../../../src/services/repositories/gtfs/routeProgress';
import { createArrivalsMock } from '../../../src/services/repositories/mock/arrivalsMock';
import type { BusRepo } from '../../../src/services/repositories/types';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

describe('live merged with the timetable (Google Maps style)', () => {
  // Weekday 10:00 in Timișoara; line 15 → T. Grozăvescu serves "Casa Tineretului".
  const MORNING = new Date('2026-10-14T07:00:00Z').getTime();
  const HEADSIGN = 'T. Grozăvescu (Poșta Mare)';
  const shapes = rawShapes as { ids: string[]; coords: number[][][] };
  const pts = shapes.coords[shapes.ids.indexOf('15.1_T')];
  const stop = { lat: 45.74169, lng: 21.23922 };
  const dist = (p: number[]) => Math.hypot(p[0] - stop.lat, p[1] - stop.lng);
  const nearest = pts.reduce((best, p, i) => (dist(p) < dist(pts[best]) ? i : best), 0);
  const before = pts[Math.max(0, nearest - 3)];
  const after = pts[Math.min(pts.length - 1, nearest + 3)];

  function fleet(vertex: number[], updatedAtMs = MORNING): BusRepo {
    return {
      getBuses: async () => [
        { id: 'v1', line: '15', destination: HEADSIGN, crowd: 1, delayMin: 0, delayReason: null },
      ],
      getPositions: async () => [
        {
          busId: 'v1',
          lat: vertex[0],
          lng: vertex[1],
          nextStop: 'x',
          arrivesInMin: 0,
          updatedAt: new Date(updatedAtMs).toISOString(),
          speedKmh: 20,
        },
      ],
    };
  }

  it('replaces the matching timetable slot with one live row (no duplicate)', async () => {
    const items = await createArrivalsMock(fleet(before)).getArrivals(
      '174',
      { limit: 50, windowMin: 60 },
      MORNING
    );
    const live = items.filter((a) => a.isRealtime && a.route.shortName === '15');
    expect(live).toHaveLength(1);
    expect(live[0].scheduledTime).not.toBeNull();
    const sameSlot = items.filter(
      (a) => !a.isRealtime && a.route.shortName === '15' && a.scheduledTime === live[0].scheduledTime
    );
    expect(sameSlot).toEqual([]);
  });

  it('ignores a vehicle that already passed the stop', async () => {
    const items = await createArrivalsMock(fleet(after)).getArrivals(
      '174',
      { limit: 50, windowMin: 60 },
      MORNING
    );
    expect(items.some((a) => a.isRealtime)).toBe(false);
    expect(items.length).toBeGreaterThan(0);
  });

  it('ignores stale positions (parked or lost vehicle)', async () => {
    const stale = fleet(before, MORNING - 10 * 60_000);
    const items = await createArrivalsMock(stale).getArrivals('174', { limit: 50, windowMin: 60 }, MORNING);
    expect(items.some((a) => a.isRealtime)).toBe(false);
  });
});

describe('stop board keeps rare lines (Complexul Studențesc Ion Vidu)', () => {
  it('shows the hourly E3 even when 10 frequent departures come first', async () => {
    // 21:50 Timișoara: 11 departures of M3/15/E2/16 come before E3 at 22:43.
    const at = new Date('2026-10-14T18:50:00Z').getTime();
    const items = await createArrivalsMock().getArrivals('166', { limit: 10, windowMin: 60 }, at);
    expect(items.some((a) => a.route.shortName === 'E3')).toBe(true);
  });
});

describe('vehicle heading on the map', () => {
  it('points along the GTFS shape and is null off-route', () => {
    const shapes = rawShapes as { ids: string[]; coords: number[][][] };
    const pts = shapes.coords[shapes.ids.indexOf('15.1_T')];
    const [a, b] = [pts[10], pts[11]];
    const mid = { lat: (a[0] + b[0]) / 2, lng: (a[1] + b[1]) / 2 };
    const bearing = bearingOnRoute('15', 'T. Grozăvescu (Poșta Mare)', mid);
    const dx = (b[1] - a[1]) * Math.cos((a[0] * Math.PI) / 180);
    const expected = ((Math.atan2(dx, b[0] - a[0]) * 180) / Math.PI + 360) % 360;
    expect(bearing).not.toBeNull();
    expect(Math.abs((bearing as number) - expected)).toBeLessThan(2);
    expect(bearingOnRoute('15', 'T. Grozăvescu (Poșta Mare)', { lat: 45.9, lng: 21.5 })).toBeNull();
  });
});

function row(tripId: string, minutesLeft: number): StopArrivalItem {
  const arrival = {
    tripId,
    route: { id: '5', shortName: '5' },
    headsign: 'Centru',
    scheduledTime: null,
    predictedTime: new Date(Date.now() + minutesLeft * 60_000).toISOString(),
    isRealtime: true,
  };
  return { arrival, minutesLeft, isNow: false };
}

describe('board details like Google Maps', () => {
  it('a late realtime arrival shows its minutes in red, an on-time one in green', () => {
    const late = row('t1', 7);
    late.arrival.delayMin = 4;
    const lateColor = render(<DepartureRow item={late} onPress={jest.fn()} />).getByText('7').props.style;
    const onTimeColor = render(<DepartureRow item={row('t2', 7)} onPress={jest.fn()} />).getByText('7').props.style;
    expect(JSON.stringify(lateColor)).not.toEqual(JSON.stringify(onTimeColor));
  });

  it('alert age uses whole words, never a cryptic "11z"', () => {
    const now = new Date('2026-10-14T12:00:00Z').getTime();
    expect(ageLabel('2026-10-14T11:48:00Z', now)).toBe('acum 12 min');
    expect(ageLabel('2026-10-14T09:00:00Z', now)).toBe('acum 3 h');
    expect(ageLabel('2026-10-03T12:00:00Z', now)).toBe('acum 11 zile');
  });
});
