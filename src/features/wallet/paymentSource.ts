import type { WalletItem } from './types';

export interface ChargeDecision {
  paidWith: string;
  amountCovered: boolean;
}

export class NoPaymentSourceError extends Error {
  constructor() {
    super('No payment source available');
    this.name = 'NoPaymentSourceError';
  }
}

function passCoversLine(item: WalletItem, line: string, nowMs: number): boolean {
  if (item.kind !== 'pass') return false;
  if (new Date(item.validUntil).getTime() < nowMs) return false;
  return item.lines === 'all' || item.lines.includes(line);
}

/**
 * Pure source selection: a valid pass covering the line wins (fare 0),
 * otherwise the default card is charged. Throws when nothing can pay.
 */
export function selectPaymentSource(items: WalletItem[], defaultSourceId: string | null, line: string, nowMs: number): ChargeDecision {
  const pass = items.find((item) => passCoversLine(item, line, nowMs));
  if (pass) return { paidWith: pass.id, amountCovered: true };

  const fallback = items.find((item) => item.id === defaultSourceId && item.kind === 'card')
    ?? items.find((item) => item.kind === 'card');
  if (!fallback) throw new NoPaymentSourceError();
  return { paidWith: fallback.id, amountCovered: false };
}
