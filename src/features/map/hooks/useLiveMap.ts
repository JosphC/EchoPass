import { useFocusEffect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useCallback, useMemo, useState } from 'react';
import type { Bus, BusPosition } from '../../../services/api/schemas/bus';
import { getRepositories } from '../../../services/providers';
import { trolleybusesAt, type Station } from '../stations';

const repos = getRepositories();
/** STPT publishes fresh positions ~every 20s. */
const POLL_MS = 20_000;

export interface BusMarker {
  bus: Bus;
  position: BusPosition | undefined;
}

export function useLiveMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [trackedId, setTrackedId] = useState<string | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [located, setLocated] = useState(false);
  const client = useQueryClient();
  const buses = useQuery({ queryKey: ['buses'], queryFn: () => repos.bus.getBuses() });
  const positions = useQuery({ queryKey: ['positions'], queryFn: () => repos.bus.getPositions() });

  // Poll only while a map screen is focused: no timers in background or tests.
  useFocusEffect(
    useCallback(() => {
      const id = setInterval(() => {
        void client.invalidateQueries({ queryKey: ['buses'] });
        void client.invalidateQueries({ queryKey: ['positions'] });
      }, POLL_MS);
      return () => clearInterval(id);
    }, [client]),
  );

  const markers: BusMarker[] = useMemo(() => {
    const byId = new Map((positions.data ?? []).map((p) => [p.busId, p]));
    return (buses.data ?? []).map((bus) => ({ bus, position: byId.get(bus.id) }));
  }, [buses.data, positions.data]);

  const selected = markers.find((m) => m.bus.id === selectedId) ?? null;
  const tracked = markers.find((m) => m.bus.id === trackedId) ?? null;
  const visible = station ? trolleybusesAt(markers, station) : markers;

  return {
    markers: visible,
    station,
    sheetOpen,
    located,
    locate: useCallback(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocated(status === 'granted');
      } catch {
        setLocated(true);
      }
    }, []),
    openSheet: () => setSheetOpen(true),
    closeSheet: () => setSheetOpen(false),
    pickStation: (next: Station | null) => {
      setStation(next);
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
