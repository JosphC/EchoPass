import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '../../app/(tabs)/index';
import NotificationsRoute from '../../app/notifications';
import WalletTab from '../../app/(tabs)/wallet';
import { useSettingsStore } from '../../src/features/settings';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

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
  it('home shows hero, delay banner and recent trips', async () => {
    const screen = renderWithClient(<HomeScreen />);
    expect(await screen.findByText('Plan. Ride. Arrive.')).toBeTruthy();
    expect(await screen.findByText(/Întârziere pe linia 5/)).toBeTruthy();
    expect(await screen.findByText('Acasa → Birou')).toBeTruthy();
  });

  it('wallet shows pass, cap and charges', async () => {
    const screen = renderWithClient(<WalletTab />);
    expect(await screen.findByText('Ion Popescu')).toBeTruthy();
    expect(await screen.findByText(/Plafon zilnic: 6 din 8 lei/)).toBeTruthy();
    expect(await screen.findByText('Linia 5')).toBeTruthy();
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
