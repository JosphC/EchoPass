import { createBusMock } from '../mock/busMock';
import type { BusRepo } from '../types';
import { fetchStptVehicles } from './stpt/client';
import { mapVehicles } from './stpt/mapper';
import type { StptVehicle } from './stpt/schemas';

let inFlight: Promise<StptVehicle[]> | null = null;

/** One shared fetch: simultaneous buses + positions join on the same snapshot. */
function loadVehicles(): Promise<StptVehicle[]> {
  if (!inFlight) {
    inFlight = fetchStptVehicles();
    inFlight.then(
      () => {
        inFlight = null;
      },
      () => {
        inFlight = null;
      },
    );
  }
  return inFlight;
}

/** Live STPT positions with mock fallback: any network/schema error returns mocks. */
export function createStptBusRepo(): BusRepo {
  const fallback = createBusMock();
  return {
    getBuses: async () => {
      try {
        return mapVehicles(await loadVehicles()).buses;
      } catch {
        return fallback.getBuses();
      }
    },
    getPositions: async () => {
      try {
        return mapVehicles(await loadVehicles()).positions;
      } catch {
        return fallback.getPositions();
      }
    },
  };
}
