import { useEffect, useRef, type MutableRefObject } from 'react';
import type { CameraRef } from '@maplibre/maplibre-react-native';
import type { LatLng } from '../arrivals';
import type { BusMarker } from './useLiveMap';

const TIMISOARA = { lng: 21.2287, lat: 45.7577 };

interface EdgePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface UseLiveMapCameraParams {
  cameraRef: MutableRefObject<CameraRef | null>;
  ready: boolean;
  centerTrigger?: number;
  userCoords?: LatLng | null;
  followed: BusMarker | null;
  routeFitCoords?: LatLng[];
  routeEdgePadding?: EdgePadding;
  mapPadding?: EdgePadding;
  /** Picked stop: centered above the sheet like Google Maps (not while a route is shown). */
  focusStation?: (LatLng & { id: string }) | null;
}

function toPadding(padding?: EdgePadding) {
  if (!padding) return undefined;
  return {
    paddingTop: padding.top,
    paddingRight: padding.right,
    paddingBottom: padding.bottom,
    paddingLeft: padding.left,
  };
}

export function useLiveMapCamera({
  cameraRef,
  ready,
  centerTrigger,
  userCoords,
  followed,
  routeFitCoords,
  routeEdgePadding,
  mapPadding,
  focusStation,
}: UseLiveMapCameraParams): void {
  const lastTarget = useRef<{ id: string; lat: number; lng: number } | null>(null);
  const lastFocusKey = useRef<string>('');
  const lastFittedKey = useRef<string>('');

  useEffect(() => {
    if (!ready || !cameraRef.current || centerTrigger === undefined || centerTrigger === 0) return;
    cameraRef.current.setCamera({
      centerCoordinate: [userCoords?.lng ?? TIMISOARA.lng, userCoords?.lat ?? TIMISOARA.lat],
      zoomLevel: 15,
      animationDuration: 500,
      padding: toPadding(mapPadding),
    });
  }, [ready, centerTrigger, userCoords, cameraRef, mapPadding]);

  useEffect(() => {
    if (!ready || !cameraRef.current || !focusStation || routeFitCoords) return;
    // Re-center when the sheet settles at a new height, not on every render.
    const key = `${focusStation.id}:${mapPadding?.bottom ?? 0}`;
    if (lastFocusKey.current === key) return;
    lastFocusKey.current = key;
    cameraRef.current.setCamera({
      centerCoordinate: [focusStation.lng, focusStation.lat],
      zoomLevel: 16,
      animationDuration: 500,
      padding: toPadding(mapPadding),
    });
  }, [ready, focusStation, routeFitCoords, mapPadding, cameraRef]);

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
    cameraRef.current?.setCamera({
      centerCoordinate: [position.lng, position.lat],
      zoomLevel: 13.5,
      animationDuration: 500,
    });
  }, [followed, cameraRef]);

  useEffect(() => {
    if (!ready || !cameraRef.current || !routeFitCoords || routeFitCoords.length < 2) return;
    const first = routeFitCoords[0];
    const last = routeFitCoords[routeFitCoords.length - 1];
    const pad = routeEdgePadding ? `${routeEdgePadding.top},${routeEdgePadding.bottom}` : 'default';
    const key = `${routeFitCoords.length}:${first.lat.toFixed(4)},${first.lng.toFixed(4)}:${last.lat.toFixed(4)},${last.lng.toFixed(4)}:${pad}`;
    if (lastFittedKey.current === key) return;
    lastFittedKey.current = key;
    const lngs = routeFitCoords.map((p) => p.lng);
    const lats = routeFitCoords.map((p) => p.lat);
    const padArray = routeEdgePadding
      ? [routeEdgePadding.top, routeEdgePadding.right, routeEdgePadding.bottom, routeEdgePadding.left]
      : [80, 60, 80, 60];
    cameraRef.current.fitBounds(
      [Math.max(...lngs), Math.max(...lats)],
      [Math.min(...lngs), Math.min(...lats)],
      padArray,
      500,
    );
  }, [ready, routeFitCoords, routeEdgePadding, cameraRef]);
}
