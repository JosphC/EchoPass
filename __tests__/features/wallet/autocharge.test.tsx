import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { useAutoCharge } from '../../../src/features/wallet/hooks/useAutoCharge';
import { useSettingsStore } from '../../../src/features/settings';
import { useWalletStore } from '../../../src/features/wallet/walletStore';
import type { WalletItem } from '../../../src/features/wallet/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const card: WalletItem = { kind: 'card', id: 'card-9', network: 'visa', last4: '1111', holder: 'Test', expiry: '11/28', token: 'tok' };
const pass: WalletItem = { kind: 'pass', id: 'pass-9', name: 'Lunar', holder: 'Test', validFrom: '2026-10-01', validUntil: '2026-11-02', lines: 'all', theme: 'ocean' };

let client: QueryClient;

function renderAutoCharge() {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useAutoCharge(), { wrapper: Wrapper as (props: { children: ReactElement }) => ReactElement });
}

describe('useAutoCharge', () => {
  beforeEach(() => {
    useSettingsStore.setState({ askBeforeCharge: false });
  });

  afterEach(() => {
    client?.clear();
  });

  it('creates an in_progress charge on check-in when auto payment is on', async () => {
    useWalletStore.setState({ items: [card], defaultSourceId: 'card-9' });
    const { result, unmount } = renderAutoCharge();
    const started = await result.current.startRideCharge('5', new Date('2026-10-04T09:00:00Z').getTime());
    expect(started?.charge.status).toBe('in_progress');
    expect(started?.charge.paidWith).toBe('card-9');
    expect(started?.coveredByPass).toBe(false);
    unmount();
  });

  it('covers the fare with a valid pass and finalizes as covered_by_pass', async () => {
    useWalletStore.setState({ items: [card, pass], defaultSourceId: 'card-9' });
    const { result, unmount } = renderAutoCharge();
    const started = await result.current.startRideCharge('5', new Date('2026-10-04T09:00:00Z').getTime());
    expect(started?.charge.amount).toBe(0);
    const finished = await result.current.finishRideCharge(started!.charge, 3);
    expect(finished.status).toBe('covered_by_pass');
    unmount();
  });

  it('creates nothing when auto payment is off until the user confirms', async () => {
    useSettingsStore.setState({ askBeforeCharge: true });
    useWalletStore.setState({ items: [card], defaultSourceId: 'card-9' });
    const { result, unmount } = renderAutoCharge();
    await expect(result.current.startRideCharge('5')).resolves.toBeNull();
    const confirmed = await result.current.confirmRideCharge('5');
    expect(confirmed.charge.status).toBe('in_progress');
    const finished = await result.current.finishRideCharge(confirmed.charge, 3);
    expect(finished.status).toBe('completed');
    unmount();
  });
});
