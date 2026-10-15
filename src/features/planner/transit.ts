import { haversineKm, type LatLng, type Station } from '../map';
import type { BusMarker } from '../map';
import {
  buildDirectOption,
  buildTransferOption,
  MAX_BOARD_STATIONS,
  MAX_OPTIONS,
  maybeWalk,
  nearestStations,
  WALK_KMH,
} from './transitHelpers';

export interface TransitLeg {
  kind: 'walk' | 'ride';
  line: string | null;
  minutes: number;
  fromName: string;
  toName: string;
  fromStation?: Station | null;
  toStation?: Station | null;
  /** Scheduled headsign (direction, e.g. "Holdelor"), when known. */
  headsign?: string | null;
  /** Ride legs: scheduled boarding time (ms) and the stops passed on the way. */
  departMs?: number;
  via?: Station[];
}

export interface TransitOption {
  id: string;
  legs: TransitLeg[];
  totalMin: number;
  fareRon: number;
  crowd: 1 | 2 | 3;
  line: string;
  boardStation: Station;
  transferStation?: Station | null;
  alightStation: Station;
  /** Scheduled headsign of the first ride, when known. */
  headsign?: string | null;
  /** Ordered intermediate stations of the scheduled trip(s), for map geometry. */
  viaStations?: Station[];
  /**
   * Exact GTFS shape trips per ride leg (travel direction included).
   * Geometry prefers these over everything else.
   */
  shapeLegs?: { tripIdx: number; boardId: string; alightId: string }[];
  /** True when times are heuristic estimates (no scheduled trip found). */
  estimated?: boolean;
}

export interface OriginPoint {
  station: Station | null;
  coords: LatLng | null;
  name?: string;
}

export type DestinationTarget =
  | Station
  | {
      station?: Station | null;
      coords: LatLng | null;
      name?: string;
    };

/** Transfer stop next to the destination: riding on and walking back makes no sense. */
function transfersAtDestination(opt: TransitOption, dest: LatLng | null): boolean {
  return opt.transferStation != null && dest != null && haversineKm(opt.transferStation, dest) < 0.15;
}

/**
 * Multimodal transit routing: walking to nearest stop, live buses, transfers,
 * and walking from alight station to final destination.
 *
 * Ride directions and times come from the GTFS timetable when available
 * (wrong-way boardings are rejected); otherwise heuristic estimates are used
 * and the option is flagged `estimated`.
 */
export function planTransit(
  origin: OriginPoint,
  destInput: DestinationTarget,
  markers: BusMarker[],
  nowMs: number = Date.now(),
): TransitOption[] {
  const destCoords = 'lat' in destInput ? destInput : destInput.coords;
  const destName = 'name' in destInput && destInput.name ? destInput.name : 'Destinație';
  const destStation: Station | null = 'lines' in destInput ? destInput : (destInput.station ?? null);

  const candidateDests: Station[] = destStation
    ? [destStation]
    : destCoords
      ? nearestStations(destCoords, 3)
      : [];
  if (candidateDests.length === 0) return [];

  const boards =
    origin.station != null
      ? [{ station: origin.station, walk: null as TransitLeg | null }]
      : origin.coords != null
        ? nearestStations(origin.coords, MAX_BOARD_STATIONS).map((station) => ({
            station,
            walk: maybeWalk(origin.coords as LatLng, origin.name ?? 'Locația ta', station, station.name),
          }))
        : [];
  if (boards.length === 0) return [];

  if (destStation && origin.station?.id === destStation.id) {
    const distKm = origin.coords ? haversineKm(origin.coords, destStation) : 0;
    const walkMinutes = Math.max(1, Math.round((distKm / WALK_KMH) * 60));
    return [
      {
        id: `w-direct-${destStation.id}`,
        legs: [
          {
            kind: 'walk',
            line: null,
            minutes: walkMinutes,
            fromName: origin.coords && distKm > 0.05 ? (origin.name ?? 'Locația ta') : destStation.name,
            toName: destStation.name,
          },
        ],
        totalMin: walkMinutes,
        fareRon: 0,
        crowd: 1,
        line: 'Pe jos',
        boardStation: destStation,
        transferStation: null,
        alightStation: destStation,
      },
    ];
  }

  const found = new Map<string, TransitOption>();



  for (const { station: board, walk } of boards) {
    for (const first of board.lines) {
      for (const dCandidate of candidateDests) {
        if (dCandidate.lines.includes(first)) {
          const opt = buildDirectOption(board, walk, first, dCandidate, destCoords, destName, markers, nowMs);
          if (opt && !found.has(opt.id)) found.set(opt.id, opt);
        }
        for (const second of dCandidate.lines) {
          const opt = buildTransferOption(board, walk, first, second, dCandidate, destCoords, destName, markers, nowMs);
          if (opt && !found.has(opt.id) && !transfersAtDestination(opt, destStation ?? destCoords)) found.set(opt.id, opt);
        }
      }
    }
  }

  const sorted = [...found.values()].sort((a, b) => a.totalMin - b.totalMin);
  const distinct: TransitOption[] = [];
  const seenPaths = new Set<string>();
  for (const opt of sorted) {
    const key = opt.legs
      .map((l) => (l.kind === 'ride' ? l.line : ''))
      .filter(Boolean)
      .join('->');
    if (!seenPaths.has(key)) {
      seenPaths.add(key);
      distinct.push(opt);
    }
    if (distinct.length >= MAX_OPTIONS) break;
  }
  return distinct.length > 0 ? distinct : sorted.slice(0, MAX_OPTIONS);
}
