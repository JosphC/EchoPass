import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, MapView, UserLocation, type CameraRef } from '@maplibre/maplibre-react-native';
import { useTheme } from '../../../../core/theme/useTheme';
import type { BusMarker } from '../../hooks/useLiveMap';
import type { LatLng } from '../../arrivals';
import type { Station } from '../../stations';
import { isMapNativeAvailable, mapStyleUrl } from '../../mapStyle';
import { BusListFallback } from './BusListFallback';
import { BusShapeSource } from './BusShapeSource';
import { RoutePolylines } from './RoutePolylines';
import { PlacePin, StationPin } from './StationPin';
import { StationShapeSource } from './StationShapeSource';
import { useMarkerBudget } from '../../hooks/useMarkerBudget';
import { useLiveMapCamera } from '../../hooks/useLiveMapCamera';

export interface MapPinPoint {
  lat: number;
  lng: number;
  title: string;
}

export interface MapRouteSegment {
  id: string;
  kind: 'walk' | 'transit';
  line?: string;
  color: string;
  coordinates: LatLng[];
  /** Transit: intermediate stops drawn as small dots on the line. */
  stops?: LatLng[];
}

interface LiveMapProps {
  markers: BusMarker[];
  station: Station | null;
  /** Stop shown in the sheet without being picked (nearest): highlighted, never flown to. */
  highlightStation?: Station | null;
  /** Pins for transfer/alight stops; a drawn route marks them itself (circles), so they hide then. */
  extraStations?: Station[];
  routeSegments?: MapRouteSegment[];
  routeFitCoords?: LatLng[];
  walkPath?: LatLng[];
  destWalkPath?: LatLng[];
  originPin?: MapPinPoint | null;
  destPin?: MapPinPoint | null;
  selectedId: string | null;
  followed: BusMarker | null;
  located?: boolean;
  onSelect: (id: string) => void;
  onLocated?: () => void;
  onMapPress?: () => void;
  /** When set, every stop is a tappable dot (zoom ≥ 14) that opens its schedule. */
  onStationPress?: (station: Station) => void;
  centerTrigger?: number;
  userCoords?: LatLng | null;
  routeEdgePadding?: { top: number; right: number; bottom: number; left: number };
  mapPadding?: { top: number; right: number; bottom: number; left: number };
}

export function LiveMap({
  markers,
  station,
  highlightStation,
  extraStations,
  routeSegments,
  routeFitCoords,
  walkPath,
  destWalkPath,
  originPin,
  destPin,
  selectedId,
  followed,
  located = true,
  onSelect,
  onLocated,
  onMapPress,
  onStationPress,
  centerTrigger,
  userCoords,
  routeEdgePadding,
  mapPadding,
}: LiveMapProps) {
  const cameraRef = useRef<CameraRef | null>(null);
  const { colors, isDark } = useTheme();
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(11.5);
  // Montează harta nativă un cadru mai târziu ca tranziția tabului să nu sacadeze.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const markerBudget = useMarkerBudget(markers.length, ready, located, onLocated);

  useLiveMapCamera({
    cameraRef,
    ready,
    centerTrigger,
    userCoords,
    followed,
    routeFitCoords,
    routeEdgePadding,
    mapPadding,
    focusStation: onStationPress ? station : null,
  });

  const visible = useMemo(() => (ready ? markers.slice(0, markerBudget) : []), [markers, markerBudget, ready]);

  const handleClusterPress = useCallback(
    (coordinate: [number, number]) => {
      cameraRef.current?.setCamera({
        centerCoordinate: coordinate,
        zoomLevel: Math.min(zoom + 2.5, 18),
        animationDuration: 400,
      });
    },
    [zoom],
  );

  if (!mounted) return <View style={styles.map} />;

  // APK fără modulul nativ MapLibre: listă, nu crash.
  if (!isMapNativeAvailable()) return <BusListFallback markers={markers} onSelect={onSelect} />;

  return (
    <MapView
      style={styles.map}
      mapStyle={mapStyleUrl(isDark)}
      compassEnabled
      onPress={() => onMapPress?.()}
      onDidFinishLoadingMap={() => setReady(true)}
      onRegionDidChange={(region) => setZoom(region.properties.zoomLevel)}
    >
      <Camera ref={cameraRef} defaultSettings={{ centerCoordinate: [21.2287, 45.7577], zoomLevel: 11.5 }} />
      {/* Native puck: blue dot, accuracy halo and compass heading, like Google Maps. */}
      <UserLocation visible={located} renderMode="native" androidRenderMode="compass" showsUserHeadingIndicator />
      {onStationPress ? (
        <StationShapeSource selectedId={(station ?? highlightStation)?.id ?? null} onPress={onStationPress} />
      ) : null}
      <BusShapeSource
        markers={visible}
        selectedId={selectedId}
        primaryColor={colors.primary}
        onSelect={onSelect}
        onClusterPress={handleClusterPress}
      />
      <PlacePin id="origin-pin" pin={originPin} color="#2563EB" />
      <PlacePin id="dest-pin" pin={destPin} color="#DC2626" />
      {station && !onStationPress ? <StationPin station={station} /> : null}
      {extraStations && !routeSegments?.length ? extraStations.map((s) => <StationPin key={s.id} station={s} />) : null}
      <RoutePolylines
        ready={ready}
        routeSegments={routeSegments}
        walkPath={walkPath}
        destWalkPath={destWalkPath}
        primaryColor={colors.primary}
        zoom={zoom}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
