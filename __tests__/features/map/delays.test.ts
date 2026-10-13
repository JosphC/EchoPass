import type { BusMarker } from '../../../src/features/map';
import type { Report } from '../../../src/services/api/schemas/report';
import { detectDelays } from '../../../src/features/map/delays';

function marker(line: string, updatedAt: string): BusMarker {
  return {
    bus: { id: `${line}-1`, line, destination: 'X', crowd: 1, delayMin: 0, delayReason: null },
    position: { busId: `${line}-1`, lat: 45.75, lng: 21.22, nextStop: 'S', arrivesInMin: 0, updatedAt },
  };
}

function report(partial: Partial<Report> & { id: string; line: string }): Report {
  return {
    kind: 'traffic',
    stopName: 'S',
    confirmations: 1,
    expiresAt: '2026-10-04T10:20:00Z',
    ...partial,
  };
}

const NOW = new Date('2026-10-04T09:00:00Z').getTime();
const FRESH = '2026-10-04T08:59:00Z';
const STALE = '2026-10-04T08:00:00Z';

describe('detectDelays', () => {
  it('flags a line with a live traveler report, most confirmed wins', () => {
    const reports = [
      report({ id: 'r1', line: '5', kind: 'works', confirmations: 1 }),
      report({ id: 'r2', line: '5', kind: 'traffic', confirmations: 3 }),
    ];
    const delays = detectDelays([marker('5', FRESH), marker('12', FRESH)], reports, NOW);
    expect(delays).toHaveLength(1);
    expect(delays[0]).toMatchObject({ line: '5', cause: 'traffic', reportId: 'r2', confirmations: 3 });
  });

  it('ignores expired reports and lines without reports', () => {
    const reports = [report({ id: 'r1', line: '5', expiresAt: '2026-10-04T08:00:00Z' })];
    expect(detectDelays([marker('5', FRESH)], reports, NOW)).toEqual([]);
  });

  it('flags stale GPS with unknown cause', () => {
    const delays = detectDelays([marker('5', STALE)], [], NOW);
    expect(delays).toEqual([
      { busId: '5-1', line: '5', destination: 'X', cause: 'unknown', reportId: null, confirmations: 0 },
    ]);
  });

  it('skips markers without position and dedupes per line', () => {
    const noPos: BusMarker = { ...marker('5', FRESH), position: undefined };
    const reports = [report({ id: 'r1', line: '5' })];
    const delays = detectDelays([noPos, marker('5', FRESH), marker('5', FRESH)], reports, NOW);
    expect(delays).toHaveLength(1);
  });
});
