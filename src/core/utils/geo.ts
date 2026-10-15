export interface LatLng {
  lat: number;
  lng: number;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const aa = s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2;
  return 2 * 6371 * Math.asin(Math.sqrt(aa));
}

/** Ground meters covered by one screen pixel (512-px MapLibre tiles). */
export function metersPerPixel(zoom: number, lat: number): number {
  return (40075016.686 * Math.cos((lat * Math.PI) / 180)) / (512 * 2 ** zoom);
}

/**
 * Evenly spaced points along a polyline, every `stepM` meters, starting at
 * the first vertex and always ending on the last one (dotted-path rendering).
 */
export function pointsAlong(path: LatLng[], stepM: number): LatLng[] {
  if (path.length === 0 || stepM <= 0) return [...path];
  const out: LatLng[] = [path[0]];
  let carry = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const segM = haversineKm(a, b) * 1000;
    let at = stepM - carry;
    while (at <= segM) {
      const t = at / segM;
      out.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });
      at += stepM;
    }
    carry = segM - (at - stepM);
  }
  // End exactly on the last vertex: snap a point that is already close,
  // otherwise append one (no tiny half-gap at the end).
  const last = path[path.length - 1];
  if (out.length > 1 && haversineKm(out[out.length - 1], last) * 1000 <= stepM * 0.4) out[out.length - 1] = last;
  else if (out[out.length - 1] !== last) out.push(last);
  return out;
}
