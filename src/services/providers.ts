import { env } from '../core/config';
import { createMockRepositories } from './repositories/mock';
import { createArrivalsMock } from './repositories/mock/arrivalsMock';
import { createStptBusRepo } from './repositories/real/busRepo';
import { createRealRepositories } from './repositories/real/stubs';
import type { Repositories } from './repositories/types';

export type DataSource = 'mock' | 'real';

export function getDataSource(): DataSource {
  return env.useMocks ? 'mock' : 'real';
}

let cached: Repositories | null = null;

/**
 * Single mock/real switch, memoized so every feature shares the same
 * stateful repositories (mock writes are visible app-wide).
 * The bus repo can independently go live on STPT Timisoara positions
 * (EXPO_PUBLIC_USE_REAL_BUS) with mock fallback.
 */
export function getRepositories(): Repositories {
  if (!cached) {
    if (getDataSource() === 'real') {
      cached = createRealRepositories();
    } else {
      cached = createMockRepositories();
      if (env.useRealBus) {
        cached.bus = createStptBusRepo();
        // Stop boards follow the same live fleet the map shows.
        cached.arrivals = createArrivalsMock(cached.bus);
      }
    }
  }
  return cached;
}

/** Test-only: drop memoized instances for isolation between suites. */
export function resetRepositories(): void {
  cached = null;
}
