import { fireEvent, render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ProfileRoute from '../../app/profile';
import { useThemeStore } from '../../src/core/theme/themeStore';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));
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

describe('profile screen', () => {
  it('shows the pass holder and preference groups', async () => {
    const screen = renderWithClient(<ProfileRoute />);
    expect(await screen.findByText('Ion Popescu')).toBeTruthy();
    expect(await screen.findByText('Mod întunecat')).toBeTruthy();
    expect(await screen.findByText('Deconectare')).toBeTruthy();
  });

  it('dark mode toggle switches the theme preference', async () => {
    const screen = renderWithClient(<ProfileRoute />);
    const switches = await screen.findAllByRole('switch');
    expect(useThemeStore.getState().preference).toBe('system');
    fireEvent.press(switches[switches.length - 1]);
    expect(useThemeStore.getState().preference).toBe('dark');
    useThemeStore.getState().setPreference('system');
  });
});
