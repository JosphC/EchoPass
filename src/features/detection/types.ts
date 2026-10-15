import type { LatLng } from '../../core/utils/geo';

/** RSSI în dBm (negativ, ex. -65 = aproape, -85 = departe). */
export type RssiDbm = number;

/** O citire de la un poll BLE (telefon sau ESP32, după topologie). */
export interface BlePoll {
  deviceId: string;
  rssi: RssiDbm | null;
  atMs: number;
}

/** Starea de apartenență la clusterul autobuzului. */
export type ClusterState = 'outside' | 'candidate' | 'inside' | 'leaving';

/**
 * Praguri calibrate pe lungimea vehiculului. Intrarea e mai strictă decât
 * ieșirea (histereză) ca să nu oscileze la limită. `exitRssi` e mai mic
 * (semnal mai slab = mai departe) decât `enterRssi`.
 */
export interface ClusterConfig {
  enterRssi: RssiDbm;
  exitRssi: RssiDbm;
  enterPolls: number;
  exitPolls: number;
  clusterRadiusM: number;
}

export const DEFAULT_CLUSTER_CONFIG: ClusterConfig = {
  enterRssi: -65,
  exitRssi: -75,
  enterPolls: 3,
  exitPolls: 5,
  clusterRadiusM: 15,
};

export interface GpsFix {
  pos: LatLng;
  atMs: number;
}
