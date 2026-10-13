import { routeSchema } from '../../src/services/api/schemas/arrival';
import { findRoute, getRouteCatalog, getScheduledDepartures } from '../../src/services/repositories/gtfs/timetable';
import rawRoutes from '../../src/assets/routes.json';
import rawTimetable from '../../src/assets/timetable.json';
import rawStations from '../../src/assets/stations.json';

describe('GTFS import artifacts', () => {
  it('ships a valid route catalog with official colors', () => {
    expect(Array.isArray(rawRoutes)).toBe(true);
    expect(rawRoutes.length).toBeGreaterThan(50);
    for (const r of rawRoutes) {
      const parsed = routeSchema.parse(r);
      expect(parsed.color).toMatch(/^#[0-9A-F]{6}$/);
    }
    expect(findRoute('17')?.color).toMatch(/^#[0-9A-F]{6}$/);
    expect(getRouteCatalog().length).toBe(rawRoutes.length);
  });

  it('covers every app station with sorted departures', () => {
    const deps = (rawTimetable as { deps: Record<string, number[]> }).deps;
    const stations = rawStations as { id: string }[];
    const missing = stations.filter((s) => !deps[s.id]);
    expect(missing).toEqual([]);
    const flat = deps['152'] as number[];
    expect(flat.length).toBeGreaterThan(4);
    let sec = flat[0] as number;
    for (let i = 2; i + 1 < flat.length; i += 2) {
      sec += flat[i] as number;
      expect(flat[i] as number).toBeGreaterThanOrEqual(0);
    }
    expect(sec).toBeGreaterThan(0);
  });
});

describe('scheduled departures', () => {
  // Wednesday morning: weekday services run.
  const morning = new Date(2026, 9, 7, 8, 0, 0).getTime();

  it('lists upcoming departures inside the window, sorted', () => {
    const deps = getScheduledDepartures('152', morning, 60, 10);
    expect(deps.length).toBeGreaterThan(0);
    expect(deps.length).toBeLessThanOrEqual(10);
    const times = deps.map((d) => d.timeMs);
    expect(times).toEqual([...times].sort());
    const end = morning + 60 * 60_000;
    for (const d of deps) {
      expect(d.timeMs).toBeGreaterThanOrEqual(morning);
      expect(d.timeMs).toBeLessThanOrEqual(end);
      expect(d.headsign.length).toBeGreaterThan(0);
    }
  });

  it('returns empty for unknown stops', () => {
    expect(getScheduledDepartures('nope', morning, 60, 10)).toEqual([]);
  });
});
