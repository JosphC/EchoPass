import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GTFS = process.env.GTFS_DIR ?? 'C:/Users/al-ya/AppData/Local/Temp/opencode/smtt';
const OUT = join(ROOT, 'src', 'assets', 'stations.json');

/** Minimal CSV parser handling quoted fields with commas. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  const [header, ...body] = rows;
  return body.filter((r) => r.length === header.length).map((r) => Object.fromEntries(r.map((v, i) => [header[i], v])));
}

const read = (name) => parseCsv(readFileSync(join(GTFS, name), 'utf8'));

const stops = read('stops.txt');
const routes = read('routes.txt');
const trips = read('trips.txt');
const stopTimes = read('stop_times.txt');

const routeById = new Map(routes.map((r) => [r.route_id, r]));
const tripRoute = new Map(trips.map((t) => [t.trip_id, t.route_id]));
const stopLines = new Map();
for (const st of stopTimes) {
  const routeId = tripRoute.get(st.trip_id);
  const route = routeById.get(routeId);
  if (!route) continue;
  if (!stopLines.has(st.stop_id)) stopLines.set(st.stop_id, new Set());
  stopLines.get(st.stop_id).add(route.route_short_name);
}

const stations = stops
  .filter((s) => s.location_type === '0' && stopLines.has(s.stop_id))
  .map((s) => ({
    id: s.stop_id,
    name: s.stop_name.replace(/^"|"$/g, ''),
    lat: Number(s.stop_lat),
    lng: Number(s.stop_lon),
    lines: [...stopLines.get(s.stop_id)].sort(),
  }))
  .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng) && s.lines.length > 0);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(stations)}\n`);
console.log(`stations: ${stations.length} (from ${stops.length} stops) -> ${OUT}`);
