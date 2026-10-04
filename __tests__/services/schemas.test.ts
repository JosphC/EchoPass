import { busSchema, crowdLevelSchema } from '../../src/services/api/schemas/bus';
import { notificationSchema } from '../../src/services/api/schemas/notification';
import { isConfirmed, reportSchema } from '../../src/services/api/schemas/report';
import { recentTripSchema } from '../../src/services/api/schemas/trip';
import { chargeSchema, dailyCapSchema, passSchema } from '../../src/services/api/schemas/wallet';

describe('zod schemas (faza 3)', () => {
  it('accepts valid bus, wallet and trip payloads', () => {
    expect(crowdLevelSchema.parse(2)).toBe(2);
    expect(busSchema.parse({ id: 'b', line: '5', destination: 'X', crowd: 1, delayMin: 0, delayReason: null }).line).toBe('5');
    expect(passSchema.parse({ id: 'p', holderName: 'Ion', validUntil: '2026-11-02', daysLeft: 30 }).daysLeft).toBe(30);
    expect(chargeSchema.parse({ id: 'c', line: '5', amountRon: 3, chargedAt: '2026-10-03T07:42:00Z', capped: false }).amountRon).toBe(3);
    expect(dailyCapSchema.parse({ limitRon: 8, spentRon: 6 }).limitRon).toBe(8);
    expect(recentTripSchema.parse({ id: 't', from: 'A', to: 'B', date: '2026-10-03', fareRon: 3, distanceKm: 7.2, durationMin: 18 }).fareRon).toBe(3);
    expect(notificationSchema.parse({ id: 'n', kind: 'delay', title: 'T', body: 'B', createdAt: '2026-10-03T07:00:00Z', read: false }).kind).toBe('delay');
  });

  it('rejects invalid payloads at the boundary', () => {
    expect(() => crowdLevelSchema.parse(5)).toThrow();
    expect(() => chargeSchema.parse({ id: 'c', line: '5', amountRon: -1, chargedAt: 'x', capped: false })).toThrow();
    expect(() => reportSchema.parse({ id: 'r', kind: 'ufo', line: '5', stopName: 'S', confirmations: 0, expiresAt: '2026-10-03T09:20:00Z' })).toThrow();
  });

  it('marks reports confirmed at threshold', () => {
    expect(isConfirmed({ confirmations: 2 }, 2)).toBe(true);
    expect(isConfirmed({ confirmations: 1 }, 2)).toBe(false);
  });
});
