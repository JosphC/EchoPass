import { env } from '../core/config';
import { createMockRepositories } from './repositories/mock';
import { createStptBusRepo } from './repositories/real/busRepo';
import { createRealRepositories } from './repositories/real/stubs';
import type { Repositories } from './repositories/types';

export type DataSource = 'mock' | 'real';

export function getDataSource(): DataSource {
  return env.useMocks ? 'mock' : 'real';
}

/**
 * Single mock/real switch. The bus repo can independently go live on STPT
 * Timisoara positions (EXPO_PUBLIC_USE_REAL_BUS) with mock fallback.
 */
export function getRepositories(): Repositories {
  if (getDataSource() === 'real') return createRealRepositories();
  const repos = createMockRepositories();
  if (env.useRealBus) repos.bus = createStptBusRepo();
  return repos;
}
