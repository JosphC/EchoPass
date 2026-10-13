import type { LatLng } from '../../../features/map/arrivals';

interface ShapesAsset {
  ids: string[];
  coords: [number, number][][];
  trips: number[];
}

export interface ShapeAnchor {
  id: string;
  lat: number;
  lng: number;
}

let cached: ShapesAsset | null = null;
const sliceCache = new Map<string, LatLng[]>();

function loadShapes(): ShapesAsset {
  if (!cached) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('../../../assets/shapes.json') as ShapesAsset;
  }
  return cached;
}

function distKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const p1 = (aLat * Math.PI) / 180;
  const p2 = (bLat * Math.PI) / 180;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Max distance between a station and the shape path (data mismatch guard). */
const SNAP_KM = 0.15;

interface Projection {
  segIdx: number;
  /** Position along the segment, 0..1. */
  t: number;
  point: LatLng;
  distKm: number;
}

/** Orthogonal projection of a stop onto every shape segment; earliest wins. */
function projectOntoShape(
  pts: [number, number][],
  coord: LatLng,
  fromSegIdx: number,
  fromT: number,
): Projection | null {
  for (let i = fromSegIdx; i < pts.length - 1; i++) {
    const ax = pts[i][0];
    const ay = pts[i][1];
    const bx = pts[i + 1][0];
    const by = pts[i + 1][1];
    // Equirectangular kilometers around the segment.
    const kx = 111.32 * Math.cos((((ax + bx) / 2) * Math.PI) / 180);
    const ky = 110.57;
    const dx = (bx - ax) * kx;
    const dy = (by - ay) * ky;
    const len2 = dx * dx + dy * dy;
    const t =
      len2 === 0
        ? 0
        : Math.max(0, Math.min(1, (((coord.lat - ax) * kx * dx + (coord.lng - ay) * ky * dy) / len2)));
    // Same segment as the previous stop: must move forward along it.
    if (i === fromSegIdx && t < fromT) continue;
    const plat = ax + (t * dx) / kx;
    const plng = ay + (t * dy) / ky;
    const d = distKm(plat, plng, coord.lat, coord.lng);
    if (d <= SNAP_KM) return { segIdx: i, t, point: { lat: plat, lng: plng }, distKm: d };
  }
  return null;
}

export interface AnchorMatch {
  anchor: ShapeAnchor;
  segIdx: number;
  point: LatLng;
  distKm: number;
}

export interface ShapeMatchResult {
  /** Matched anchors in order; slice assembly uses first/last. */
  matches: AnchorMatch[];
  /** Index of the first anchor that failed to match (-1 when all matched). */
  failIndex: number;
  shapePoints: number;
}

/**
 * Greedy forward matching of ordered stops onto the trip shape.
 * Exposed for diagnostics; getTripShapeSlice is the drawing entry point.
 */
export function matchShapeAnchors(tripIdx: number, anchors: ShapeAnchor[]): ShapeMatchResult | null {
  const asset = loadShapes();
  const shapeIdx = asset.trips[tripIdx];
  const pts = shapeIdx !== undefined && shapeIdx >= 0 ? asset.coords[shapeIdx] : undefined;
  if (!pts || pts.length < 2) return null;

  const matches: AnchorMatch[] = [];
  let cursorSeg = 0;
  let cursorT = 0;
  let firstAnchor = true;
  for (let a = 0; a < anchors.length; a++) {
    const proj = projectOntoShape(pts, anchors[a], cursorSeg, firstAnchor ? 0 : cursorT);
    if (!proj) return { matches, failIndex: a, shapePoints: pts.length };
    matches.push({ anchor: anchors[a], segIdx: proj.segIdx, point: proj.point, distKm: proj.distKm });
    cursorSeg = proj.segIdx;
    cursorT = proj.t;
    firstAnchor = false;
  }
  return { matches, failIndex: -1, shapePoints: pts.length };
}

/**
 * Exact GTFS shape slice through ordered stops (board, intermediates, alight),
 * in travel direction. Stops match the FIRST shape pass in order — for transit
 * that is semantically the arrival that matters, and a slice ending at the
 * first approach of the alighting stop can never overshoot past it and come
 * back (the spike defect).
 */
export function getTripShapeSlice(tripIdx: number, anchors: ShapeAnchor[]): LatLng[] | null {
  if (anchors.length < 2) return null;
  const cacheKey = `${tripIdx}:${anchors.map((a) => a.id).join('>')}`;
  const hit = sliceCache.get(cacheKey);
  if (hit) return hit;

  const matched = matchShapeAnchors(tripIdx, anchors);
  if (!matched || matched.failIndex !== -1) return null;

  const asset = loadShapes();
  const pts = asset.coords[asset.trips[tripIdx]];
  const first = matched.matches[0];
  const last = matched.matches[matched.matches.length - 1];
  if (last.segIdx < first.segIdx) return null;
  const slice: LatLng[] = [{ ...first.point }];
  for (let i = first.segIdx + 1; i <= last.segIdx; i++) {
    slice.push({ lat: pts[i][0], lng: pts[i][1] });
  }
  slice.push({ ...last.point });
  if (slice.length < 2) return null;

  sliceCache.set(cacheKey, slice);
  return slice;
}

/** Shape id (e.g. "E2.1_T") of a trip, for diagnostics. */
export function getTripShapeId(tripIdx: number): string | null {
  const asset = loadShapes();
  const shapeIdx = asset.trips[tripIdx];
  if (shapeIdx === undefined || shapeIdx < 0) return null;
  return asset.ids[shapeIdx] ?? null;
}
