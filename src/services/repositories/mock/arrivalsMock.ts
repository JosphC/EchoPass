import { arrivalSchema, arrivalsQuerySchema, type Arrival, type ArrivalsQuery } from '../../api/schemas/arrival';
import { haversineKm } from '../../../features/map/arrivals';
import { loadStations } from '../../../features/map/stations';
import type { StopArrivalsRepo } from '../types';
import { findRoute, getScheduledDepartures } from '../gtfs/timetable';
import { seedBuses, seedPositions } from './seed';

const BUS_KMH = 18;
const MATCH_WINDOW_MS = 20 * 60_000;

/** Scheduled trip of the same line closest to the live prediction, if any. */
function matchScheduled(stopId: string, line: string, predictedMs: number): number | null {
  const cands = getScheduledDepartures(stopId, predictedMs - 30 * 60_000, 60, 50).filter(
    (d) => d.route.shortName === line,
  );
  let best: number | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const d of cands) {
    const diff = Math.abs(d.timeMs - predictedMs);
    if (diff <= MATCH_WINDOW_MS && diff < bestDiff) {
      best = d.timeMs;
      bestDiff = diff;
    }
  }
  return best;
}

/** Fake arrivals: live mock positions merged with static GTFS schedules.
 *  Lines without a live bus still show scheduled rows (never marked live). */
export function createArrivalsMock(): StopArrivalsRepo {
  return {
    getArrivals: async (stopId: string, query: ArrivalsQuery, nowMs: number = Date.now()) => {
      const { limit, windowMin } = arrivalsQuerySchema.parse(query);
      const station = loadStations().find((s) => s.id === stopId);
      if (!station) return [];
      const byId = new Map(seedPositions.map((p) => [p.busId, p]));
      const live: Arrival[] = [];
      for (const bus of seedBuses) {
        if (!station.lines.includes(bus.line)) continue;
        const pos = byId.get(bus.id);
        if (!pos) continue;
        const speed = Math.max(pos.speedKmh ?? BUS_KMH, 1);
        const waitMin = Math.max(0, Math.round((haversineKm(pos, station) / speed) * 60));
        const catalog = findRoute(bus.line);
        const predictedMs = nowMs + waitMin * 60_000;
        const scheduledMs = matchScheduled(stopId, bus.line, predictedMs);
        live.push(
          arrivalSchema.parse({
            tripId: `${bus.id}@${station.id}`,
            route: {
              id: catalog?.id ?? bus.line,
              shortName: bus.line,
              ...(catalog?.color ? { color: catalog.color } : {}),
              ...(catalog?.textColor ? { textColor: catalog.textColor } : {}),
              ...(catalog?.mode ? { mode: catalog.mode } : {}),
            },
            headsign: bus.destination,
            scheduledTime: scheduledMs === null ? null : new Date(scheduledMs).toISOString(),
            predictedTime: new Date(predictedMs).toISOString(),
            isRealtime: true,
            delayMin: bus.delayMin,
            busId: bus.id,
          }),
        );
      }
      const cutoff = nowMs + windowMin * 60_000;
      const liveInWindow = live.filter(
        (a) => new Date(a.predictedTime as string).getTime() <= cutoff,
      );
      const scheduled: Arrival[] = getScheduledDepartures(stopId, nowMs, windowMin, limit).map((d) =>
        arrivalSchema.parse({
          tripId: `sched-${d.tripKey}`,
          route: {
            id: d.route.id,
            shortName: d.route.shortName,
            ...(d.route.color ? { color: d.route.color } : {}),
            ...(d.route.textColor ? { textColor: d.route.textColor } : {}),
            mode: d.route.mode,
          },
          headsign: d.headsign,
          scheduledTime: new Date(d.timeMs).toISOString(),
          predictedTime: null,
          isRealtime: false,
        }),
      );
      const timeOf = (a: Arrival) => new Date((a.predictedTime ?? a.scheduledTime) as string).getTime();
      return [...liveInWindow, ...scheduled].sort((a, b) => timeOf(a) - timeOf(b)).slice(0, limit);
    },
  };
}
