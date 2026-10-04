import type { Repositories } from '../types';

function todo(repo: string): never {
  throw new Error(`${repo} real repository not implemented (Phase 10 backend).`);
}

/** Placeholders wired in Phase 10; screens never import these directly. */
export function createRealRepositories(): Repositories {
  return {
    wallet: {
      getPass: async () => todo('Wallet'),
      getPaymentMethod: async () => todo('Wallet'),
      getDailyCap: async () => todo('Wallet'),
      getCharges: async () => todo('Wallet'),
    },
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
  };
}
