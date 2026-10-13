import { useEffect, useRef, type MutableRefObject } from 'react';
import type MapView from 'react-native-maps';
import type { LatLng } from '../arrivals';
import type { BusMarker } from './useLiveMap';

const TIMISOARA_CENTER = { latitude: 45.7577, longitude: 21.2287 };

interface UseLiveMapCameraParams {
  mapRef: MutableRefObject<MapView | null>;
  ready: boolean;
  centerTrigger?: number;
  userCoords?: LatLng | null;
  followed: BusMarker | null;
  routeFitCoords?: LatLng[];
  routeEdgePadding?: { top: number; right: number; bottom: number; left: number };
}

export function useLiveMapCamera({
  mapRef,
  ready,
  centerTrigger,
  userCoords,
  followed,
  routeFitCoords,
  routeEdgePadding,
}: UseLiveMapCameraParams): void {
  const lastTarget = useRef<{ id: string; lat: number; lng: number } | null>(null);
  const lastFittedKey = useRef<string>('');

  useEffect(() => {
    if (!ready || !mapRef.current || centerTrigger === undefined || centerTrigger === 0) return;
    const targetLat = userCoords?.lat ?? TIMISOARA_CENTER.latitude;
    const targetLng = userCoords?.lng ?? TIMISOARA_CENTER.longitude;
    mapRef.current.animateToRegion(
      { latitude: targetLat, longitude: targetLng, latitudeDelta: 0.015, longitudeDelta: 0.015 },
      500,
    );
  }, [ready, centerTrigger, userCoords, mapRef]);

  useEffect(() => {
    const position = followed?.position;
    if (!position || !followed) return;
    const prev = lastTarget.current;
    const moved =
      !prev ||
      prev.id !== followed.bus.id ||
      Math.abs(prev.lat - position.lat) > 0.0005 ||
      Math.abs(prev.lng - position.lng) > 0.0005;
    if (!moved) return;
    lastTarget.current = { id: followed.bus.id, lat: position.lat, lng: position.lng };
    mapRef.current?.animateToRegion(
      { latitude: position.lat, longitude: position.lng, latitudeDelta: 0.03, longitudeDelta: 0.03 },
      500,
    );
  }, [followed, mapRef]);

  useEffect(() => {
    if (!ready || !mapRef.current || !routeFitCoords || routeFitCoords.length < 2) return;
    const first = routeFitCoords[0];
    const last = routeFitCoords[routeFitCoords.length - 1];
    const pad = routeEdgePadding ? `${routeEdgePadding.top},${routeEdgePadding.bottom}` : 'default';
    const key = `${routeFitCoords.length}:${first.lat.toFixed(4)},${first.lng.toFixed(4)}:${last.lat.toFixed(4)},${last.lng.toFixed(4)}:${pad}`;
    if (lastFittedKey.current === key) return;
    lastFittedKey.current = key;
    const pts = routeFitCoords.map((p) => ({ latitude: p.lat, longitude: p.lng }));
    mapRef.current.fitToCoordinates(pts, {
      edgePadding: routeEdgePadding ?? { top: 80, right: 60, bottom: 80, left: 60 },
      animated: true,
    });
  }, [ready, routeFitCoords, routeEdgePadding, mapRef]);
}
