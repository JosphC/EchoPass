import { fireEvent, render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ReportFab } from '../../../src/features/reports';
import { getRepositories } from '../../../src/services/providers';

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

describe('waze-style reporting', () => {
  it('opens the 6-cause sheet and submits for the bus line', async () => {
    const screen = renderWithClient(<ReportFab line="16" />);
    fireEvent.press(screen.getByLabelText('Raportează'));
    expect(await screen.findByText('Trafic')).toBeTruthy();
    fireEvent.press(screen.getByText('Trafic'));
    expect(await screen.findByText('Raport trimis. Mulțumim!')).toBeTruthy();
    const reports = await getRepositories().report.getReports();
    expect(reports.some((r) => r.line === '16' && r.kind === 'traffic')).toBe(true);
  });

  it('asks for a bus first when none is selected', async () => {
    const screen = renderWithClient(<ReportFab line={null} />);
    fireEvent.press(screen.getByLabelText('Raportează'));
    expect(await screen.findByText('Selectează mai întâi un autobuz de pe hartă')).toBeTruthy();
  });
});
