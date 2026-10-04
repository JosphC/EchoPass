import { seedRecentTrips, seedSavedRoutes } from './seed';
import type { TripRepo } from '../types';

export function createTripMock(): TripRepo {
  return {
    getSavedRoutes: async () => seedSavedRoutes,
    getRecentTrips: async () => seedRecentTrips,
  };
}
