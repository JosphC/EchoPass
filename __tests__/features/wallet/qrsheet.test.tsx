import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { ChargeHistory } from '../../../src/features/wallet/components/charges/ChargeHistory';
import { ChargeQrSheet } from '../../../src/features/wallet/components/charges/ChargeQrSheet';
import type { Charge, WalletItem } from '../../../src/features/wallet/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('react-native-qrcode-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockQR() {
    return React.createElement(View, { testID: 'qr-code' });
  };
});
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const items: WalletItem[] = [
  { kind: 'card', id: 'card-1', network: 'visa', last4: '4021', holder: 'Ion', expiry: '11/28', token: 'tok' },
];
const charge: Charge = {
  id: 'ch-1',
  line: '5',
  amount: 3,
  currency: 'RON',
  status: 'completed',
  paidWith: 'card-1',
  startedAt: '2026-10-03T07:42:00Z',
  qrToken: 'qr_mock_ch-1',
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SafeAreaProvider
    initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }}
  >
    {children}
  </SafeAreaProvider>
);

describe('charge QR flow', () => {
  it('tapping a history row opens the charge', () => {
    const onOpen = jest.fn();
    const screen = render(<ChargeHistory charges={[charge]} onOpen={onOpen} />, { wrapper: Wrapper });
    fireEvent.press(screen.getByText(/Linia 5/));
    expect(onOpen).toHaveBeenCalledWith('ch-1');
  });

  it('the QR sheet shows line, amount, source and the code', () => {
    const sheet = render(<ChargeQrSheet charge={charge} items={items} onClose={jest.fn()} onDispute={jest.fn()} />, {
      wrapper: Wrapper,
    });
    expect(sheet.getByText(/Linia 5/)).toBeTruthy();
    expect(sheet.getByText(/4021/)).toBeTruthy();
    expect(sheet.getByTestId('qr-code')).toBeTruthy();
  });
});
