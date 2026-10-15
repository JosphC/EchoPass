import { haversineKm, type LatLng } from '../../core/utils/geo';
import { isStrong, isWeak } from './ble/rssi';
import { DEFAULT_CLUSTER_CONFIG, type ClusterConfig, type ClusterState, type RssiDbm } from './types';

export interface ClusterTracker {
  state: ClusterState;
  streak: number;
}

export function initCluster(): ClusterTracker {
  return { state: 'outside', streak: 0 };
}

/**
 * Mașina de stări a clusterului (pură, testabilă). `rssi = null` = poll fără
 * detecție (tratat ca semnal foarte slab). Intrarea cere mai multe poll-uri
 * tari consecutive, ieșirea și mai multe slabe consecutive — un vârf izolat
 * sau o cădere izolată nu răstoarnă starea.
 */
export function nextCluster(
  tracker: ClusterTracker,
  rssi: RssiDbm | null,
  cfg: ClusterConfig = DEFAULT_CLUSTER_CONFIG,
): ClusterTracker {
  const s = rssi === null ? -100 : rssi;
  switch (tracker.state) {
    case 'outside':
      if (isStrong(s, cfg.enterRssi)) {
        const streak = tracker.streak + 1;
        return streak >= cfg.enterPolls ? { state: 'inside', streak: 0 } : { state: 'candidate', streak };
      }
      return { state: 'outside', streak: 0 };
    case 'candidate':
      if (isStrong(s, cfg.enterRssi)) {
        const streak = tracker.streak + 1;
        return streak >= cfg.enterPolls ? { state: 'inside', streak: 0 } : { state: 'candidate', streak };
      }
      return { state: 'outside', streak: 0 };
    case 'inside':
      if (isWeak(s, cfg.exitRssi)) return { state: 'leaving', streak: 1 };
      return { state: 'inside', streak: 0 };
    case 'leaving':
      if (isWeak(s, cfg.exitRssi)) {
        const streak = tracker.streak + 1;
        return streak >= cfg.exitPolls ? { state: 'outside', streak: 0 } : { state: 'leaving', streak };
      }
      return { state: 'inside', streak: 0 };
  }
}

/** Telefonul e în raza clusterului față de poziția autobuzului? */
export function isNearBus(phone: LatLng, bus: LatLng, radiusM = DEFAULT_CLUSTER_CONFIG.clusterRadiusM): boolean {
  return haversineKm(phone, bus) * 1000 <= radiusM;
}

/** Îmbarcarea se confirmă doar cu BLE înăuntru ȘI GPS aproape (dublă dovadă). */
export function confirmBoarding(bleInside: boolean, gpsNear: boolean): boolean {
  return bleInside && gpsNear;
}
