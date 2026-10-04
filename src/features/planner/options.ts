import type { Bus, CrowdLevel } from '../../services/api/schemas/bus';

export type RouteFilter = 'fastest' | 'cheapest' | 'roomiest';

export interface RouteStep {
  kind: 'walk' | 'ride';
  line: string;
  minutes: number;
  to: string;
}

export interface RouteOption {
  id: string;
  line: string;
  durationMin: number;
  fareRon: number;
  crowd: CrowdLevel;
  steps: RouteStep[];
}

export function buildRouteOptions(from: string, to: string, buses: Bus[]): RouteOption[] {
  if (!from || !to || buses.length === 0) return [];
  return buses.slice(0, 3).map((bus, i) => ({
    id: `${bus.id}-${i}`,
    line: bus.line,
    durationMin: 12 + i * 4 + bus.delayMin,
    fareRon: 3,
    crowd: bus.crowd,
    steps: [
      { kind: 'walk', line: bus.line, minutes: 5, to },
      { kind: 'ride', line: bus.line, minutes: 7 + i * 4 + bus.delayMin, to },
    ],
  }));
}

export function sortOptions(options: RouteOption[], filter: RouteFilter): RouteOption[] {
  const sorted = [...options];
  if (filter === 'fastest') sorted.sort((a, b) => a.durationMin - b.durationMin);
  if (filter === 'cheapest') sorted.sort((a, b) => a.fareRon - b.fareRon);
  if (filter === 'roomiest') sorted.sort((a, b) => a.crowd - b.crowd);
  return sorted;
}
