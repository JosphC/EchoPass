import type { Router } from 'expo-router';
import type { LatLng, LocationPlace, Station } from '../map';

interface PlanOption {
  id: string;
}

export type NavPoint = Station | LocationPlace;

/** Deep link to the planner with resolved stations/places and the chosen option. */
export function pushPlanRoute(
  router: Router,
  from: NavPoint,
  to: NavPoint,
  option?: PlanOption,
  originCoords?: LatLng | null,
  destCoords?: LatLng | null,
): void {
  const fromStationId = 'station' in from && from.station ? from.station.id : ('lines' in from ? from.id : undefined);
  const toStationId = 'station' in to && to.station ? to.station.id : ('lines' in to ? to.id : undefined);
  const olat = originCoords?.lat ?? from.lat;
  const olng = originCoords?.lng ?? from.lng;
  const dlat = destCoords?.lat ?? to.lat;
  const dlng = destCoords?.lng ?? to.lng;

  router.push({
    pathname: '/plan',
    params: {
      ...(fromStationId ? { fromId: fromStationId } : {}),
      ...(toStationId ? { toId: toStationId } : {}),
      olat: String(olat),
      olng: String(olng),
      oname: from.name,
      dlat: String(dlat),
      dlng: String(dlng),
      dname: to.name,
      ...(option ? { optionId: option.id } : {}),
    },
  });
}
