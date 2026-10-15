import type { LatLng } from '../../../features/map/arrivals';
import { distKm, loadShapes, projectOntoShape, type Projection } from './shapes';
import { getTripHeadsign, getTripRouteShortName } from './timetable';

const lineShapes = new Map<string, number[]>();
const cumKmCache = new Map<number, number[]>();

/** Headsigns differ in diacritics/punctuation between STPT live and GTFS. */
export function normalizeHeadsign(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** All shape variants a line runs toward a headsign (index built once). */
function shapesFor(line: string, headsign: string): number[] {
  if (lineShapes.size === 0) {
    loadShapes().trips.forEach((shapeIdx, tripIdx) => {
      if (shapeIdx < 0) return;
      const key = `${getTripRouteShortName(tripIdx)}|${normalizeHeadsign(getTripHeadsign(tripIdx))}`;
      const list = lineShapes.get(key) ?? [];
      if (!list.includes(shapeIdx)) list.push(shapeIdx);
      lineShapes.set(key, list);
    });
  }
  return lineShapes.get(`${line}|${normalizeHeadsign(headsign)}`) ?? [];
}

/** Cumulative km at every shape vertex. */
function cumulativeKm(shapeIdx: number): number[] {
  const hit = cumKmCache.get(shapeIdx);
  if (hit) return hit;
  const pts = loadShapes().coords[shapeIdx];
  const out = [0];
  for (let i = 1; i < pts.length; i++) {
    out.push(out[i - 1] + distKm(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]));
  }
  cumKmCache.set(shapeIdx, out);
  return out;
}

/** Closest point of the whole shape (a vehicle can be anywhere along it). */
function nearestOnShape(pts: [number, number][], coord: LatLng): Projection | null {
  let best: Projection | null = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const proj = projectOntoShape(pts.slice(i, i + 2), coord, 0, 0);
    if (proj && (!best || proj.distKm < best.distKm)) best = { ...proj, segIdx: i };
  }
  return best;
}

function kmAt(cum: number[], pts: [number, number][], p: Projection): number {
  const [aLat, aLng] = pts[p.segIdx];
  return cum[p.segIdx] + distKm(aLat, aLng, p.point.lat, p.point.lng);
}

/**
 * Distance a vehicle of `line` heading to `headsign` still drives along its
 * GTFS shape until `stop`. `'behind'` = it already passed the stop or runs
 * the other way; `null` = no matching shape (caller falls back).
 */
export function distanceAlongRouteKm(
  line: string,
  headsign: string,
  vehicle: LatLng,
  stop: LatLng,
): number | 'behind' | null {
  const asset = loadShapes();
  let best: number | null = null;
  let snapped = false;
  for (const shapeIdx of shapesFor(line, headsign)) {
    const pts = asset.coords[shapeIdx];
    const from = pts && pts.length >= 2 ? nearestOnShape(pts, vehicle) : null;
    if (!from) continue;
    snapped = true;
    const to = projectOntoShape(pts, stop, from.segIdx, from.t);
    if (!to) continue;
    const cum = cumulativeKm(shapeIdx);
    const km = Math.max(0, kmAt(cum, pts, to) - kmAt(cum, pts, from));
    if (best === null || km < best) best = km;
  }
  if (best !== null) return best;
  return snapped ? 'behind' : null;
}

/** A vehicle farther than this from its shape is off-route: no arrow. */
const BEARING_SNAP_KM = 0.08;

/**
 * Travel direction (degrees clockwise from north) of a vehicle of `line`
 * heading to `headsign`: the bearing of the closest shape segment, so the
 * map arrow follows the street even when GPS jitters.
 */
export function bearingOnRoute(line: string, headsign: string, vehicle: LatLng): number | null {
  const asset = loadShapes();
  let best: { proj: Projection; pts: [number, number][] } | null = null;
  for (const shapeIdx of shapesFor(line, headsign)) {
    const pts = asset.coords[shapeIdx];
    const proj = pts && pts.length >= 2 ? nearestOnShape(pts, vehicle) : null;
    if (proj && proj.distKm <= BEARING_SNAP_KM && (!best || proj.distKm < best.proj.distKm)) {
      best = { proj, pts };
    }
  }
  if (!best) return null;
  const [aLat, aLng] = best.pts[best.proj.segIdx];
  const [bLat, bLng] = best.pts[best.proj.segIdx + 1];
  const dx = (bLng - aLng) * Math.cos((((aLat + bLat) / 2) * Math.PI) / 180);
  const deg = (Math.atan2(dx, bLat - aLat) * 180) / Math.PI;
  return Math.round((deg + 360) % 360);
}
