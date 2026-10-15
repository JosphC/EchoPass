import type { RssiDbm } from '../types';

const DEFAULT_ALPHA = 0.4;
const MISSING_RSSI: RssiDbm = -100;

/**
 * Netezire exponențială (EWMA) a RSSI-ului: taie zgomotul de multipath din
 * caroseria metalică fără să întârzie mult. Poll-ul lipsă contează ca
 * semnal foarte slab, nu ca zero.
 */
export function smoothRssi(prev: RssiDbm | null, sample: RssiDbm | null, alpha = DEFAULT_ALPHA): RssiDbm {
  const s = sample === null ? MISSING_RSSI : sample;
  if (prev === null) return s;
  return alpha * s + (1 - alpha) * prev;
}

/** Semnal suficient de puternic pentru pragul de intrare? */
export function isStrong(rssi: RssiDbm, enterRssi: RssiDbm): boolean {
  return rssi >= enterRssi;
}

/** Semnal suficient de slab pentru pragul de ieșire? */
export function isWeak(rssi: RssiDbm, exitRssi: RssiDbm): boolean {
  return rssi <= exitRssi;
}
