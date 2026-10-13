import { useEffect, useMemo, useState } from 'react';
import { getTripShapeSlice } from '../../services/repositories/gtfs/shapes';
import { haversineKm, type LatLng } from '../map';
import type { TransitOption } from './transit';

export interface RoutePolylineSegment {
  id: string;
  kind: 'walk' | 'transit';
  line?: string;
  color: string;
  coordinates: LatLng[];
  /** Exact GTFS shape path — no router enrichment needed. */
  exact?: boolean;
}

const osrmCache = new Map<string, LatLng[]>();

/** Decodes a Valhalla/OSRM polyline (precision 6) into coordinates. */
export function decodePolyline6(shape: string): LatLng[] {
  const out: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  function decodeNumber(): number {
    let shift = 0;
    let result = 0;
    for (;;) {
      const b = shape.charCodeAt(index) - 63;
      index += 1;
      result |= (b & 0x1f) << shift;
      shift += 5;
      if (b < 0x20) break;
    }
    return (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
  }
  while (index < shape.length) {
    lat += decodeNumber();
    lng += decodeNumber();
    out.push({ lat: lat / 1e6, lng: lng / 1e6 });
  }
  return out;
}

/** Haversine distance in meters. */
function haversineM(a: LatLng, b: LatLng): number {
  return haversineKm(a, b) * 1000;
}

/**
 * Forces the routed path to touch the exact requested endpoints. Routers snap
 * to the road graph, so without this the drawn line starts/ends meters away
 * from the pins and looks wrong.
 */
function pinEndpoints(path: LatLng[], points: LatLng[]): LatLng[] {
  if (path.length === 0) return [...points];
  const start = points[0];
  const end = points[points.length - 1];
  const out = [...path];
  if (haversineM(out[0], start) > 10) out.unshift(start);
  else out[0] = start;
  const last = out[out.length - 1];
  if (haversineM(last, end) > 10) out.push(end);
  else out[out.length - 1] = end;
  return out;
}

function resolveCampusPedestrianCorridor(from: LatLng, to: LatLng): LatLng[] | null {
  const inCampus = (p: LatLng) =>
    p.lat >= 45.7450 && p.lat <= 45.7515 && p.lng >= 21.2350 && p.lng <= 21.2440;
  if (!inCampus(from) || !inCampus(to)) return null;

  if (from.lat >= 45.7485 && from.lng >= 21.2405 && to.lat <= 45.7475) {
    return [
      from,
      { lat: 45.74880, lng: 21.24140 },
      { lat: 45.74858, lng: 21.24118 },
      { lat: 45.74842, lng: 21.24049 },
      { lat: 45.74814, lng: 21.23989 },
      { lat: 45.74783, lng: 21.23963 },
      { lat: 45.74736, lng: 21.24006 },
      { lat: 45.74704, lng: 21.24025 },
      { lat: 45.74682, lng: 21.24038 },
      to,
    ];
  }

  if (to.lat >= 45.7485 && to.lng >= 21.2405 && from.lat <= 45.7475) {
    return [
      from,
      { lat: 45.74682, lng: 21.24038 },
      { lat: 45.74704, lng: 21.24025 },
      { lat: 45.74736, lng: 21.24006 },
      { lat: 45.74783, lng: 21.23963 },
      { lat: 45.74814, lng: 21.23989 },
      { lat: 45.74842, lng: 21.24049 },
      { lat: 45.74858, lng: 21.24118 },
      { lat: 45.74880, lng: 21.24140 },
      to,
    ];
  }

  return null;
}

export async function fetchOsrmGeometry(
  points: LatLng[],
  mode: 'walking' | 'driving',
  timeoutMs = 6000,
): Promise<LatLng[] | null> {
  if (points.length < 2) return null;
  if (mode === 'walking' && points.length === 2) {
    if (haversineKm(points[0], points[1]) > 4) return [points[0], points[1]];
    const campus = resolveCampusPedestrianCorridor(points[0], points[1]);
    if (campus) return campus;
  }
  const key = `${mode}:${points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join(';')}`;
  const cached = osrmCache.get(key);
  if (cached) return cached;

  const coordsStr = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/${mode}/${coordsStr}?overview=full&geometries=geojson`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const rawCoords = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
    const distance = data?.routes?.[0]?.distance as number | undefined;
    if (!rawCoords || !Array.isArray(rawCoords) || rawCoords.length === 0) return null;
    if (mode === 'walking' && typeof distance === 'number' && points.length === 2) {
      // Pedestrian detours (fences, railways, parks) are often longer than a
      // driver's; only reject clearly absurd snaps.
      const directKm = haversineKm(points[0], points[1]);
      if (directKm > 0.05 && distance > directKm * 1000 * 2.0) return null;
    }
    const resolved = pinEndpoints(
      rawCoords.map(([lng, lat]) => ({ lat, lng })),
      points,
    );
    osrmCache.set(key, resolved);
    return resolved;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Pedestrian fallback when OSRM is unreachable or rejects the route:
 * Valhalla (FOSSGIS public server) follows footpaths, stairs and squares
 * that the car-oriented graph sometimes misses.
 */
export async function fetchValhallaWalking(points: LatLng[], timeoutMs = 8000): Promise<LatLng[] | null> {
  if (points.length < 2) return null;
  const key = `valhalla:${points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join(';')}`;
  const cached = osrmCache.get(key);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('https://valhalla1.openstreetmap.de/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: points.map((p) => ({ lat: p.lat, lon: p.lng })),
        costing: 'pedestrian',
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const shape = data?.trip?.legs?.[0]?.shape as string | undefined;
    if (typeof shape !== 'string' || shape.length === 0) return null;
    const decoded = decodePolyline6(shape);
    if (decoded.length < 2) return null;
    const resolved = pinEndpoints(decoded, points);
    osrmCache.set(key, resolved);
    return resolved;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/** Walking geometry: campus shortcut → OSRM → Valhalla → straight line. */
export async function fetchWalkingGeometry(points: LatLng[]): Promise<LatLng[]> {
  if (points.length < 2) return [...points];
  if (points.length === 2) {
    if (haversineKm(points[0], points[1]) > 4) return [points[0], points[1]];
    const campus = resolveCampusPedestrianCorridor(points[0], points[1]);
    if (campus) return campus;
  }
  const viaOsrm = await fetchOsrmGeometry(points, 'walking');
  if (viaOsrm && viaOsrm.length >= 2) return viaOsrm;
  const viaValhalla = await fetchValhallaWalking(points);
  if (viaValhalla && viaValhalla.length >= 2) return viaValhalla;
  return [...points];
}

function buildFallbackSegments(
  startPoint: LatLng | null,
  chosen: TransitOption | null,
  endPoint: LatLng | null,
): RoutePolylineSegment[] {
  if (!chosen) return [];
  const list: RoutePolylineSegment[] = [];

  if (startPoint) {
    list.push({
      id: 'walk-start',
      kind: 'walk',
      color: '#3B82F6',
      coordinates: [startPoint, chosen.boardStation],
    });
  }

  // Transit legs use the exact GTFS shape path when available (the same
  // geometry Google Maps draws) — no car-router approximation. Otherwise they
  // follow the real trip path through intermediate stations.
  const via = chosen.viaStations ?? [];
  const transferIdx = chosen.transferStation ? via.findIndex((s) => s.id === chosen.transferStation?.id) : -1;
  const firstVia = transferIdx >= 0 ? via.slice(0, transferIdx) : via;
  const secondVia = transferIdx >= 0 ? via.slice(transferIdx + 1) : [];

  function transitCoords(
    shape: { tripIdx: number; boardId: string; alightId: string } | undefined,
    from: LatLng,
    waypoints: LatLng[],
    to: LatLng,
    anchorStations?: { id: string; lat: number; lng: number }[],
  ): { coordinates: LatLng[]; exact: boolean } {
    if (shape && anchorStations && anchorStations.length >= 2) {
      const slice = getTripShapeSlice(shape.tripIdx, anchorStations);
      if (slice) return { coordinates: pinEndpoints(slice, [from, to]), exact: true };
    }
    return { coordinates: [from, ...waypoints, to], exact: false };
  }

  if (chosen.transferStation) {
    const first = transitCoords(
      chosen.shapeLegs?.[0],
      chosen.boardStation,
      firstVia,
      chosen.transferStation,
      [chosen.boardStation, ...firstVia, chosen.transferStation],
    );
    list.push({
      id: `transit-1-${chosen.line}`,
      kind: 'transit',
      line: chosen.legs.find((l) => l.kind === 'ride')?.line ?? chosen.line,
      color: '#2563EB',
      coordinates: first.coordinates,
      exact: first.exact,
    });
    const secondLeg = chosen.legs.filter((l) => l.kind === 'ride')[1];
    const second = transitCoords(
      chosen.shapeLegs?.[1],
      chosen.transferStation,
      secondVia,
      chosen.alightStation,
      [chosen.transferStation, ...secondVia, chosen.alightStation],
    );
    list.push({
      id: `transit-2-${secondLeg?.line ?? 'next'}`,
      kind: 'transit',
      line: secondLeg?.line ?? undefined,
      color: '#059669',
      coordinates: second.coordinates,
      exact: second.exact,
    });
  } else {
    const single = transitCoords(
      chosen.shapeLegs?.[0],
      chosen.boardStation,
      via,
      chosen.alightStation,
      [chosen.boardStation, ...via, chosen.alightStation],
    );
    list.push({
      id: `transit-${chosen.line}`,
      kind: 'transit',
      line: chosen.line,
      color: '#2563EB',
      coordinates: single.coordinates,
      exact: single.exact,
    });
  }

  if (endPoint) {
    list.push({
      id: 'walk-end',
      kind: 'walk',
      color: '#3B82F6',
      coordinates: [chosen.alightStation, endPoint],
    });
  }

  return list;
}

export function useRouteGeometry(
  startPoint: LatLng | null,
  chosen: TransitOption | null,
  endPoint: LatLng | null,
): { segments: RoutePolylineSegment[]; allCoordinates: LatLng[] } {
  const startKey = startPoint ? `${startPoint.lat.toFixed(5)},${startPoint.lng.toFixed(5)}` : '';
  const endKey = endPoint ? `${endPoint.lat.toFixed(5)},${endPoint.lng.toFixed(5)}` : '';
  const chosenKey = chosen ? `${chosen.id}:${chosen.totalMin}` : '';

  const fallback = useMemo(
    () => buildFallbackSegments(startPoint, chosen, endPoint),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startKey, chosenKey, endKey],
  );
  const [segments, setSegments] = useState<RoutePolylineSegment[]>(fallback);

  useEffect(() => {
    setSegments(fallback);
    if (!chosen) return;
    let cancelled = false;

    async function enrich() {
      const enriched = await Promise.all(
        fallback.map(async (seg) => {
          if (seg.kind === 'walk') {
            const walkCoords = await fetchWalkingGeometry(seg.coordinates);
            if (cancelled || walkCoords.length < 2) return seg;
            return { ...seg, coordinates: walkCoords };
          }
          // Exact GTFS shapes are already the real bus path — never routerize.
          if (seg.exact) return seg;
          const roadCoords = await fetchOsrmGeometry(seg.coordinates, 'driving', 8000);
          if (cancelled || !roadCoords || roadCoords.length < 2) return seg;
          // Loop guard: a car-router U-turn (e.g. divided boulevards) draws a
          // spike; keep the waypoint path instead of an absurd detour.
          if (seg.coordinates.length >= 2) {
            const from = seg.coordinates[0];
            const to = seg.coordinates[seg.coordinates.length - 1];
            const beelineKm = haversineKm(from, to);
            if (beelineKm > 0.2) {
              let pathKm = 0;
              for (let i = 1; i < roadCoords.length; i++) {
                pathKm += haversineKm(roadCoords[i - 1], roadCoords[i]);
              }
              if (pathKm > beelineKm * 2.5) return seg;
            }
          }
          return { ...seg, coordinates: roadCoords };
        }),
      );
      if (!cancelled) setSegments(enriched);
    }

    void enrich();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback, chosenKey]);

  const allCoordinates = useMemo(() => {
    const acc: LatLng[] = [];
    if (startPoint) acc.push(startPoint);
    for (const seg of segments) acc.push(...seg.coordinates);
    if (endPoint) acc.push(endPoint);
    return acc;
  }, [startPoint, segments, endPoint]);

  return { segments, allCoordinates };
}
