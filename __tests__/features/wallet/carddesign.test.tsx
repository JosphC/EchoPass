import React from 'react';
import { render } from '@testing-library/react-native';
import { WalletCard } from '../../../src/features/wallet/components/cards/WalletCard';
import type { WalletItem } from '../../../src/features/wallet/types';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-linear-gradient', () => {
  const mockReact = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    LinearGradient: ({ children, style }: { children?: unknown; style?: unknown }) =>
      mockReact.createElement(View, { style }, children),
  };
});
jest.mock('react-native-svg', () => {
  const mockReact = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const Mock = ({ children }: { children?: unknown }) => mockReact.createElement(View, null, children);
  return { Svg: Mock, Circle: () => null, Path: () => null };
});

const visa: Extract<WalletItem, { kind: 'card' }> = {
  kind: 'card',
  id: 'card-1',
  network: 'visa',
  last4: '4021',
  holder: 'Ion Popescu',
  expiry: '11/28',
  token: 'tok',
  bank: 'Nova Bank',
  tag: 'Principal',
};

const mc: Extract<WalletItem, { kind: 'card' }> = {
  kind: 'card',
  id: 'card-2',
  network: 'mastercard',
  last4: '7718',
  holder: 'Ion Popescu',
  expiry: '03/27',
  token: 'tok',
  bank: 'Meridian',
  tag: 'Economii',
};

describe('WalletCard premium design', () => {
  it('visa arata banca, tag, numar mascat, titular si logo VISA', () => {
    const screen = render(<WalletCard item={visa} isDefault expanded />);
    expect(screen.getByText('Nova Bank')).toBeTruthy();
    expect(screen.getByText('Principal')).toBeTruthy();
    expect(screen.getByText(/4021/)).toBeTruthy();
    expect(screen.getByText('ION POPESCU')).toBeTruthy();
    expect(screen.getByText('11/28')).toBeTruthy();
    expect(screen.getByText('VISA')).toBeTruthy();
    expect(screen.getByText('Titular')).toBeTruthy();
  });

  it('mastercard arata cercurile MC in loc de VISA', () => {
    const screen = render(<WalletCard item={mc} isDefault={false} expanded />);
    expect(screen.getByText('Meridian')).toBeTruthy();
    expect(screen.getByText('Economii')).toBeTruthy();
    expect(screen.getByText(/7718/)).toBeTruthy();
    expect(screen.getByTestId('network-mastercard')).toBeTruthy();
    expect(screen.queryByText('VISA')).toBeNull();
  });

  it('fara banca/tag arata etichete generice si logo VISA o singura data', () => {
    const plain = { ...visa, bank: undefined, tag: undefined };
    const screen = render(<WalletCard item={plain} isDefault expanded />);
    expect(screen.getByText('Folosit pentru plată')).toBeTruthy();
    expect(screen.getByText('Card conectat')).toBeTruthy();
    expect(screen.getByText('VISA')).toBeTruthy();
  });

  it('restrans ascunde titularul si expirarea', () => {
    const screen = render(<WalletCard item={visa} isDefault expanded={false} />);
    expect(screen.getByText(/4021/)).toBeTruthy();
    expect(screen.queryByText('ION POPESCU')).toBeNull();
  });
});
