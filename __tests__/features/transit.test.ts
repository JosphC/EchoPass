import { loadStations } from '../../src/features/map';
import type { BusMarker } from '../../src/features/map';
import { transferFareRon } from '../../src/features/planner/transitHelpers';
import { planTransit } from '../../src/features/planner/transit';

function marker(line: string, lat: number, lng: number): BusMarker {
  return {
    bus: { id: `${line}-t`, line, destination: 'X', crowd: 1, delayMin: 0, delayReason: null },
    position: { busId: `${line}-t`, lat, lng, nextStop: 'S', arrivesInMin: 0, updatedAt: '2026-10-04T09:00:00Z' },
  };
}

/** Sunday midday, when all city lines run (deterministic schedule assertions). */
const NOON_SUNDAY = new Date(2026, 9, 11, 12, 0, 0).getTime();

describe('planTransit', () => {
  it('builds a direct ride when a line serves both stops in order', () => {
    // GTFS: line 14 runs Gheorghe Barițiu (123) -> Consiliul Europei (152).
    const stations = loadStations();
    const board = stations.find((s) => s.id === '123') as NonNullable<ReturnType<typeof stations.find>>;
    const dest = stations.find((s) => s.id === '152') as NonNullable<ReturnType<typeof stations.find>>;
    const options = planTransit({ station: board, coords: null }, dest, [marker('14', board.lat, board.lng)]);
    const direct = options.find((o) => o.line === '14' && o.legs.length === 1);
    expect(direct).toBeTruthy();
    expect(direct?.legs[0].kind).toBe('ride');
    expect(direct?.totalMin).toBeGreaterThan(0);
  });

  it('rejects boarding the wrong way', () => {
    // GTFS: 527 trips of line 14 serve both stops, 0 go 152 -> 123.
    const stations = loadStations();
    const board = stations.find((s) => s.id === '152') as NonNullable<ReturnType<typeof stations.find>>;
    const dest = stations.find((s) => s.id === '123') as NonNullable<ReturnType<typeof stations.find>>;
    const options = planTransit({ station: board, coords: null }, dest, [marker('14', board.lat, board.lng)]);
    expect(options.some((o) => o.line === '14' && o.legs.length === 1)).toBe(false);
  });

  it('uses real scheduled times and headsign (E2 Sala C. Jude -> Consiliul Europei)', () => {
    // GTFS: E2 "spre Holdelor" takes 14 scheduled minutes (not the 7 min haversine estimate).
    const stations = loadStations();
    const board = stations.find((s) => s.id === '175') as NonNullable<ReturnType<typeof stations.find>>;
    const dest = stations.find((s) => s.id === '300') as NonNullable<ReturnType<typeof stations.find>>;
    const options = planTransit({ station: board, coords: null }, dest, [], NOON_SUNDAY);
    const direct = options.find((o) => o.line === 'E2');
    expect(direct).toBeTruthy();
    const ride = direct?.legs.find((l) => l.kind === 'ride');
    expect(ride?.minutes).toBe(14);
    expect(ride?.headsign).toBe('Holdelor');
    expect(direct?.estimated).toBe(false);
  });

  it('keeps real ride time and exact geometry off-hours (no upcoming bus)', () => {
    // 01:30 at night: no E2 runs within 2h, but the line pattern still gives
    // the real 14 min ride, headsign and shape (only the wait is estimated).
    const night = new Date(2026, 9, 11, 1, 30, 0).getTime();
    const stations = loadStations();
    const board = stations.find((s) => s.id === '175') as NonNullable<ReturnType<typeof stations.find>>;
    const dest = stations.find((s) => s.id === '300') as NonNullable<ReturnType<typeof stations.find>>;
    const options = planTransit({ station: board, coords: null }, dest, [], night);
    const direct = options.find((o) => o.line === 'E2');
    expect(direct).toBeTruthy();
    const ride = direct?.legs.find((l) => l.kind === 'ride');
    expect(ride?.minutes).toBe(14);
    expect(ride?.headsign).toBe('Holdelor');
    expect(direct?.shapeLegs).toHaveLength(1);
    expect(direct?.estimated).toBe(true);
    // 8 min fallback wait + 14 min real ride, no walks station-to-station.
    expect(direct?.totalMin).toBe(22);
  });

  it('adds one transfer when nothing goes straight', () => {
    // Complexul Studențesc (176) -> Ion Ionescu de la Brad (163): E2 -> Divizia 9 -> M14.
    const stations = loadStations();
    const board = stations.find((s) => s.id === '176') as NonNullable<ReturnType<typeof stations.find>>;
    const dest = stations.find((s) => s.id === '163') as NonNullable<ReturnType<typeof stations.find>>;
    const options = planTransit({ station: board, coords: null }, dest, []);
    expect(options.length).toBeGreaterThan(0);
    const withTransfer = options.find((o) => o.legs.filter((l) => l.kind === 'ride').length === 2);
    expect(withTransfer).toBeTruthy();
    expect(withTransfer?.transferStation).toBeTruthy();
    expect(withTransfer?.legs.filter((l) => l.kind === 'ride')[0].fromStation).toBeTruthy();
    expect(withTransfer?.fareRon).toBe(3);
  });

  it('charges one ticket when the transfer fits in the 60 min validity', () => {
    const first = new Date(2026, 9, 11, 12, 0, 0).getTime();
    expect(transferFareRon(first, first + 32 * 60_000)).toBe(3);
    expect(transferFareRon(first, first + 60 * 60_000)).toBe(3);
  });

  it('charges a second ticket when the transfer exceeds 60 min', () => {
    const first = new Date(2026, 9, 11, 12, 0, 0).getTime();
    expect(transferFareRon(first, first + 61 * 60_000)).toBe(6);
  });

  it('starts with a walk from GPS coords', () => {
    const stations = loadStations();
    const dest = stations.find((s) => s.id === '300') as NonNullable<ReturnType<typeof stations.find>>;
    const options = planTransit({ station: null, coords: { lat: 45.7492, lng: 21.2416 } }, dest, []);
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].legs[0].kind).toBe('walk');
    expect(options[0].legs[0].minutes).toBeGreaterThan(0);
  });

  it('returns empty without an origin', () => {
    const stations = loadStations();
    const dest = stations[0];
    expect(planTransit({ station: null, coords: null }, dest, [])).toEqual([]);
  });
});
