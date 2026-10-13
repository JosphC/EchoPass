import { NoPaymentSourceError, selectPaymentSource } from '../../../src/features/wallet/paymentSource';
import type { WalletItem } from '../../../src/features/wallet/types';

const NOW = new Date('2026-10-04T09:00:00Z').getTime();

const card: WalletItem = { kind: 'card', id: 'card-1', network: 'visa', last4: '4021', holder: 'Ion', expiry: '11/28', token: 'tok' };
const validPass: WalletItem = { kind: 'pass', id: 'pass-1', name: 'Lunar', holder: 'Ion', validFrom: '2026-10-01', validUntil: '2026-11-02', lines: 'all', theme: 'ocean' };
const linePass: WalletItem = { kind: 'pass', id: 'pass-2', name: 'Linia 5', holder: 'Ion', validFrom: '2026-10-01', validUntil: '2026-11-02', lines: ['5'], theme: 'ocean' };
const expiredPass: WalletItem = { kind: 'pass', id: 'pass-3', name: 'Vechi', holder: 'Ion', validFrom: '2026-08-01', validUntil: '2026-09-01', lines: 'all', theme: 'ocean' };

describe('selectPaymentSource', () => {
  it('charges 0 on a valid pass covering the line', () => {
    expect(selectPaymentSource([card, validPass], 'card-1', '5', NOW)).toEqual({ paidWith: 'pass-1', amountCovered: true });
  });

  it('honours line-scoped passes only on their lines', () => {
    expect(selectPaymentSource([card, linePass], 'card-1', '5', NOW).paidWith).toBe('pass-2');
    expect(selectPaymentSource([card, linePass], 'card-1', '12', NOW).paidWith).toBe('card-1');
  });

  it('falls back to the card when the pass expired', () => {
    expect(selectPaymentSource([card, expiredPass], 'card-1', '5', NOW)).toEqual({ paidWith: 'card-1', amountCovered: false });
  });

  it('throws a controlled error with no card and no valid pass', () => {
    expect(() => selectPaymentSource([expiredPass], null, '5', NOW)).toThrow(NoPaymentSourceError);
    expect(() => selectPaymentSource([], null, '5', NOW)).toThrow(NoPaymentSourceError);
  });
});
