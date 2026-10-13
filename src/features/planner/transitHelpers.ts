import { haversineKm, loadStations, type LatLng, type Station } from '../map';
import type { BusMarker } from '../map';
import {
  findAnyForwardTrip,
  findForwardRides,
  getTripStopSequence,
  lineRunsForwardOn,
  stopHasLineTrips,
} from '../../services/repositories/gtfs/timetable';
import type { TransitLeg, TransitOption } from './transit';

export const WALK_KMH = 4.5;
export const BUS_KMH = 18;
/** Real footpaths are longer than the straight line between two points. */
export const WALK_ROAD_FACTOR = 1.3;
export const TRANSFER_MIN = 3;
export const HEADWAY_MIN = 8;
export const FARE_PER_RIDE = 3;
export const MAX_OPTIONS = 3;
export const MAX_BOARD_STATIONS = 5;

export function walkMin(a: LatLng, b: LatLng): number {
  // Straight-line distance underestimates real footpaths (detours, crossings);
  // the road factor keeps walking times honest.
  return Math.max(1, Math.round((haversineKm(a, b) * WALK_ROAD_FACTOR) / WALK_KMH * 60));
}

export function rideMin(a: LatLng, b: LatLng): number {
  return Math.max(1, Math.round((haversineKm(a, b) / BUS_KMH) * 60));
}

export function nearestStations(point: LatLng, limit: number): Station[] {
  return [...loadStations()].sort((a, b) => haversineKm(point, a) - haversineKm(point, b)).slice(0, limit);
}

let lineStationsCache: Map<string, Station[]> | null = null;

export function stationsOfLine(): Map<string, Station[]> {
  if (!lineStationsCache) {
    lineStationsCache = new Map();
    for (const s of loadStations()) {
      for (const line of s.lines) {
        const list = lineStationsCache.get(line);
        if (list) list.push(s);
        else lineStationsCache.set(line, [s]);
      }
    }
  }
  return lineStationsCache;
}

export function nearestOnLine(line: string, to: LatLng): Station | null {
  const list = stationsOfLine().get(line);
  if (!list || list.length === 0) return null;
  let best = list[0];
  let bestKm = haversineKm(best, to);
  for (const s of list) {
    const km = haversineKm(s, to);
    if (km < bestKm) {
      best = s;
      bestKm = km;
    }
  }
  return best;
}

/** Nearest stations of a line to a point, nearest first. */
export function nearestLineStations(line: string, to: LatLng, limit = 3): Station[] {
  const list = stationsOfLine().get(line) ?? [];
  return [...list].sort((a, b) => haversineKm(a, to) - haversineKm(b, to)).slice(0, Math.max(1, limit));
}

export interface AlightPick {
  alight: Station;
  scheduled: ScheduledLegInfo | null;
}

/**
 * Alighting stop for a ride: the nearest stop of the line that the bus
 * actually serves in our travel direction. The geographically nearest stop
 * is often across the street on the opposite direction (e.g. E6 "Scalini"
 * vs "Campeador") — those are skipped via the timetable, falling back to
 * slightly farther but reachable stops.
 */
export function pickAlightStation(
  line: string,
  destPoint: LatLng,
  fromStation: Station,
  nowMs: number,
  fromMs: number = nowMs,
): AlightPick | null {
  let fallback: Station | null = null;
  for (const candidate of nearestLineStations(line, destPoint, 3)) {
    if (candidate.id === fromStation.id) continue;
    const scheduled = scheduledDirectRide(fromStation, candidate, line, nowMs, fromMs);
    if (scheduled) return { alight: candidate, scheduled };
    if (fallback === null && scheduledDirection(fromStation, candidate, line, nowMs) !== false) {
      fallback = candidate;
    }
  }
  if (!fallback) return null;
  return { alight: fallback, scheduled: null };
}

export function waitForBus(markers: BusMarker[], line: string, at: LatLng): { minutes: number; crowd: 1 | 2 | 3 } {
  let best: { minutes: number; crowd: 1 | 2 | 3 } | null = null;
  for (const m of markers) {
    if (m.bus.line !== line || !m.position) continue;
    const speed = Math.max(m.position.speedKmh ?? BUS_KMH, 1);
    const minutes = Math.round((haversineKm(m.position, at) / speed) * 60);
    if (!best || minutes < best.minutes) best = { minutes, crowd: m.bus.crowd };
  }
  return best ?? { minutes: HEADWAY_MIN, crowd: 2 };
}

/**
 * Wait estimate from a live bus that is actually approaching the boarding
 * stop heading toward the alighting stop (triangle-inequality check: the
 * boarding stop lies roughly on the bus→destination path). Returns null when
 * no live bus on the line is coming our way — e.g. all are driving away.
 */
export function approachingBusWait(
  markers: BusMarker[],
  line: string,
  board: LatLng,
  alight: LatLng,
): { minutes: number; crowd: 1 | 2 | 3 } | null {
  const legKm = haversineKm(board, alight);
  const toleranceKm = Math.max(0.4, legKm * 0.2);
  let best: { minutes: number; crowd: 1 | 2 | 3 } | null = null;
  for (const m of markers) {
    if (m.bus.line !== line || !m.position) continue;
    const busKmToBoard = haversineKm(m.position, board);
    const busKmToAlight = haversineKm(m.position, alight);
    // Approaching via our stop: board lies on the bus→alight path.
    if (busKmToBoard + legKm - busKmToAlight > toleranceKm) continue;
    const speed = Math.max(m.position.speedKmh ?? BUS_KMH, 6);
    const minutes = Math.max(0, Math.round((busKmToBoard / speed) * 60));
    if (!best || minutes < best.minutes) best = { minutes, crowd: m.bus.crowd };
  }
  return best;
}

export interface ScheduledLegInfo {
  waitMin: number;
  rideMin: number;
  headsign: string;
  tripIdx: number;
  boardSec: number;
  alightSec: number;
}

/** Real scheduled ride board→alight (direction validated), or null. */
export function scheduledDirectRide(
  board: Station,
  alight: Station,
  line: string,
  nowMs: number,
  fromMs: number = nowMs,
): ScheduledLegInfo | null {
  const rides = findForwardRides(board.id, alight.id, line, fromMs, 120, 1);
  if (rides.length === 0) return null;
  const ride = rides[0];
  return {
    waitMin: Math.max(0, Math.round((ride.departMs - fromMs) / 60_000)),
    rideMin: ride.rideMin,
    headsign: ride.headsign,
    tripIdx: ride.tripIdx,
    boardSec: ride.boardSec,
    alightSec: ride.alightSec,
  };
}

export interface RideTiming {
  rideMin: number;
  headsign: string;
  tripIdx: number;
  boardSec: number;
  alightSec: number;
  /** Minutes until the next bus, or null off-hours (wait is then estimated). */
  upcomingWaitMin: number | null;
}

/**
 * Best available timing for a ride: the next scheduled bus when one runs soon,
 * otherwise any scheduled trip of the line (ride time, headsign and geometry
 * do not depend on the hour). Null only when the timetable knows nothing.
 */
export function timeRide(
  board: Station,
  alight: Station,
  line: string,
  nowMs: number,
  fromMs: number = nowMs,
): RideTiming | null {
  const upcoming = scheduledDirectRide(board, alight, line, nowMs, fromMs);
  if (upcoming) return { ...upcoming, upcomingWaitMin: upcoming.waitMin };
  const pattern = findAnyForwardTrip(board.id, alight.id, line);
  if (!pattern) return null;
  return { ...pattern, upcomingWaitMin: null };
}

/**
 * Direction check that works even when no bus runs right now (e.g. at night):
 * does the line ever serve board→alight in this order on the active service?
 * Returns null when the timetable has no (or only partial) data for the line
 * at these stops (unknown — caller should fall back to heuristics, not reject).
 */
export function scheduledDirection(board: Station, alight: Station, line: string, nowMs: number): boolean | null {
  if (!stopHasLineTrips(board.id, line) || !stopHasLineTrips(alight.id, line)) return null;
  return lineRunsForwardOn(board.id, alight.id, line, nowMs);
}

/** Ordered intermediate stations of a scheduled trip between two stop times. */
export function tripViaStations(tripIdx: number, boardSec: number, alightSec: number): Station[] {
  const seq = getTripStopSequence(tripIdx);
  const byId = new Map(loadStations().map((s) => [s.id, s]));
  const out: Station[] = [];
  const seen = new Set<string>();
  for (const p of seq) {
    if (p.sec <= boardSec || p.sec >= alightSec) continue;
    if (seen.has(p.stopId)) continue;
    seen.add(p.stopId);
    const station = byId.get(p.stopId);
    if (station) out.push(station);
  }
  return out;
}

/**
 * Guards against absurd detours: going via `point` must not be much longer
 * (as the crow flies) than heading straight to the destination.
 */
export function isReasonableDetour(from: LatLng, via: LatLng, dest: LatLng, maxRatio = 1.6): boolean {
  const directKm = haversineKm(from, dest);
  if (directKm < 0.15) return true;
  return haversineKm(from, via) + haversineKm(via, dest) <= directKm * maxRatio;
}

export function maybeWalk(from: LatLng, fromName: string, to: LatLng, toName: string): TransitLeg | null {
  if (haversineKm(from, to) < 0.03) return null;
  return { kind: 'walk', line: null, minutes: walkMin(from, to), fromName, toName };
}

export function deduplicateBoardStations(
  boards: { station: Station; walk: TransitLeg | null }[],
  originCoords: LatLng | null,
): Map<string, { station: Station; walk: TransitLeg | null }> {
  const map = new Map<string, { station: Station; walk: TransitLeg | null }>();
  for (const item of boards) {
    for (const line of item.station.lines) {
      const existing = map.get(line);
      const walkKm = originCoords ? haversineKm(originCoords, item.station) : 0;
      if (!existing || walkKm < (originCoords ? haversineKm(originCoords, existing.station) : 0)) {
        map.set(line, item);
      }
    }
  }
  return map;
}

export function buildDirectOption(
  board: Station,
  walk: TransitLeg | null,
  line: string,
  targetStation: Station,
  destCoords: LatLng | null,
  destName: string,
  markers: BusMarker[],
  nowMs: number = Date.now(),
): TransitOption | null {
  const destPoint = destCoords ?? targetStation;
  const pick = pickAlightStation(line, destPoint, board, nowMs);
  if (!pick) return null;
  const { alight, scheduled } = pick;

  // Real timetable data: the next bus when one runs soon, else any scheduled
  // trip of the line (ride time, headsign and geometry don't depend on hour).
  // Only fully-unknown legs fall back to heuristics.
  const timed = scheduled
    ? {
        rideMin: scheduled.rideMin,
        headsign: scheduled.headsign,
        tripIdx: scheduled.tripIdx,
        boardSec: scheduled.boardSec,
        alightSec: scheduled.alightSec,
        upcomingWaitMin: scheduled.waitMin as number | null,
      }
    : timeRide(board, alight, line, nowMs);
  if (!timed) {
    if (scheduledDirection(board, alight, line, nowMs) === false) return null;
    if (!isReasonableDetour(board, alight, destPoint)) return null;
  }

  const approaching = approachingBusWait(markers, line, board, alight);
  // A live bus already coming our way beats the printed schedule.
  const wait: { minutes: number; crowd: 1 | 2 | 3 } =
    timed?.upcomingWaitMin != null
      ? {
          minutes: approaching ? Math.min(timed.upcomingWaitMin, approaching.minutes) : timed.upcomingWaitMin,
          crowd: approaching && approaching.minutes <= timed.upcomingWaitMin ? approaching.crowd : 2,
        }
      : (approaching ?? { minutes: HEADWAY_MIN, crowd: 2 as 1 | 2 | 3 });
  const rideMinutes = timed?.rideMin ?? rideMin(board, alight);
  const ride: TransitLeg = {
    kind: 'ride',
    line,
    minutes: rideMinutes,
    fromName: board.name,
    toName: alight.name,
    fromStation: board,
    toStation: alight,
    headsign: timed?.headsign ?? null,
  };
  const lastWalk = destCoords ? maybeWalk(alight, alight.name, destCoords, destName) : null;
  const legs = [walk, ride, lastWalk].filter((l): l is TransitLeg => l !== null);
  const total = (walk?.minutes ?? 0) + wait.minutes + ride.minutes + (lastWalk?.minutes ?? 0);
  return {
    id: `d-${line}-${board.id}-${alight.id}`,
    legs,
    totalMin: total,
    fareRon: FARE_PER_RIDE,
    crowd: wait.crowd,
    line,
    boardStation: board,
    transferStation: null,
    alightStation: alight,
    headsign: timed?.headsign ?? null,
    viaStations: timed != null ? tripViaStations(timed.tripIdx, timed.boardSec, timed.alightSec) : undefined,
    shapeLegs: timed != null ? [{ tripIdx: timed.tripIdx, boardId: board.id, alightId: alight.id }] : undefined,
    estimated: timed?.upcomingWaitMin == null,
  };
}

export function buildTransferOption(
  board: Station,
  walk: TransitLeg | null,
  first: string,
  second: string,
  targetStation: Station,
  destCoords: LatLng | null,
  destName: string,
  markers: BusMarker[],
  nowMs: number = Date.now(),
): TransitOption | null {
  if (first === second) return null;
  const firstStops = stationsOfLine().get(first);
  const secondIds = new Set((stationsOfLine().get(second) ?? []).map((s) => s.id));
  if (!firstStops) return null;
  const destPoint = destCoords ?? targetStation;

  // Shared stations ranked by detour sanity — never transfer backwards.
  const candidates = firstStops
    .filter((s) => secondIds.has(s.id) && s.id !== board.id)
    .filter((s) => isReasonableDetour(board, s, destPoint))
    .sort(
      (a, b) =>
        haversineKm(board, a) + haversineKm(a, destPoint) - (haversineKm(board, b) + haversineKm(b, destPoint)),
    )
    .slice(0, 4);

  let best: TransitOption | null = null;
  for (const change of candidates) {
    const opt = buildTransferVia(board, walk, first, second, change, destCoords, destPoint, destName, markers, nowMs);
    if (opt && (!best || opt.totalMin < best.totalMin)) best = opt;
  }
  return best;
}

function buildTransferVia(
  board: Station,
  walk: TransitLeg | null,
  first: string,
  second: string,
  change: Station,
  destCoords: LatLng | null,
  destPoint: LatLng,
  destName: string,
  markers: BusMarker[],
  nowMs: number,
): TransitOption | null {
  // Direction validity of the first leg (timetable pattern; unknown when no data).
  if (scheduledDirection(board, change, first, nowMs) === false) return null;

  const walkMinutes = walk?.minutes ?? 0;
  const leg1Scheduled = scheduledDirectRide(board, change, first, nowMs);
  const leg1Timed: RideTiming | null = leg1Scheduled
    ? { ...leg1Scheduled, upcomingWaitMin: leg1Scheduled.waitMin }
    : timeRide(board, change, first, nowMs);
  const approaching1 = approachingBusWait(markers, first, board, change);
  const wait1 =
    leg1Timed?.upcomingWaitMin != null
      ? approaching1
        ? Math.min(leg1Timed.upcomingWaitMin, approaching1.minutes)
        : leg1Timed.upcomingWaitMin
      : (approaching1?.minutes ?? HEADWAY_MIN);
  const ride1Min = leg1Timed?.rideMin ?? rideMin(board, change);
  const arrive1Ms = nowMs + (walkMinutes + wait1 + ride1Min) * 60_000;

  // The second bus must realistically connect after the first arrival, at a
  // stop it actually serves in our direction.
  const pick = pickAlightStation(second, destPoint, change, nowMs, arrive1Ms + TRANSFER_MIN * 60_000);
  if (!pick) return null;
  const { alight, scheduled: leg2Upcoming } = pick;
  const leg2Timed =
    leg2Upcoming != null
      ? {
          rideMin: leg2Upcoming.rideMin,
          headsign: leg2Upcoming.headsign,
          tripIdx: leg2Upcoming.tripIdx,
          boardSec: leg2Upcoming.boardSec,
          alightSec: leg2Upcoming.alightSec,
          upcomingWaitMin: leg2Upcoming.waitMin as number | null,
        }
      : timeRide(change, alight, second, nowMs, arrive1Ms + TRANSFER_MIN * 60_000);
  if (!leg2Timed && !isReasonableDetour(change, alight, destPoint)) return null;
  const wait2 = leg2Timed?.upcomingWaitMin ?? HEADWAY_MIN;
  const ride2Min = leg2Timed?.rideMin ?? rideMin(change, alight);

  const ride1: TransitLeg = {
    kind: 'ride',
    line: first,
    minutes: ride1Min,
    fromName: board.name,
    toName: change.name,
    fromStation: board,
    toStation: change,
    headsign: leg1Timed?.headsign ?? null,
  };
  const ride2: TransitLeg = {
    kind: 'ride',
    line: second,
    minutes: ride2Min,
    fromName: change.name,
    toName: alight.name,
    fromStation: change,
    toStation: alight,
    headsign: leg2Timed?.headsign ?? null,
  };
  const lastWalk = destCoords ? maybeWalk(alight, alight.name, destCoords, destName) : null;
  const legs = [walk, ride1, ride2, lastWalk].filter((l): l is TransitLeg => l !== null);
  const total = walkMinutes + wait1 + ride1Min + TRANSFER_MIN + wait2 + ride2Min + (lastWalk?.minutes ?? 0);
  const via1 = leg1Timed ? tripViaStations(leg1Timed.tripIdx, leg1Timed.boardSec, leg1Timed.alightSec) : [];
  const via2 = leg2Timed ? tripViaStations(leg2Timed.tripIdx, leg2Timed.boardSec, leg2Timed.alightSec) : [];
  const upcoming = leg1Timed?.upcomingWaitMin != null && leg2Timed?.upcomingWaitMin != null;
  const shapeLegs: { tripIdx: number; boardId: string; alightId: string }[] = [];
  if (leg1Timed) shapeLegs.push({ tripIdx: leg1Timed.tripIdx, boardId: board.id, alightId: change.id });
  if (leg2Timed) shapeLegs.push({ tripIdx: leg2Timed.tripIdx, boardId: change.id, alightId: alight.id });
  return {
    id: `t-${first}-${second}-${board.id}-${change.id}-${alight.id}`,
    legs,
    totalMin: total,
    fareRon: FARE_PER_RIDE * 2,
    crowd:
      approaching1 && (leg1Timed?.upcomingWaitMin == null || approaching1.minutes <= leg1Timed.upcomingWaitMin)
        ? approaching1.crowd
        : 2,
    line: first,
    boardStation: board,
    transferStation: change,
    alightStation: alight,
    headsign: leg1Timed?.headsign ?? null,
    viaStations: [...via1, ...via2],
    shapeLegs: shapeLegs.length > 0 ? shapeLegs : undefined,
    estimated: !upcoming,
  };
}
