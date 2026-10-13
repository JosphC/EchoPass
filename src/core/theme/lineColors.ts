/** Fallback route colors until GTFS route_color exists: stable per line. */
const PALETTE = ['#7C3AED', '#EA580C', '#16A34A', '#2563EB', '#DC2626', '#0891B2', '#CA8A04', '#DB2777'];

export function lineColor(shortName: string): string {
  let hash = 0;
  for (let i = 0; i < shortName.length; i++) {
    hash = (hash * 31 + shortName.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length] as string;
}
