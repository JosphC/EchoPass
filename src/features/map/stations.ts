import { z } from 'zod';
import rawStations from '../../assets/stations.json';
import type { BusMarker } from './hooks/useLiveMap';

export const TROLLEYBUS_LINES = ['11', '14', '15', '16', '17', '18', 'M11', 'M14'] as const;

const stationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  lines: z.array(z.string().min(1)).min(1),
});

export type Station = z.infer<typeof stationSchema>;
const stationsSchema = z.array(stationSchema);

let cache: Station[] | null = null;

/** GTFS-based stations (offline asset, validated once at first use). */
export function loadStations(): Station[] {
  if (!cache) cache = stationsSchema.parse(rawStations);
  return cache;
}

/** Lowercase + strip diacritics so "marasti" matches "Mărăști". */
export function normStationText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Case- and diacritic-insensitive substring search, capped for list rendering. */
export function searchStations(stations: Station[], query: string, limit = 30): Station[] {
  const needle = normStationText(query.trim());
  if (needle.length < 2) return [];
  return stations.filter((s) => normStationText(s.name).includes(needle)).slice(0, limit);
}

/** Trolleybuses whose line serves the station (GTFS lines are authoritative). */
export function trolleybusesAt(markers: BusMarker[], station: Station): BusMarker[] {
  const served = new Set(station.lines);
  const tb = TROLLEYBUS_LINES as readonly string[];
  return markers.filter((m) => tb.includes(m.bus.line) && served.has(m.bus.line));
}
