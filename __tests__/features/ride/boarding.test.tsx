import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import { BoardingPromptModal } from '../../../src/features/ride/components/BoardingPromptModal';
import { useRideStore } from '../../../src/features/ride/rideStore';
import { useWalletStore } from '../../../src/features/wallet/walletStore';
import type { WalletItem } from '../../../src/features/wallet/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

let client: QueryClient;

function renderModal() {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BoardingPromptModal />
    </QueryClientProvider>,
  );
}

const mockCard: Extract<WalletItem, { kind: 'card' }> = {
  kind: 'card',
  id: 'card-1',
  network: 'visa',
  last4: '4021',
  holder: 'Ion Popescu',
  expiry: '11/28',
  token: 'tok_mock',
  bank: 'Nova Bank',
};

const mockPass: Extract<WalletItem, { kind: 'pass' }> = {
  kind: 'pass',
  id: 'pass-1',
  name: 'Abonament Lunar',
  holder: 'Ion Popescu',
  validFrom: '2026-10-01',
  validUntil: '2026-11-02',
  lines: 'all',
  theme: 'ocean',
};

describe('BLE Boarding & Passenger Selection', () => {
  beforeEach(() => {
    useRideStore.setState({
      status: 'idle',
      detectedVehicle: null,
      passengerCount: 1,
      activeRide: null,
      toastMessage: null,
    });
    useWalletStore.setState({
      items: [mockCard],
      defaultSourceId: 'card-1',
    });
  });

  it('starts with status idle and does not render modal', () => {
    const { queryByTestId } = renderModal();
    expect(queryByTestId('btn-confirm-boarding')).toBeNull();
  });

  it('shows detected vehicle with default 1 passenger and 3,00 lei fare', () => {
    useRideStore.getState().detectVehicle({
      line: '15',
      vehicleId: '3114',
      vehicleType: 'Troleibuz',
      station: 'Piața Mărăști',
      destination: 'T. Grozăvescu (Poșta Mare)',
    });

    const { getByTestId, getByText } = renderModal();

    expect(getByText('Câte persoane plătești?')).toBeTruthy();
    expect(getByText('T. Grozăvescu (Poșta Mare)')).toBeTruthy();
    expect(getByTestId('passenger-count-text').props.children).toBe(1);
    expect(getByTestId('total-fare-text').props.children).toBe('3,00 lei');
  });

  it('increments and decrements passenger count, updating total fare', () => {
    useRideStore.getState().detectVehicle({
      line: '15',
      vehicleId: '3114',
      vehicleType: 'Troleibuz',
      station: 'Piața Mărăști',
      destination: 'T. Grozăvescu (Poșta Mare)',
    });

    const { getByTestId } = renderModal();

    // Increment to 2
    fireEvent.press(getByTestId('btn-increment-passengers'));
    expect(getByTestId('passenger-count-text').props.children).toBe(2);
    expect(getByTestId('total-fare-text').props.children).toBe('6,00 lei');

    // Increment to 3
    fireEvent.press(getByTestId('btn-increment-passengers'));
    expect(getByTestId('passenger-count-text').props.children).toBe(3);
    expect(getByTestId('total-fare-text').props.children).toBe('9,00 lei');

    // Decrement back to 2
    fireEvent.press(getByTestId('btn-decrement-passengers'));
    expect(getByTestId('passenger-count-text').props.children).toBe(2);
    expect(getByTestId('total-fare-text').props.children).toBe('6,00 lei');
  });

  it('calculates group fare with pass covering the 1st passenger', () => {
    useWalletStore.setState({ items: [mockCard, mockPass], defaultSourceId: 'card-1' });
    useRideStore.getState().detectVehicle({
      line: '15',
      vehicleId: '3114',
      vehicleType: 'Troleibuz',
      station: 'Piața Mărăști',
      destination: 'T. Grozăvescu (Poșta Mare)',
    });

    const { getByTestId } = renderModal();

    // 1 passenger: covered by pass = 0,00 lei
    expect(getByTestId('passenger-count-text').props.children).toBe(1);
    expect(getByTestId('total-fare-text').props.children).toBe('0,00 lei');

    // 2 passengers: 1 pass + 1 extra = 3,00 lei
    fireEvent.press(getByTestId('btn-increment-passengers'));
    expect(getByTestId('passenger-count-text').props.children).toBe(2);
    expect(getByTestId('total-fare-text').props.children).toBe('3,00 lei');
  });

  it('dismisses boarding prompt on ignore', () => {
    useRideStore.getState().detectVehicle({
      line: '15',
      vehicleId: '3114',
      vehicleType: 'Troleibuz',
      station: 'Piața Mărăști',
      destination: 'T. Grozăvescu (Poșta Mare)',
    });

    const { getByTestId } = renderModal();
    fireEvent.press(getByTestId('btn-ignore-boarding'));

    expect(useRideStore.getState().status).toBe('idle');
    expect(useRideStore.getState().detectedVehicle).toBeNull();
  });
});
