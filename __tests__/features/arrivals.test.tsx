import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { loadStations } from '../../src/features/map';
import type { Arrival } from '../../src/services/api/schemas/arrival';
import { arrivalSchema } from '../../src/services/api/schemas/arrival';
import { createArrivalsMock } from '../../src/services/repositories/mock/arrivalsMock';
import type { Repositories } from '../../src/services/repositories/types';
import { ARRIVALS_RECALC_MS, useStopArrivals } from '../../src/features/home/hooks/useStopArrivals';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-router', () => ({ useFocusEffect: (effect: () => void) => effect() }));

const NOW = new Date('2026-10-04T09:00:00Z').getTime();
const T0 = Date.now();
const at = (sec: number) => new Date(T0 + sec * 1000).toISOString();

function arrival(tripId: string, line: string, predictedSec: number | null, scheduledSec: number | null): Arrival {
  return {
    tripId,
    route: { id: line, shortName: line },
    headsign: 'Centru',
    scheduledTime: scheduledSec === null ? null : at(scheduledSec),
    predictedTime: predictedSec === null ? null : at(predictedSec),
    isRealtime: predictedSec !== null,
  };
}

describe('arrivals repository', () => {
  it('emits one realtime arrival per live bus serving the stop, sorted', async () => {
    const repo = createArrivalsMock();
    const items = await repo.getArrivals('152', { limit: 50, windowMin: 60 }, NOW);
    const live = items.filter((a) => a.isRealtime);
    expect(live.map((a) => a.route.shortName).sort()).toEqual(['14', '17']);
    const times = live.map((a) => a.predictedTime as string);
    expect(times).toEqual([...times].sort());
    for (const a of live) {
      expect(a.delayMin).toBeDefined();
      if (a.scheduledTime !== null) {
        expect(new Date(a.scheduledTime).getTime()).not.toBeNaN();
      }
    }
    expect(new Set(items.map((a) => a.tripId)).size).toBe(items.length);
  });

  it('adds scheduled rows for lines without live buses, never marked live', async () => {
    const repo = createArrivalsMock();
    const items = await repo.getArrivals('152', { limit: 50, windowMin: 120 }, NOW);
    const scheduled = items.filter((a) => !a.isRealtime);
    expect(scheduled.length).toBeGreaterThan(0);
    for (const a of scheduled) {
      expect(a.scheduledTime).not.toBeNull();
      expect(a.predictedTime).toBeNull();
      expect(new Date(a.scheduledTime as string).getTime()).toBeGreaterThanOrEqual(NOW);
    }
  });

  it('returns empty for unknown stops; the limit never hides a line (one row per line+direction)', async () => {
    const repo = createArrivalsMock();
    expect(await repo.getArrivals('nope', { limit: 10, windowMin: 60 }, NOW)).toEqual([]);
    const one = await repo.getArrivals('152', { limit: 1, windowMin: 60 }, NOW);
    const groups = new Set(one.map((a) => `${a.route.shortName}|${a.headsign}`));
    expect(groups.size).toBe(one.length);
  });

  it('rejects realtime rows without a predicted time', () => {
    expect(() =>
      arrivalSchema.parse({
        tripId: 'x',
        route: { id: '17', shortName: '17' },
        headsign: 'Centru',
        scheduledTime: null,
        predictedTime: null,
        isRealtime: true,
      }),
    ).toThrow();
  });

  it('loads real stops', () => {
    expect(loadStations().find((s) => s.id === '152')?.lines).toContain('17');
  });
});

const hookData: Arrival[] = [
  arrival('a-now', '17', 30, null),
  arrival('b-later', '11', 210, null),
  arrival('c-tolerance', '14', -20, null),
  arrival('d-gone', '18', -31, null),
  arrival('e-far', '11', 600, null),
  arrival('f-schedule', '32', null, 120),
  arrival('g-tick', '19', 61, null),
];

const mockGetArrivals = jest.fn(async (_stopId: string) => hookData);
const mockRepos = { arrivals: { getArrivals: mockGetArrivals } } as unknown as Repositories;
jest.mock('../../src/services/providers', () => ({ getRepositories: () => mockRepos }));

function renderStopHook(stopId: string | null) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook((props: { stopId: string | null }) => useStopArrivals(props.stopId), {
    wrapper,
    initialProps: { stopId },
  });
}

describe('useStopArrivals', () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockGetArrivals.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('floors minutes, flags now, drops departed past tolerance, sorts', async () => {
    const { result } = renderStopHook('152');
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetArrivals).toHaveBeenCalledWith('152', { limit: 10, windowMin: 60 });
    const ids = result.current.items.map((i) => i.arrival.tripId);
    expect(ids).toEqual(['a-now', 'c-tolerance', 'f-schedule', 'g-tick', 'b-later', 'e-far']);
    expect(result.current.items[0]).toMatchObject({ minutesLeft: 0, isNow: true });
    expect(result.current.items.find((i) => i.arrival.tripId === 'b-later')).toMatchObject({ minutesLeft: 3 });
    const scheduled = result.current.items.find((i) => i.arrival.tripId === 'f-schedule');
    expect(scheduled?.arrival.isRealtime).toBe(false);
  });

  it('keeps the multi-line filter across refreshes', async () => {
    const { result, rerender } = renderStopHook('152');
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      result.current.toggleLine('17');
      result.current.toggleLine('11');
    });
    expect(result.current.items.map((i) => i.arrival.tripId).sort()).toEqual(['a-now', 'b-later', 'e-far']);
    rerender({ stopId: '152' });
    expect(result.current.items.map((i) => i.arrival.tripId).sort()).toEqual(['a-now', 'b-later', 'e-far']);
    await act(async () => {
      result.current.toggleLine('17');
    });
    expect(result.current.items.every((i) => i.arrival.route.shortName === '11')).toBe(true);
  });

  it('resets the filter when the stop changes', async () => {
    const { result, rerender } = renderStopHook('152');
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      result.current.toggleLine('17');
    });
    expect(result.current.lineFilter).toEqual(['17']);
    rerender({ stopId: '123' });
    expect(result.current.lineFilter).toEqual([]);
    expect(mockGetArrivals).toHaveBeenLastCalledWith('123', { limit: 10, windowMin: 60 });
  });

  it('recalculates every 15 s without refetching', async () => {
    jest.useFakeTimers();
    const { result } = renderStopHook('152');
    await act(async () => {
      for (let i = 0; i < 20 && result.current.items.length === 0; i++) {
        await jest.advanceTimersByTimeAsync(0);
      }
    });
    const before = result.current.items.find((i) => i.arrival.tripId === 'g-tick')?.minutesLeft ?? -1;
    expect(before).toBe(1);
    const calls = mockGetArrivals.mock.calls.length;
    await act(async () => {
      jest.advanceTimersByTime(ARRIVALS_RECALC_MS);
    });
    const after = result.current.items.find((i) => i.arrival.tripId === 'g-tick')?.minutesLeft ?? -1;
    expect(after).toBe(0);
    expect(mockGetArrivals.mock.calls.length).toBe(calls);
  });
});
