import { initCluster, nextCluster, type ClusterTracker } from '../cluster';
import { DEFAULT_CLUSTER_CONFIG, type BlePoll, type ClusterConfig, type RssiDbm } from '../types';
import { smoothRssi } from './rssi';

/** Interval of one BLE "poll": advertisements in it collapse to the strongest one. */
export const BLE_POLL_MS = 1000;

/** Below this smoothed RSSI an `outside` vehicle is forgotten (bounded memory). */
const FORGET_RSSI: RssiDbm = -95;

export interface VehiclePresence {
  smoothed: RssiDbm | null;
  tracker: ClusterTracker;
}

export type PresenceMap = Record<string, VehiclePresence>;

export interface PresenceStep {
  presence: PresenceMap;
  /** Vehicles that just reached `inside` (boarding). */
  entered: string[];
  /** Vehicles that just dropped back to `outside` (alighting). */
  left: string[];
}

/** Strongest RSSI per vehicle among the advertisements of one poll window. */
export function strongestPerVehicle(samples: BlePoll[]): Map<string, RssiDbm> {
  const out = new Map<string, RssiDbm>();
  for (const s of samples) {
    if (s.rssi === null) continue;
    const prev = out.get(s.deviceId);
    if (prev === undefined || s.rssi > prev) out.set(s.deviceId, s.rssi);
  }
  return out;
}

/**
 * One poll of the boarding detector (pure). A vehicle heard in the window
 * gets its strongest RSSI, a known vehicle not heard gets a missing poll;
 * both go through EWMA smoothing and the hysteresis cluster.
 */
export function stepPresence(
  presence: PresenceMap,
  samples: BlePoll[],
  cfg: ClusterConfig = DEFAULT_CLUSTER_CONFIG,
): PresenceStep {
  const heard = strongestPerVehicle(samples);
  const ids = new Set([...Object.keys(presence), ...heard.keys()]);
  const next: PresenceMap = {};
  const entered: string[] = [];
  const left: string[] = [];
  for (const id of ids) {
    const prev = presence[id] ?? { smoothed: null, tracker: initCluster() };
    const smoothed = smoothRssi(prev.smoothed, heard.get(id) ?? null);
    const tracker = nextCluster(prev.tracker, smoothed, cfg);
    if (tracker.state === 'inside' && prev.tracker.state !== 'inside' && prev.tracker.state !== 'leaving') entered.push(id);
    if (tracker.state === 'outside' && prev.tracker.state === 'leaving') left.push(id);
    if (tracker.state === 'outside' && smoothed <= FORGET_RSSI) continue;
    next[id] = { smoothed, tracker };
  }
  return { presence: next, entered, left };
}
