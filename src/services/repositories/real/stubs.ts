import type { Repositories } from '../types';
import { createWalletRepoReal } from './walletRepo.real';

function todo(repo: string): never {
  throw new Error(`${repo} real repository not implemented (Phase 10 backend).`);
}

/** Placeholders wired in Phase 10; screens never import these directly. */
export function createRealRepositories(): Repositories {
  return {
    wallet: createWalletRepoReal(),
    bus: {
      getBuses: async () => todo('Bus'),
      getPositions: async () => todo('Bus'),
    },
    report: {
      getReports: async () => todo('Report'),
      submitReport: async () => todo('Report'),
      confirmReport: async () => todo('Report'),
    },
    trip: {
      getSavedRoutes: async () => todo('Trip'),
      getRecentTrips: async () => todo('Trip'),
    },
    notification: {
      getNotifications: async () => todo('Notification'),
      markRead: async () => todo('Notification'),
    },
    arrivals: {
      getArrivals: async () => todo('Arrivals'),
    },
  };
}
