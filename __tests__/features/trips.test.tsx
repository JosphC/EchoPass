import { fireEvent, render } from '@testing-library/react-native';
import { LiveOnboardCard } from '../../src/features/trips/components/onboard/LiveOnboardCard';
import { RecentTrips } from '../../src/features/trips/components/RecentTrips';
import { TripStatementModal } from '../../src/features/trips/components/statement/TripStatementModal';
import { TripRow } from '../../src/features/trips/components/TripRow';
import { TripsMonthHeader } from '../../src/features/trips/components/TripsMonthHeader';
import { TripsStats } from '../../src/features/trips/components/TripsStats';
import { getMonthName, getRecentMonthOptions } from '../../src/features/trips/data/monthOptions';
import type { RecentTrip } from '../../src/services/api/schemas/trip';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const NOW = Date.UTC(2026, 9, 4, 12, 0, 0);

const trips: RecentTrip[] = [
  { id: 't1', from: 'Acasa', to: 'Birou', date: '2026-10-04', time: '07:42', line: '5', fareRon: 3, distanceKm: 7.2, durationMin: 18 },
  { id: 't2', from: 'Birou', to: 'Gara', date: '2026-10-03', time: '17:10', line: '12', fareRon: 2, distanceKm: 5.4, durationMin: 25 },
  { id: 't3', from: 'Gara', to: 'Piata', date: '2026-09-30', time: '08:05', line: '32', fareRon: 3, distanceKm: 12.8, durationMin: 45 },
];

describe('trips screen', () => {
  it('groups recent trips by day', () => {
    const screen = render(<RecentTrips trips={trips} onRepeat={jest.fn()} nowMs={NOW} />);
    expect(screen.getByText('Azi')).toBeTruthy();
    expect(screen.getByText('Ieri')).toBeTruthy();
    expect(screen.getByText('30 sep')).toBeTruthy();
  });

  it('stats show this month count and spend vs tickets', () => {
    const screen = render(<TripsStats trips={trips} nowMs={NOW} />);
    expect(screen.getByText('Luna aceasta')).toBeTruthy();
    expect(screen.getByText('Cheltuit')).toBeTruthy();
    expect(screen.getByText('5 lei')).toBeTruthy();
  });

  it('row shows line badge and comma price without manual repeat action', () => {
    const screen = render(<TripRow trip={trips[0]} />);
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('3,00 lei')).toBeTruthy();
    expect(screen.queryByText('Repetă')).toBeNull();
  });

  it('generates max 4 month options with current and up to 3 past months', () => {
    const options = getRecentMonthOptions(new Date('2026-10-10T12:00:00Z'));
    expect(options).toHaveLength(4);
    expect(options[0]?.key).toBe('2026-10');
    expect(options[0]?.label).toContain('Luna aceasta');
    expect(options[1]?.key).toBe('2026-09');
    expect(getMonthName('2026-10')).toContain('Octombrie 2026');
  });

  it('month header displays count, amount, extras button and selection pills', () => {
    const onOpen = jest.fn();
    const onSelect = jest.fn();
    const months = [
      { key: '2026-10', label: 'Luna aceasta (Octombrie)' },
      { key: '2026-09', label: 'Septembrie' },
    ];
    const screen = render(
      <TripsMonthHeader
        months={months}
        selectedMonth="2026-10"
        onSelectMonth={onSelect}
        tripCount={3}
        totalFareRon={9}
        onOpenStatement={onOpen}
      />
    );
    expect(screen.getByText('3 călătorii')).toBeTruthy();
    expect(screen.getByText('9,00 lei decontați · STPT')).toBeTruthy();
    fireEvent.press(screen.getByText('Extras'));
    expect(onOpen).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByText('Septembrie'));
    expect(onSelect).toHaveBeenCalledWith('2026-09');
  });

  it('live onboard card renders vehicle, live badge, next station and stops', () => {
    const ride = {
      line: '15',
      vehicleId: '3114',
      destination: 'Poșta Mare',
      station: 'Piața Mărăști',
      isTransfer: false,
      passengers: 1,
      amount: 3,
      startedAt: '12:00',
      chargeId: 'ch-1',
    };
    const screen = render(<LiveOnboardCard ride={ride} initiallyExpanded={true} />);
    expect(screen.getByText(/la bord/i)).toBeTruthy();
    expect(screen.getByText('15')).toBeTruthy();
    expect(screen.getByText('Poșta Mare')).toBeTruthy();
    expect(screen.getByText(/următoarea:/i)).toBeTruthy();
    expect(screen.getByText('de la Piața Mărăști')).toBeTruthy();
    expect(screen.getAllByText('Scheduled').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Următoarea stație').length).toBeGreaterThan(0);
  });

  it('live onboard card does not render when ride is null', () => {
    const screen = render(<LiveOnboardCard ride={null} />);
    expect(screen.queryByTestId('live-onboard-card')).toBeNull();
  });

  it('statement modal renders month summary and ticket series', () => {
    const onClose = jest.fn();
    const screen = render(
      <TripStatementModal
        visible={true}
        monthName="Octombrie 2026"
        trips={trips.slice(0, 2)}
        onClose={onClose}
      />
    );
    expect(screen.getByText('Extras Călătorii STPT')).toBeTruthy();
    expect(screen.getByText('Octombrie 2026')).toBeTruthy();
    expect(screen.getByText('Descarcă Extras PDF (Decont)')).toBeTruthy();
  });
});

