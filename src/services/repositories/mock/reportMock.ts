import type { Report } from '../../api/schemas/report';
import { seedReports } from './seed';
import type { ReportRepo } from '../types';

export function createReportMock(): ReportRepo {
  // Seed expiries are fixed dates: refresh on load so demo alerts stay live.
  const store: Report[] = seedReports.map((r) => ({
    ...r,
    expiresAt: new Date(Date.now() + 20 * 60_000).toISOString(),
  }));
  return {
    getReports: async () => store,
    submitReport: async (kind, line) => {
      const created: Report = {
        id: `rep-${Date.now()}`,
        kind,
        line,
        stopName: 'Statia curenta',
        confirmations: 1,
        expiresAt: new Date(Date.now() + 20 * 60_000).toISOString(),
      };
      store.unshift(created);
      return created;
    },
    confirmReport: async (id) => {
      const found = store.find((r) => r.id === id);
      if (!found) throw new Error(`Report ${id} not found`);
      const updated = { ...found, confirmations: found.confirmations + 1 };
      store.splice(store.indexOf(found), 1, updated);
      return updated;
    },
  };
}
