import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GTFS = process.env.GTFS_DIR ?? 'C:/Users/al-ya/AppData/Local/Temp/opencode/gtfs';
const ASSETS = join(ROOT, 'src', 'assets');

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
const ymd = (s) => Number(s);

function toSec(t) {
  const [h, m, s] = t.split(':').map(Number);
  if (![h, m, s].every(Number.isFinite)) return null;
  return h * 3600 + m * 60 + s;
}

function hexColor(v) {
  const clean = (v ?? '').trim().replace(/^#/, '');
  return /^[0-9a-fA-F]{6}$/.test(clean) ? `#${clean.toUpperCase()}` : null;
}

function routeMode(routeType) {
  if (routeType === '0') return 'tram';
  if (routeType === '11') return 'trolley';
  return 'bus';
}

const routes = read('routes.txt');
const trips = read('trips.txt');
const stopTimes = read('stop_times.txt');
const calendar = read('calendar.txt');
let calendarDates = [];
try {
  calendarDates = read('calendar_dates.txt');
} catch {
  calendarDates = [];
}

// --- routes catalog ---
const routeIndex = new Map();
const routesOut = routes.map((r, i) => {
  routeIndex.set(r.route_id, i);
  return {
    id: r.route_id,
    shortName: r.route_short_name,
    longName: (r.route_long_name ?? '').trim(),
    color: hexColor(r.route_color),
    textColor: hexColor(r.route_text_color),
    mode: routeMode(r.route_type),
  };
});

// --- services: weekday mask + date range (synthesize holiday-only services) ---
const serviceIndex = new Map();
const servicesOut = calendar.map((c, i) => {
  serviceIndex.set(c.service_id, i);
  return [
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => (c[d] === '1' ? 1 : 0)),
    ymd(c.start_date),
    ymd(c.end_date),
  ];
});
const tripServiceIds = new Set(trips.map((t) => t.service_id));
for (const sid of tripServiceIds) {
  if (!serviceIndex.has(sid)) {
    serviceIndex.set(sid, servicesOut.length);
    servicesOut.push([[0, 0, 0, 0, 0, 0, 0], 20000101, 20991231]);
  }
}

// --- exceptions: date -> { add, remove } service indexes ---
const exceptions = {};
for (const e of calendarDates) {
  const idx = serviceIndex.get(e.service_id);
  if (idx === undefined) continue;
  const date = ymd(e.date);
  exceptions[date] ??= { add: [], remove: [] };
  if (e.exception_type === '1') exceptions[date].add.push(idx);
  else if (e.exception_type === '2') exceptions[date].remove.push(idx);
}

// --- trips table + headsign dictionary ---
const headsignIndex = new Map();
const headsigns = [];
const headsignOf = (name) => {
  const clean = (name ?? '').trim();
  if (!headsignIndex.has(clean)) {
    headsignIndex.set(clean, headsigns.length);
    headsigns.push(clean);
  }
  return headsignIndex.get(clean);
};
const tripIndex = new Map();
const tripsOut = [];
const tripShapeIds = [];
for (const t of trips) {
  const r = routeIndex.get(t.route_id);
  const s = serviceIndex.get(t.service_id);
  if (r === undefined || s === undefined) continue;
  tripIndex.set(t.trip_id, tripsOut.length);
  tripsOut.push([r, headsignOf(t.trip_headsign), s]);
  tripShapeIds.push(t.shape_id ?? '');
}

// --- per-stop departures: flat [sec0, trip0, delta1, trip1, ...], sorted ---
const deps = {};
let skipped = 0;
for (const st of stopTimes) {
  const ti = tripIndex.get(st.trip_id);
  const sec = toSec(st.departure_time ?? '');
  if (ti === undefined || sec === null) {
    skipped++;
    continue;
  }
  (deps[st.stop_id] ??= []).push([sec, ti]);
}
for (const [stopId, list] of Object.entries(deps)) {
  list.sort((a, b) => a[0] - b[0]);
  const flat = [list[0][0], list[0][1]];
  for (let i = 1; i < list.length; i++) flat.push(list[i][0] - list[i - 1][0], list[i][1]);
  deps[stopId] = flat;
}

// --- shapes: exact bus path per shape_id, downsampled (Douglas-Peucker) ---
function perpendicularKm(px, py, ax, ay, bx, by) {
  // Equirectangular projection around the segment, good enough for city scale.
  const kx = 111.32 * Math.cos(((ay + by) / 2) * (Math.PI / 180));
  const ky = 110.57;
  const dx = (bx - ax) * kx;
  const dy = (by - ay) * ky;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : (((px - ax) * kx * dx + (py - ay) * ky * dy) / len2);
  t = Math.max(0, Math.min(1, t));
  const ex = ax * kx + t * dx - px * kx;
  const ey = ay * ky + t * dy - py * ky;
  return Math.sqrt(ex * ex + ey * ey);
}

function douglasPeucker(points, epsilonKm) {
  if (points.length <= 2) return points;
  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let maxDist = 0;
    let maxIdx = -1;
    for (let i = first + 1; i < last; i++) {
      const d = perpendicularKm(points[i][0], points[i][1], points[first][0], points[first][1], points[last][0], points[last][1]);
      if (d > maxDist) {
        maxDist = d;
        maxIdx = i;
      }
    }
    if (maxDist > epsilonKm && maxIdx !== -1) {
      keep[maxIdx] = true;
      stack.push([first, maxIdx], [maxIdx, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const shapeRows = read('shapes.txt');
const shapeGroups = new Map();
for (const row of shapeRows) {
  const lat = Number(row.shape_pt_lat);
  const lng = Number(row.shape_pt_lon);
  const seq = Number(row.shape_pt_sequence);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(seq)) continue;
  const list = shapeGroups.get(row.shape_id) ?? [];
  list.push([lat, lng, seq]);
  shapeGroups.set(row.shape_id, list);
}
const shapeIds = [...shapeGroups.keys()];
const shapeIndex = new Map(shapeIds.map((id, i) => [id, i]));
const shapesOut = shapeIds.map((id) => {
  const pts = shapeGroups
    .get(id)
    .sort((a, b) => a[2] - b[2])
    .map(([lat, lng]) => [Math.round(lat * 1e5) / 1e5, Math.round(lng * 1e5) / 1e5]);
  return douglasPeucker(pts, 0.008);
});
const tripShapeOut = tripShapeIds.map((id) => shapeIndex.get(id) ?? -1);

// --- our stations coverage ---
let stations = [];
try {
  stations = JSON.parse(readFileSync(join(ASSETS, 'stations.json'), 'utf8'));
} catch {
  stations = [];
}
const covered = stations.filter((s) => deps[s.id] !== undefined).length;

mkdirSync(ASSETS, { recursive: true });
writeFileSync(join(ASSETS, 'routes.json'), `${JSON.stringify(routesOut)}\n`);
writeFileSync(join(ASSETS, 'timetable.json'), `${JSON.stringify({ headsigns, services: servicesOut, exceptions, trips: tripsOut, deps })}\n`);
writeFileSync(join(ASSETS, 'shapes.json'), `${JSON.stringify({ ids: shapeIds, coords: shapesOut, trips: tripShapeOut })}\n`);

const bytes = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`routes: ${routesOut.length} (colored: ${routesOut.filter((r) => r.color).length})`);
console.log(`trips: ${tripsOut.length}, departures: ${Object.values(deps).reduce((n, l) => n + l.length / 2, 0)}, stops: ${Object.keys(deps).length} (skipped rows: ${skipped})`);
console.log(`shapes: ${shapeIds.length} (points kept: ${shapesOut.reduce((n, c) => n + c.length, 0)})`);
console.log(`our stations with schedule: ${covered}/${stations.length}`);
console.log(`routes.json: ${bytes(readFileSync(join(ASSETS, 'routes.json')).length)}`);
console.log(`timetable.json: ${bytes(readFileSync(join(ASSETS, 'timetable.json')).length)}`);
console.log(`shapes.json: ${bytes(readFileSync(join(ASSETS, 'shapes.json')).length)}`);
