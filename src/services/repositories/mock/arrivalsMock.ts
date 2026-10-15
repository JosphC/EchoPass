import { arrivalSchema, arrivalsQuerySchema, type Arrival, type Route } from '../../api/schemas/arrival';
import { etaToStationMin } from '../../../features/map/arrivals';
import { loadStations } from '../../../features/map/stations';
import type { BusRepo, StopArrivalsRepo } from '../types';
import { normalizeHeadsign } from '../gtfs/routeProgress';
import { findRoute, getScheduledDepartures, type ScheduledDeparture } from '../gtfs/timetable';
import { createBusMock } from './busMock';

/** A live prediction this far from a timetable slot is a different trip. */
const MATCH_WINDOW_MS = 20 * 60_000;
/** Positions older than this are a parked/lost vehicle, not a live arrival. */
const STALE_POSITION_MS = 3 * 60_000;

function routeOf(line: string, catalog?: ScheduledDeparture['route'] | null): Route {
  const r = catalog ?? findRoute(line);
  return {
    id: r?.id ?? line,
    shortName: line,
    ...(r?.color ? { color: r.color } : {}),
    ...(r?.textColor ? { textColor: r.textColor } : {}),
    ...(r?.mode ? { mode: r.mode } : {}),
  };
}

/** Closest unused timetable slot of the same line and direction (Google-style merge). */
function matchSlot(
  slots: ScheduledDeparture[],
  used: Set<string>,
  line: string,
  headsign: string,
  predictedMs: number,
): ScheduledDeparture | null {
  const wanted = normalizeHeadsign(headsign);
  let best: ScheduledDeparture | null = null;
  for (const d of slots) {
    if (used.has(d.tripKey) || d.route.shortName !== line || normalizeHeadsign(d.headsign) !== wanted) continue;
    const diff = Math.abs(d.timeMs - predictedMs);
    if (diff <= MATCH_WINDOW_MS && (!best || diff < Math.abs(best.timeMs - predictedMs))) best = d;
  }
  return best;
}

/**
 * Google Maps never hides a line: the next departure of every line+direction
 * is kept even when frequent lines would fill the page, the rest fills up to
 * `limit` by time.
 */
export function pickBoard(sorted: Arrival[], limit: number): Arrival[] {
  const seen = new Set<string>();
  const picked = new Set<Arrival>();
  for (const a of sorted) {
    const key = `${a.route.shortName}|${normalizeHeadsign(a.headsign)}`;
    if (!seen.has(key)) {
      seen.add(key);
      picked.add(a);
    }
  }
  for (const a of sorted) {
    if (picked.size >= limit) break;
    picked.add(a);
  }
  return sorted.filter((a) => picked.has(a));
}

/**
 * Stop arrivals like Google Maps: every live vehicle heading to the stop
 * (from the bus repo — STPT live or mock) replaces its timetable slot with a
 * realtime row; slots without a vehicle stay as scheduled rows.
 */
export function createArrivalsMock(bus: BusRepo = createBusMock()): StopArrivalsRepo {
  return {
    getArrivals: async (stopId, query, nowMs = Date.now()) => {
      const { limit, windowMin } = arrivalsQuerySchema.parse(query);
      const station = loadStations().find((s) => s.id === stopId);
      if (!station) return [];
      const [buses, positions] = await Promise.all([bus.getBuses(), bus.getPositions()]);
      const byId = new Map(positions.map((p) => [p.busId, p]));
      const cutoff = nowMs + windowMin * 60_000;
      const slots = getScheduledDepartures(stopId, nowMs - MATCH_WINDOW_MS, windowMin + 40, 200);
      const used = new Set<string>();
      const live: Arrival[] = [];
      for (const b of buses) {
        const position = byId.get(b.id);
        if (!position || !station.lines.includes(b.line)) continue;
        if (nowMs - new Date(position.updatedAt).getTime() > STALE_POSITION_MS) continue;
        const eta = etaToStationMin({ bus: b, position }, station);
        if (eta === null) continue;
        const predictedMs = nowMs + eta * 60_000;
        if (predictedMs > cutoff) continue;
        const slot = matchSlot(slots, used, b.line, b.destination, predictedMs);
        if (slot) used.add(slot.tripKey);
        const lateMin = slot ? Math.round((predictedMs - slot.timeMs) / 60_000) : b.delayMin;
        live.push(
          arrivalSchema.parse({
            tripId: `${b.id}@${station.id}`,
            route: routeOf(b.line, slot?.route),
            headsign: slot?.headsign ?? b.destination,
            scheduledTime: slot ? new Date(slot.timeMs).toISOString() : null,
            predictedTime: new Date(predictedMs).toISOString(),
            isRealtime: true,
            delayMin: Math.max(0, lateMin),
            busId: b.id,
          }),
        );
      }
      const scheduled: Arrival[] = slots
        .filter((d) => !used.has(d.tripKey) && d.timeMs >= nowMs && d.timeMs <= cutoff)
        .map((d) =>
          arrivalSchema.parse({
            tripId: `sched-${d.tripKey}`,
            route: routeOf(d.route.shortName, d.route),
            headsign: d.headsign,
            scheduledTime: new Date(d.timeMs).toISOString(),
            predictedTime: null,
            isRealtime: false,
          }),
        );
      const timeOf = (a: Arrival) => new Date((a.predictedTime ?? a.scheduledTime) as string).getTime();
      return pickBoard([...live, ...scheduled].sort((a, b) => timeOf(a) - timeOf(b)), limit);
    },
  };
}
