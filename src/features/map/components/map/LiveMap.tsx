import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import clustering from 'react-native-map-clustering';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useTheme } from '../../../../core/theme/useTheme';
import type { BusMarker } from '../../hooks/useLiveMap';
import { hasMapKey } from '../../mapKey';
import type { LatLng } from '../../arrivals';
import type { Station } from '../../stations';
import { BusListFallback } from './BusListFallback';
import { BusMarkerPin } from './BusMarkerPin';
import { ClusterPin, type ClusterPoint } from './ClusterPin';
import { StationPin } from './StationPin';
import { useMarkerBudget } from '../../hooks/useMarkerBudget';
import { useLiveMapCamera } from '../../hooks/useLiveMapCamera';
import { RoutePolylines } from './RoutePolylines';

const TIMISOARA: Region = {
  latitude: 45.7577,
  longitude: 21.2287,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

// react-native-map-clustering exporta via `module.exports = namespace`
// (index.js), deci importul default poate fi `{ default: Component }`.
// Normalizam pentru a evita "Element type is invalid: got undefined/object".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ClusteredMapView = (clustering as any)?.default ?? (clustering as any);

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
}

interface LiveMapProps {
  markers: BusMarker[];
  station: Station | null;
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
  centerTrigger?: number;
  userCoords?: LatLng | null;
  routeEdgePadding?: { top: number; right: number; bottom: number; left: number };
  mapPadding?: { top: number; right: number; bottom: number; left: number };
}

export function LiveMap({
  markers,
  station,
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
  centerTrigger,
  userCoords,
  routeEdgePadding,
  mapPadding,
}: LiveMapProps) {
  const ref = useRef<MapView | null>(null);
  const { colors } = useTheme();
  const [ready, setReady] = useState(false);
  // Mount the native map one frame after the tab transition commits, so the
  // transition animation + input dispatch finish before Maps SDK init starts.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const markerBudget = useMarkerBudget(markers.length, ready, located, onLocated);

  useLiveMapCamera({
    mapRef: ref,
    ready,
    centerTrigger,
    userCoords,
    followed,
    routeFitCoords,
    routeEdgePadding,
  });

  const handleMapRef = useCallback((map: unknown) => {
    ref.current = map as unknown as MapView | null;
  }, []);

  // Stable across renders: a new closure every render would force the clustering
  // engine to recompute + remount markers on every frame.
  const renderCluster = useCallback(
    (cluster: ClusterPoint) => <ClusterPin cluster={cluster} color={colors.primary} />,
    [colors.primary],
  );

  if (!hasMapKey()) {
    return <BusListFallback markers={markers} onSelect={onSelect} />;
  }

  if (!mounted) {
    return <View style={styles.map} />;
  }

  return (
    <ClusteredMapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={TIMISOARA}
      showsUserLocation
      showsMyLocationButton={false}
      // Google Maps behaviour: keep compass/scale/toolbar, don't steal taps.
      showsCompass
      showsScale
      toolbarEnabled
      loadingEnabled
      moveOnMarkerPress={false}
      mapPadding={mapPadding}
      radius={50}
      clusterColor={colors.primary}
      clusterTextColor="#FFFFFF"
      onMapReady={() => setReady(true)}
      onPress={onMapPress}
      mapRef={handleMapRef}
      renderCluster={renderCluster}
    >
      {originPin && ready ? (
        <Marker coordinate={{ latitude: originPin.lat, longitude: originPin.lng }} title={originPin.title} description="Punct de pornire" pinColor="#2563EB" />
      ) : null}
      {destPin && ready ? (
        <Marker coordinate={{ latitude: destPin.lat, longitude: destPin.lng }} title={destPin.title} description="Destinație" pinColor="#DC2626" />
      ) : null}
      {station && ready ? <StationPin station={station} /> : null}
      {extraStations && ready ? extraStations.map((s) => <StationPin key={s.id} station={s} />) : null}
      <RoutePolylines
        ready={ready}
        routeSegments={routeSegments}
        walkPath={walkPath}
        destWalkPath={destWalkPath}
        primaryColor={colors.primary}
      />
      {ready
        ? markers.slice(0, markerBudget).map((marker) => (
            <BusMarkerPin
              key={selectedId === marker.bus.id ? `${marker.bus.id}-sel` : marker.bus.id}
              marker={marker}
              selected={selectedId === marker.bus.id}
              color={colors.primary}
              onSelect={onSelect}
            />
          ))
        : null}
    </ClusteredMapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
