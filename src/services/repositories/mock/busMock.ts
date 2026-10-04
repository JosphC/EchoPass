import { seedBuses, seedPositions } from './seed';
import type { BusRepo } from '../types';

export function createBusMock(): BusRepo {
  return {
    getBuses: async () => seedBuses,
    getPositions: async () => seedPositions,
  };
}
