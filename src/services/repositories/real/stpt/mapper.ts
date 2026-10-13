import type { Bus, BusPosition } from '../../../api/schemas/bus';
import type { StptVehicle } from './schemas';

/**
 * STPT has no crowding or delay feed: crowd defaults to 1 (liber) and
 * delayMin to 0. arrivesInMin is unknown live, so the popup leads with
 * "Acum la {stop}" instead of an ETA.
 */
export function mapVehicleToBus(v: StptVehicle): Bus {
  return { id: v.id, line: v.route, destination: v.headsign, crowd: 1, delayMin: 0, delayReason: null };
}

export function mapVehicleToPosition(v: StptVehicle): BusPosition {
  return {
    busId: v.id,
    lat: v.lat,
    lng: v.lng,
    nextStop: v.stop,
    arrivesInMin: 0,
    updatedAt: new Date(v.timestamp).toISOString(),
    speedKmh: v.speed,
  };
}

export function mapVehicles(vehicles: StptVehicle[]): { buses: Bus[]; positions: BusPosition[] } {
  return { buses: vehicles.map(mapVehicleToBus), positions: vehicles.map(mapVehicleToPosition) };
}
