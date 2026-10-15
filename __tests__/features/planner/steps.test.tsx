import { fireEvent, render } from '@testing-library/react-native';
import { loadStations, type Station } from '../../../src/features/map';
import { legTimes, StepsList } from '../../../src/features/planner/components/StepsList';
import { planTransit, type TransitLeg } from '../../../src/features/planner/transit';
import { pinEndpoints } from '../../../src/features/planner/routeGeometry';
import { groupSameStops } from '../../../src/features/home/components/planner/RouteOptions';
import { getTripShapeSlice } from '../../../src/services/repositories/gtfs/shapes';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

/** Sunday midday, when all city lines run (deterministic schedule assertions). */
const NOON_SUNDAY = new Date(2026, 9, 11, 12, 0, 0).getTime();

function station(id: string): Station {
  return loadStations().find((s) => s.id === id) as Station;
}

describe('itinerary steps like Google Maps', () => {
  // GTFS: E2 Sala C. Jude (175) -> Consiliul Europei (300), 14 min "spre Holdelor".
  const options = planTransit({ station: station('175'), coords: null }, station('300'), [], NOON_SUNDAY);
  const ride = options.find((o) => o.line === 'E2')?.legs.find((l) => l.kind === 'ride') as TransitLeg;

  it('ride legs carry their boarding time and the stops passed on the way', () => {
    expect(ride.departMs).toBeGreaterThanOrEqual(NOON_SUNDAY);
    expect(ride.via?.length).toBeGreaterThan(0);
    expect(ride.via?.some((s) => s.id === '175' || s.id === '300')).toBe(false);
  });

  it('times: walks start right away, rides at their scheduled departure', () => {
    const walk: TransitLeg = { kind: 'walk', line: null, minutes: 4, fromName: 'Acasă', toName: 'Stația' };
    const bus: TransitLeg = {
      ...walk,
      kind: 'ride',
      line: '17',
      minutes: 10,
      departMs: NOON_SUNDAY + 9 * 60_000,
    };
    expect(legTimes([walk, bus], NOON_SUNDAY)).toEqual([
      { from: NOON_SUNDAY, to: NOON_SUNDAY + 4 * 60_000 },
      { from: NOON_SUNDAY + 9 * 60_000, to: NOON_SUNDAY + 19 * 60_000 },
    ]);
  });

  it('shows board/alight stops and unfolds the intermediate ones', () => {
    const screen = render(<StepsList legs={[ride]} startMs={NOON_SUNDAY} />);
    expect(screen.getByText(ride.fromName)).toBeTruthy();
    expect(screen.getByText(ride.toName)).toBeTruthy();
    expect(screen.getByText(/spre Holdelor/)).toBeTruthy();
    const firstVia = (ride.via as Station[])[0].name;
    expect(screen.queryByText(firstVia)).toBeNull();
    fireEvent.press(screen.getByLabelText('Arată stațiile intermediare'));
    expect(screen.getByText(firstVia)).toBeTruthy();
  });
});

describe('route drawn on the map', () => {
  it('cuts the GTFS slice at the boarding stop instead of spiking back (Mărăști)', () => {
    // Real slice of line 14 for Mărăști (135) → Iulius Mall (152): it starts ~150 m before the stop.
    const board = station('135');
    const alight = station('152');
    const slice = getTripShapeSlice(8100, [board, alight]) as { lat: number; lng: number }[];
    const path = pinEndpoints(slice, [board, alight]);
    expect(path[0]).toEqual(board);
    expect(path[path.length - 1]).toEqual(alight);
    // No vertex of the drawn line lies behind the boarding stop (south-west of it).
    expect(path.some((p) => p.lat < board.lat - 0.0003)).toBe(false);
  });

  it('merges options that differ only by line (Google: 14 / 18 / M14)', () => {
    const [base] = planTransit({ station: station('135'), coords: null }, station('152'), [], NOON_SUNDAY);
    const twin = { ...base, id: 'twin', line: 'M14', totalMin: base.totalMin + 4 };
    const groups = groupSameStops([base, twin]);
    expect(groups).toHaveLength(1);
    expect(groups[0].option.id).toBe(base.id);
    expect(groups[0].altLines).toEqual(['M14']);
  });

  it('never transfers at the destination and walks back (Mărăști → Iulius Mall)', () => {
    const options = planTransit({ station: station('135'), coords: null }, station('152'), [], NOON_SUNDAY);
    expect(options.some((o) => o.transferStation?.id === '152')).toBe(false);
    expect(options.length).toBeGreaterThan(0);
  });
});
