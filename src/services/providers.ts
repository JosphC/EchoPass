import { env } from '../core/config';

export type DataSource = 'mock' | 'real';

export function getDataSource(): DataSource {
  return env.useMocks ? 'mock' : 'real';
}
