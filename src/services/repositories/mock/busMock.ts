import { seedBuses, seedPositions } from './seed';
import type { BusRepo } from '../types';

export function createBusMock(): BusRepo {
  return {
    getBuses: async () => seedBuses,
    // Mock vehicles are always live: stamp them now so freshness checks pass.
    getPositions: async () => seedPositions.map((p) => ({ ...p, updatedAt: new Date().toISOString() })),
  };
}
