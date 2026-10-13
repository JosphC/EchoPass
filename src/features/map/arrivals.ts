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
  return marker.position?.speedKmh ?? FALLBACK_SPEED_KMH;
}

/**
 * Next arrivals at a station: nearest live vehicle per serving line,
 * ETA from straight-line distance over its speed (stopped → urban average).
 */
export function estimateArrivals(station: Station, markers: BusMarker[]): Arrival[] {
  const served = new Set(station.lines);
  const byLine = new Map<string, { marker: BusMarker; km: number }>();
  for (const marker of markers) {
    if (!served.has(marker.bus.line) || !marker.position) continue;
    const km = haversineKm(marker.position, station);
    const prev = byLine.get(marker.bus.line);
    if (!prev || km < prev.km) byLine.set(marker.bus.line, { marker, km });
  }
  return [...byLine.values()]
    .map(({ marker, km }) => {
      const kmh = Math.max(speedOf(marker), 1);
      return {
        line: marker.bus.line,
        destination: marker.bus.destination,
        etaMin: Math.max(0, Math.round((km / kmh) * 60)),
      };
    })
    .sort((a, b) => a.etaMin - b.etaMin)
    .filter((a) => a.etaMin <= MAX_ETA_MIN)
    .slice(0, MAX_BOARD);
}
