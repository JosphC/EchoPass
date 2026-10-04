import { getDataSource, getRepositories } from '../../src/services/providers';
import { createRealRepositories } from '../../src/services/repositories/real/stubs';

describe('repositories (faza 3)', () => {
  it('defaults to the mock data source', () => {
    expect(getDataSource()).toBe('mock');
  });

  it('mock repos return realistic typed data', async () => {
    const repos = getRepositories();
    await expect(repos.wallet.getPass()).resolves.toMatchObject({ holderName: 'Ion Popescu' });
    await expect(repos.wallet.getDailyCap()).resolves.toMatchObject({ limitRon: 8 });
    await expect(repos.bus.getBuses()).resolves.toHaveLength(3);
    await expect(repos.trip.getSavedRoutes()).resolves.toHaveLength(2);
    const notes = await repos.notification.getNotifications();
    expect(notes.length).toBeGreaterThan(0);
    await repos.notification.markRead(notes[0].id);
    await expect(repos.notification.getNotifications()).resolves.toContainEqual({ ...notes[0], read: true });
  });

  it('report mock supports submit + confirm flow', async () => {
    const repos = getRepositories();
    const created = await repos.report.submitReport('traffic', '5');
    expect(created.confirmations).toBe(1);
    const confirmed = await repos.report.confirmReport(created.id);
    expect(confirmed.confirmations).toBe(2);
  });

  it('real stubs throw until the backend lands', async () => {
    const real = createRealRepositories();
    await expect(real.wallet.getPass()).rejects.toThrow('not implemented');
  });
});
