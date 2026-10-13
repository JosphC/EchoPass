import { useFocusEffect } from 'expo-router';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useCallback, useMemo, useState } from 'react';
import type { Bus, BusPosition } from '../../../services/api/schemas/bus';
import { getRepositories } from '../../../services/providers';
import { estimateArrivals, haversineKm, nearestStation, CITY_CENTER, type Arrival } from '../arrivals';
import { detectDelays, type DelayInfo } from '../delays';
import { loadStations, trolleybusesAt, type Station } from '../stations';

const repos = getRepositories();
/** STPT publishes fresh positions ~every 20s; poll slower to stay clear of slow cycles. */
const POLL_MS = 30_000;

let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollCycle: Promise<unknown> | null = null;

/**
 * Single shared poller: one in-flight refresh at most. A slow fetch can
 * never stack overlapping cycles (the CPU-spin/ANR root cause); a late
 * tick is simply skipped until the cycle settles.
 */
function ensureSharedPoll(client: QueryClient): void {
  if (pollTimer) return;
  pollTimer = setInterval(() => {
    if (pollCycle) return;
    pollCycle = Promise.all([
      client.refetchQueries({ queryKey: ['buses'] }),
      client.refetchQueries({ queryKey: ['positions'] }),
    ]).finally(() => {
      pollCycle = null;
    });
  }, POLL_MS);
}

function releaseSharedPoll(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export interface BusMarker {
  bus: Bus;
  position: BusPosition | undefined;
}

export function useLiveMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [trackedId, setTrackedId] = useState<string | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [located, setLocated] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const client = useQueryClient();
  const buses = useQuery({ queryKey: ['buses'], queryFn: () => repos.bus.getBuses() });
  const positions = useQuery({ queryKey: ['positions'], queryFn: () => repos.bus.getPositions() });
  const reports = useQuery({ queryKey: ['reports'], queryFn: () => repos.report.getReports() });

  // Shared poller: exactly one timer no matter how many map screens
  // mount, so focus-cleanup quirks can never stack intervals (CPU spin).
  useFocusEffect(
    useCallback(() => {
      ensureSharedPoll(client);
      return () => {
        releaseSharedPoll();
      };
    }, [client]),
  );

  const markers: BusMarker[] = useMemo(() => {
    const byId = new Map((positions.data ?? []).map((p) => [p.busId, p]));
    return (buses.data ?? []).map((bus) => ({ bus, position: byId.get(bus.id) }));
  }, [buses.data, positions.data]);

  const selected = markers.find((m) => m.bus.id === selectedId) ?? null;
  const tracked = markers.find((m) => m.bus.id === trackedId) ?? null;
  // Google-Maps-style focus: no station/line -> empty map; a picked line shows
  // only that line's vehicles; station alone narrows to its trolleybuses.
  const visible = line
    ? markers.filter((m) => m.bus.line === line)
    : station
      ? trolleybusesAt(markers, station)
      : [];
  const arrivalStation = useMemo(() => station ?? nearestStation(coords), [station, coords]);
  const arrivals: Arrival[] = useMemo(() => estimateArrivals(arrivalStation, markers), [arrivalStation, markers]);
  const nearbyStations: Station[] = useMemo(() => {
    const point = coords ?? CITY_CENTER;
    const sorted = [...loadStations()].sort((a, b) => haversineKm(point, a) - haversineKm(point, b));
    const top = sorted.slice(0, 4);
    if (station && !top.some((s) => s.id === station.id)) return [station, ...top.slice(0, 3)];
    return top;
  }, [coords, station]);
  const delays: DelayInfo[] = useMemo(
    () => detectDelays(markers, reports.data ?? [], Date.now()),
    [markers, reports.data],
  );
  const confirmDelay = useMutation({
    mutationFn: (reportId: string) => repos.report.confirmReport(reportId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    markers: visible,
    allMarkers: markers,
    station,
    line,
    arrivalStation,
    arrivals,
    nearbyStations,
    coords,
    delays,
    reports: reports.data ?? [],
    confirmDelay: (reportId: string) => confirmDelay.mutate(reportId),
    sheetOpen,
    located,
    locate: useCallback(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocated(true);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocated(true);
      } catch {
        setLocated(true);
      }
    }, []),
    openSheet: () => setSheetOpen(true),
    closeSheet: () => setSheetOpen(false),
    pickStation: (next: Station | null) => {
      setStation(next);
      setLine(null);
      setSelectedId(null);
      setTrackedId(null);
    },
    pickLine: (next: string | null) => {
      setLine(next);
      setSelectedId(null);
      setTrackedId(null);
    },
    selected,
    tracked,
    select: setSelectedId,
    track: (id: string | null) => {
      setTrackedId(id);
      if (id) setSelectedId(id);
    },
    isLoading: buses.isLoading || positions.isLoading,
  };
}
