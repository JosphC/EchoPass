import { distanceAlongRouteKm } from '../../services/repositories/gtfs/routeProgress';
import type { BusMarker } from './hooks/useLiveMap';
import { loadStations, type Station } from './stations';

export interface Arrival {
  line: string;
  destination: string;
  etaMin: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export const CITY_CENTER: LatLng = { lat: 45.7577, lng: 21.2287 };
const FALLBACK_SPEED_KMH = 18;
/** Below this the vehicle waits at a light or stop: its instant speed says nothing about the ETA. */
const MIN_MOVING_KMH = 8;
/** A boulevard burst overstates the urban average that includes stops. */
const MAX_URBAN_KMH = 35;
/** Streets run longer than the straight line when no GTFS shape matches. */
const ROAD_FACTOR = 1.3;
/** Closer than this the vehicle is at the platform. */
const AT_STOP_KM = 0.05;
const MAX_BOARD = 5;
/** Beyond this the straight-line guess is noise, not information. */
const MAX_ETA_MIN = 90;

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h = s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Nearest station to a point; city center when location is unavailable. */
export function nearestStation(at: LatLng | null): Station {
  const stations = loadStations();
  const point = at ?? CITY_CENTER;
  let best = stations[0];
  let bestKm = Number.POSITIVE_INFINITY;
  for (const station of stations) {
    const km = haversineKm(point, station);
    if (km < bestKm) {
      bestKm = km;
      best = station;
    }
  }
  return best;
}

function speedOf(marker: BusMarker): number {
  const live = marker.position?.speedKmh;
  if (live == null || live < MIN_MOVING_KMH) return FALLBACK_SPEED_KMH;
  return Math.min(live, MAX_URBAN_KMH);
}

/**
 * Km the vehicle still drives to the station: along its GTFS shape when the
 * headsign matches, else straight line × road factor. null = it already
 * passed the station or runs the other way.
 */
function kmToStation(marker: BusMarker, station: Station): number | null {
  const pos = marker.position;
  if (!pos) return null;
  const straight = haversineKm(pos, station);
  if (straight <= AT_STOP_KM) return 0;
  const along = distanceAlongRouteKm(marker.bus.line, marker.bus.destination, pos, station);
  if (along === 'behind') return null;
  return along ?? straight * ROAD_FACTOR;
}

/**
 * Next arrivals at a station: the closest approaching vehicle per serving
 * line. Vehicles running away from the station are skipped; stopped ones
 * use the urban average instead of their zero speed.
 */
/** Minutes until the vehicle reaches the station; null when it passed it or runs away. */
export function etaToStationMin(marker: BusMarker, station: Station): number | null {
  const km = kmToStation(marker, station);
  return km === null ? null : Math.max(0, Math.round((km / speedOf(marker)) * 60));
}

export function estimateArrivals(station: Station, markers: BusMarker[]): Arrival[] {
  const served = new Set(station.lines);
  const byLine = new Map<string, { marker: BusMarker; km: number }>();
  for (const marker of markers) {
    if (!served.has(marker.bus.line)) continue;
    const km = kmToStation(marker, station);
    if (km === null) continue;
    const prev = byLine.get(marker.bus.line);
    if (!prev || km < prev.km) byLine.set(marker.bus.line, { marker, km });
  }
  return [...byLine.values()]
    .map(({ marker, km }) => ({
      line: marker.bus.line,
      destination: marker.bus.destination,
      etaMin: Math.max(0, Math.round((km / speedOf(marker)) * 60)),
    }))
    .sort((a, b) => a.etaMin - b.etaMin)
    .filter((a) => a.etaMin <= MAX_ETA_MIN)
    .slice(0, MAX_BOARD);
}
