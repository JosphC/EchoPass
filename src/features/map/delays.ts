import type { BusMarker } from './hooks/useLiveMap';
import type { Report, ReportKind } from '../../services/api/schemas/report';

export type DelayCause = ReportKind | 'unknown';

export interface DelayInfo {
  busId: string;
  line: string;
  destination: string;
  cause: DelayCause;
  reportId: string | null;
  confirmations: number;
}

/** GPS older than this means the vehicle is not really tracked anymore. */
export const STALE_VEHICLE_MS = 5 * 60_000;
const MAX_ALERTS = 3;

/**
 * Waze-style delay detection from data we actually have:
 * - a live traveler report on the same line → that cause (most confirmed wins);
 * - a vehicle whose GPS went stale → unknown cause, still worth flagging.
 * Expired reports never trigger alerts.
 */
export function detectDelays(markers: BusMarker[], reports: Report[], nowMs: number): DelayInfo[] {
  const live = reports.filter((r) => new Date(r.expiresAt).getTime() > nowMs);
  const out: DelayInfo[] = [];

  for (const marker of markers) {
    if (!marker.position) continue;
    const ageMs = nowMs - new Date(marker.position.updatedAt).getTime();
    if (ageMs <= STALE_VEHICLE_MS) {
      const matching = live
        .filter((r) => r.line === marker.bus.line)
        .sort((a, b) => b.confirmations - a.confirmations)[0];
      if (!matching) continue;
      if (out.some((d) => d.line === marker.bus.line)) continue;
      out.push({
        busId: marker.bus.id,
        line: marker.bus.line,
        destination: marker.bus.destination,
        cause: matching.kind,
        reportId: matching.id,
        confirmations: matching.confirmations,
      });
    } else {
      if (out.some((d) => d.line === marker.bus.line)) continue;
      out.push({
        busId: marker.bus.id,
        line: marker.bus.line,
        destination: marker.bus.destination,
        cause: 'unknown',
        reportId: null,
        confirmations: 0,
      });
    }
    if (out.length >= MAX_ALERTS) break;
  }
  return out;
}
