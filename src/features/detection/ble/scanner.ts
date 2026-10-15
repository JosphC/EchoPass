import { PermissionsAndroid, Platform } from 'react-native';
import { env } from '../../../core/config/env';
import type { BlePoll } from '../types';

/** One advertisement heard from an on-board transmitter; deviceId = vehicle id. */
export type BleSample = BlePoll;

export interface BleScanner {
  /** Starts listening; returns the stop function. Never throws. */
  start(onSample: (sample: BleSample) => void): Promise<() => void>;
}

/** Vehicle id from the advertised local name ("EP-3114" → "3114"), null for foreign devices. */
export function parseVehicleId(localName: string | null | undefined, prefix: string = env.bleNamePrefix): string | null {
  if (!localName || !localName.startsWith(prefix)) return null;
  const id = localName.slice(prefix.length).trim();
  return id.length > 0 ? id : null;
}

async function grantAndroidScan(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const needed =
    Number(Platform.Version) >= 31
      ? [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          // Beacon advertisements need a location-capable scan (no neverForLocation).
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]
      : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
  const result = await PermissionsAndroid.requestMultiple(needed);
  return needed.every((p) => result[p] === PermissionsAndroid.RESULTS.GRANTED);
}

type BlePlx = typeof import('react-native-ble-plx');

/** Native module is present only in a dev client / build that includes ble-plx. */
function loadBlePlx(): BlePlx | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-ble-plx') as BlePlx;
  } catch {
    return null;
  }
}

/** Real scanner (react-native-ble-plx). Missing module or denied permission → silent no-op. */
export function createNativeScanner(): BleScanner {
  return {
    async start(onSample) {
      const plx = loadBlePlx();
      if (!plx || !(await grantAndroidScan().catch(() => false))) return () => undefined;
      let manager: InstanceType<BlePlx['BleManager']>;
      try {
        manager = new plx.BleManager();
      } catch {
        return () => undefined;
      }
      const uuids = env.bleServiceUuid ? [env.bleServiceUuid] : null;
      manager
        .startDeviceScan(uuids, { allowDuplicates: true }, (error, device) => {
          if (error || !device) return;
          const vehicleId = parseVehicleId(device.localName ?? device.name);
          if (vehicleId && device.rssi != null) onSample({ deviceId: vehicleId, rssi: device.rssi, atMs: Date.now() });
        })
        .catch(() => undefined);
      return () => {
        void manager.stopDeviceScan().catch(() => undefined);
        void manager.destroy().catch(() => undefined);
      };
    },
  };
}

const mockListeners = new Set<(sample: BleSample) => void>();

/** Mock mode: samples come from `emitMockBleSample` (simulator bar, tests). */
export function createMockScanner(): BleScanner {
  return {
    async start(onSample) {
      mockListeners.add(onSample);
      return () => {
        mockListeners.delete(onSample);
      };
    },
  };
}

export function emitMockBleSample(sample: BleSample): void {
  for (const listener of mockListeners) listener(sample);
}

export function createBleScanner(): BleScanner {
  return env.useMocks ? createMockScanner() : createNativeScanner();
}
