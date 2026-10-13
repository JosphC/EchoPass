import { DAILY_CAP_RON, SINGLE_FARE_RON } from '../../../core/config';
import type { Charge } from '../types';
import { useWalletStore } from '../walletStore';
import { NoPaymentSourceError, selectPaymentSource } from '../paymentSource';
import { useSettingsStore } from '../../settings';
import { useCharges } from './useCharges';

export interface RideCharge {
  charge: Charge;
  coveredByPass: boolean;
  passengers: number;
}

function computeFare(passengers: number, coveredByPass: boolean): number {
  if (coveredByPass) {
    return Math.max(0, passengers - 1) * SINGLE_FARE_RON;
  }
  return passengers * SINGLE_FARE_RON;
}

/**
 * Wallet side of the ride contract (called by `ride` on CHECKED_IN/CHECK_OUT in Phase 6).
 * Auto payment reads `askBeforeCharge` from the settings store: OFF means charge now.
 */
export function useAutoCharge() {
  const items = useWalletStore((s) => s.items);
  const defaultSourceId = useWalletStore((s) => s.defaultSourceId);
  const askBeforeCharge = useSettingsStore((s) => s.askBeforeCharge);
  const { createCharge, updateCharge } = useCharges();

  /** CHECKED_IN with auto payment: creates an `in_progress` charge immediately. Returns null when confirmation is required. */
  async function startRideCharge(
    line: string,
    nowMs: number = Date.now(),
    passengers: number = 1,
  ): Promise<RideCharge | null> {
    if (askBeforeCharge) return null;
    const decision = selectPaymentSource(items, defaultSourceId, line, nowMs);
    const amount = computeFare(passengers, decision.amountCovered);
    const charge = await createCharge({
      line,
      amount,
      paidWith: decision.paidWith,
      status: 'in_progress',
    });
    return { charge, coveredByPass: decision.amountCovered, passengers };
  }

  /** CHECKED_IN after the user pressed OK in the boarding notice. */
  async function confirmRideCharge(
    line: string,
    nowMs: number = Date.now(),
    passengers: number = 1,
  ): Promise<RideCharge> {
    const decision = selectPaymentSource(items, defaultSourceId, line, nowMs);
    const amount = computeFare(passengers, decision.amountCovered);
    const charge = await createCharge({
      line,
      amount,
      paidWith: decision.paidWith,
      status: 'in_progress',
    });
    return { charge, coveredByPass: decision.amountCovered, passengers };
  }

  /** CHECK_OUT: final amount, capped/covered/completed + ended timestamp. */
  async function finishRideCharge(charge: Charge, spentTodayRon: number): Promise<Charge> {
    if (charge.amount === 0) {
      return updateCharge({ id: charge.id, patch: { status: 'covered_by_pass', endedAt: new Date().toISOString() } });
    }
    const capped = spentTodayRon + charge.amount >= DAILY_CAP_RON;
    return updateCharge({
      id: charge.id,
      patch: { status: capped ? 'capped' : 'completed', endedAt: new Date().toISOString() },
    });
  }

  return { startRideCharge, confirmRideCharge, finishRideCharge, NoPaymentSourceError };
}
