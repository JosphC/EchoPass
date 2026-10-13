import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../../core/theme';
import type { BusMarker } from '../../hooks/useLiveMap';
import type { Station } from '../../stations';
import type { LatLng } from '../../arrivals';
import { LiveMap, type MapPinPoint, type MapRouteSegment } from './LiveMap';
import { BusPopup } from '../overlays/BusPopup';

interface LiveMapPanelProps {
  markers: BusMarker[];
  station: Station | null;
  selectedId: string | null;
  followed: BusMarker | null;
  located: boolean;
  onSelect: (id: string) => void;
  onLocated: () => void;
  popup: BusMarker | null;
  popupTracked: boolean;
  onTrackPopup: () => void;
  onClosePopup: () => void;
  centerTrigger?: number;
  userCoords?: LatLng | null;
  extraStations?: Station[];
  routeSegments?: MapRouteSegment[];
  routeFitCoords?: LatLng[];
  originPin?: MapPinPoint | null;
  destPin?: MapPinPoint | null;
  routeEdgePadding?: { top: number; right: number; bottom: number; left: number };
  mapPadding?: { top: number; right: number; bottom: number; left: number };
  bottomOffset?: number;
  onMapPress?: () => void;
}

/** Map + vehicle popup anchored above the bottom sheet, like Google Maps place cards. */
export function LiveMapPanel({
  markers,
  station,
  selectedId,
  followed,
  located,
  onSelect,
  onLocated,
  popup,
  popupTracked,
  onTrackPopup,
  onClosePopup,
  centerTrigger,
  userCoords,
  extraStations,
  routeSegments,
  routeFitCoords,
  originPin,
  destPin,
  routeEdgePadding,
  mapPadding,
  bottomOffset = 0,
  onMapPress,
}: LiveMapPanelProps) {
  return (
    <View style={styles.map}>
      <LiveMap
        markers={markers}
        station={station}
        selectedId={selectedId}
        followed={followed}
        located={located}
        onSelect={onSelect}
        onLocated={onLocated}
        onMapPress={onMapPress}
        centerTrigger={centerTrigger}
        userCoords={userCoords}
        extraStations={extraStations}
        routeSegments={routeSegments}
        routeFitCoords={routeFitCoords}
        originPin={originPin}
        destPin={destPin}
        routeEdgePadding={routeEdgePadding}
        mapPadding={mapPadding}
      />
      {popup ? (
        <View style={[styles.popup, { bottom: bottomOffset + 12 }]} pointerEvents="box-none">
          <BusPopup marker={popup} tracked={popupTracked} onTrack={onTrackPopup} onClose={onClosePopup} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  popup: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
});
