import { detectNetwork, expiryValid, luhnValid } from '../../../src/features/wallet/validation/cardValidation';

const NOW = new Date('2026-10-04T09:00:00Z').getTime();

describe('cardValidation', () => {
  it('accepts valid PANs and rejects bad ones', () => {
    expect(luhnValid('4111111111111111')).toBe(true);
    expect(luhnValid('5555555555554444')).toBe(true);
    expect(luhnValid('4111111111111112')).toBe(false);
    expect(luhnValid('123')).toBe(false);
  });

  it('validates MM/YY expiries against now', () => {
    expect(expiryValid('11/28', NOW)).toBe(true);
    expect(expiryValid('09/26', NOW)).toBe(false);
    expect(expiryValid('13/28', NOW)).toBe(false);
    expect(expiryValid('nope', NOW)).toBe(false);
  });

  it('detects the network without storing the PAN', () => {
    expect(detectNetwork('4111111111111111')).toBe('visa');
    expect(detectNetwork('5555555555554444')).toBe('mastercard');
    expect(detectNetwork('3530111333300000')).toBe('other');
  });
});
