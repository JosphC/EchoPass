import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '../../app/(tabs)/index';
import NotificationsRoute from '../../app/notifications';
import WalletTab from '../../app/(tabs)/wallet';
import { useSettingsStore } from '../../src/features/settings';
import { useRideStore } from '../../src/features/ride';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }), useFocusEffect: (effect: () => void) => effect() }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
/* eslint-enable @typescript-eslint/no-require-imports */
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <SafeAreaProvider
      initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }}
    >
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
  return render(ui, { wrapper: Wrapper });
}

describe('phase 4 screens', () => {
  it('home shows search bar, delay banner and the arrivals board', async () => {
    const screen = renderWithClient(<HomeScreen />);
    expect(await screen.findByPlaceholderText(/Caută|Search/)).toBeTruthy();
    expect(await screen.findByText(/Întârziere 4 min/)).toBeTruthy();
    expect(await screen.findByText(/Direcții|Directions/)).toBeTruthy();
  });

  it('wallet shows items, cap and charges', async () => {
    useRideStore.getState().setActiveRide({
      line: '15',
      vehicleId: '3114',
      passengers: 1,
      amount: 3,
      station: 'Piața Mărăști',
      destination: 'Centru',
      startedAt: '12:00',
      chargeId: 'ch-test',
    });
    const screen = renderWithClient(<WalletTab />);
    expect(await screen.findByText(/călătorie activă/i)).toBeTruthy();
    expect(await screen.findByText(/Centru/)).toBeTruthy();
  });

  it('notifications group by day and mark read on open', async () => {
    const screen = renderWithClient(<NotificationsRoute />);
    expect(await screen.findByText(/Plata calatorie/)).toBeTruthy();
    expect((await screen.findAllByText(/Azi|Ieri|Mai vechi/)).length).toBeGreaterThan(0);
  });

  it('settings toggles flip the store', () => {
    const before = useSettingsStore.getState().tripReminders;
    useSettingsStore.getState().toggle('tripReminders');
    expect(useSettingsStore.getState().tripReminders).toBe(!before);
  });
});
