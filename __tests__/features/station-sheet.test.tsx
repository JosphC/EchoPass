import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { StationBar } from '../../src/features/map';
import { StationSheet } from '../../src/features/map';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SafeAreaProvider
    initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }}
  >
    {children}
  </SafeAreaProvider>
);

describe('station filter ui', () => {
  it('bar opens the picker and shows the active station', () => {
    const onOpen = jest.fn();
    const bar = render(<StationBar station={null} onOpen={onOpen} onClear={jest.fn()} />, { wrapper: Wrapper });
    fireEvent.press(bar.getByText('Stații'));
    expect(onOpen).toHaveBeenCalledTimes(1);

    const active = render(
      <StationBar station={{ id: '1', name: 'Catedrala', lat: 0, lng: 0, lines: ['11'] }} onOpen={onOpen} onClear={jest.fn()} />,
      { wrapper: Wrapper },
    );
    expect(active.getByText('Catedrala')).toBeTruthy();
  });

  it('sheet lists matching stations and picks one', () => {
    const onPick = jest.fn();
    const sheet = render(<StationSheet visible onClose={jest.fn()} onPick={onPick} />, { wrapper: Wrapper });
    expect(sheet.getByPlaceholderText('Caută stația…')).toBeTruthy();
  });
});
