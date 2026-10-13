import { useFocusEffect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Arrival, Route } from '../../../services/api/schemas/arrival';
import { getRepositories } from '../../../services/providers';

export const ARRIVALS_RECALC_MS = 15_000;
const DEPARTED_TOLERANCE_MS = 30_000;

export interface StopArrivalItem {
  arrival: Arrival;
  minutesLeft: number;
  isNow: boolean;
}

export interface UseStopArrivalsOptions {
  limit?: number;
  windowMin?: number;
}

/**
 * ViewModel for the stop arrivals list: remaining minutes (floored, "now"
 * under a minute), ascending sort, departed-tolerance drop, multi-line
 * filter preserved across refreshes. The list recalculates locally every
 * 15 s while the screen is focused, without refetching.
 */
export function useStopArrivals(stopId: string | null, options?: UseStopArrivalsOptions) {
  const client = useQueryClient();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [lineFilter, setLineFilter] = useState<string[]>([]);
  const limit = options?.limit ?? 10;
  const windowMin = options?.windowMin ?? 60;

  const query = useQuery({
    queryKey: ['arrivals', stopId, limit, windowMin],
    queryFn: () => getRepositories().arrivals.getArrivals(stopId as string, { limit, windowMin }),
    enabled: stopId !== null,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    setLineFilter([]);
  }, [stopId]);

  useEffect(() => {
    if (query.data) setNowMs(Date.now());
  }, [query.data]);

  useFocusEffect(
    useCallback(() => {
      const id = setInterval(() => setNowMs(Date.now()), ARRIVALS_RECALC_MS);
      return () => clearInterval(id);
    }, []),
  );

  const items: StopArrivalItem[] = useMemo(() => {
    const all = (query.data ?? [])
      .map((arrival) => {
        const target = arrival.predictedTime ?? arrival.scheduledTime;
        if (target === null) return null;
        const diffMs = new Date(target).getTime() - nowMs;
        if (diffMs < -DEPARTED_TOLERANCE_MS) return null;
        return { arrival, minutesLeft: Math.max(0, Math.floor(diffMs / 60_000)), isNow: diffMs < 60_000 };
      })
      .filter((i): i is StopArrivalItem => i !== null)
      .sort((a, b) => a.minutesLeft - b.minutesLeft);
    return lineFilter.length === 0 ? all : all.filter((i) => lineFilter.includes(i.arrival.route.shortName));
  }, [query.data, nowMs, lineFilter]);

  const toggleLine = useCallback((line: string) => {
    setLineFilter((prev) => (prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line]));
  }, []);

  const clearFilter = useCallback(() => {
    setLineFilter([]);
  }, []);

  return {
    items,
    lines: useMemo(() => [...new Set((query.data ?? []).map((a) => a.route.shortName))], [query.data]),
    routes: useMemo(() => {
      const seen = new Map<string, Route>();
      for (const a of query.data ?? []) {
        if (!seen.has(a.route.shortName)) seen.set(a.route.shortName, a.route);
      }
      return [...seen.values()];
    }, [query.data]),
    lineFilter,
    toggleLine,
    clearFilter,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    isError: query.isError,
    hasCache: query.data !== undefined,
    updatedAtMs: query.dataUpdatedAt,
    refetch: query.refetch,
    invalidate: () => {
      void client.invalidateQueries({ queryKey: ['arrivals'] });
    },
  };
}
