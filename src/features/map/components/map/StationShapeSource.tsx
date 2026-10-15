import { useCallback, useMemo } from 'react';
import type { FeatureCollection } from 'geojson';
import {
  Images,
  ShapeSource,
  SymbolLayer,
  type OnPressEvent,
  type SymbolLayerStyle,
} from '@maplibre/maplibre-react-native';
import stationStopIcon from '../../../../assets/station-stop.png';
import { useTheme } from '../../../../core/theme/useTheme';
import {
  MAP_FONT_BOLD,
  MAP_FONT_REGULAR,
  MAP_LABEL_HALO,
  MAP_LABEL_HALO_DARK,
  MAP_TRANSIT_LABEL,
  MAP_TRANSIT_LABEL_DARK,
} from '../../mapStyle';
import { loadStations, type Station } from '../../stations';

/** Below this zoom the city view would drown in ~hundreds of stop dots. */
export const STATION_MIN_ZOOM = 14;

/** The icon PNG is 96 px; these scales give ~20 dp (normal) and ~32 dp (selected). */
const ICON_SIZE = 0.21;
const ICON_SIZE_SELECTED = 0.33;

/**
 * Google-Maps-style stop label: beside the icon (right, else left), small
 * transit-blue text on a white halo, wrapped and dropped on collision so
 * the map never turns into a wall of names.
 */
const LABEL: SymbolLayerStyle = {
  textField: '{name}',
  textHaloWidth: 1.6,
  textHaloBlur: 0.5,
  textVariableAnchor: ['left', 'right'],
  textRadialOffset: 0.9,
  textJustify: 'auto',
  textMaxWidth: 9,
  textOptional: true,
};

interface StationShapeSourceProps {
  selectedId: string | null;
  onPress: (station: Station) => void;
}

/**
 * Toate stațiile cu simbol de stație (indicator de autobuz) atingibil;
 * tap = programul de sosiri al stației. Stația aleasă rămâne vizibilă și mai
 * mare la orice zoom.
 */
export function StationShapeSource({ selectedId, onPress }: StationShapeSourceProps) {
  const { isDark } = useTheme();
  const label: SymbolLayerStyle = {
    ...LABEL,
    textColor: isDark ? MAP_TRANSIT_LABEL_DARK : MAP_TRANSIT_LABEL,
    textHaloColor: isDark ? MAP_LABEL_HALO_DARK : MAP_LABEL_HALO,
  };
  const stations = loadStations();
  const shape = useMemo<FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: stations.map((s) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
        properties: { stationId: s.id, name: s.name, selected: s.id === selectedId },
      })),
    }),
    [stations, selectedId],
  );

  const handlePress = useCallback(
    (event: OnPressEvent) => {
      const id = (event.features[0]?.properties as { stationId?: string } | null)?.stationId;
      const station = id ? stations.find((s) => s.id === id) : undefined;
      if (station) onPress(station);
    },
    [stations, onPress],
  );

  return (
    <>
      <Images images={{ stationStop: stationStopIcon }} />
      <ShapeSource id="stations" shape={shape} onPress={handlePress}>
        <SymbolLayer
          id="station-icons"
          minZoomLevel={STATION_MIN_ZOOM}
          filter={['!=', ['get', 'selected'], true]}
          style={{
            ...label,
            iconImage: 'stationStop',
            iconSize: ICON_SIZE,
            iconAllowOverlap: true,
            textFont: MAP_FONT_REGULAR,
            textSize: 12,
            // Names only at street level, like Google Maps.
            textOpacity: ['step', ['zoom'], 0, 16, 1],
          }}
        />
        <SymbolLayer
          id="station-selected"
          filter={['==', ['get', 'selected'], true]}
          style={{
            ...label,
            iconImage: 'stationStop',
            iconSize: ICON_SIZE_SELECTED,
            iconAllowOverlap: true,
            textAllowOverlap: true,
            textFont: MAP_FONT_BOLD,
            textSize: 13,
            textRadialOffset: 1.2,
          }}
        />
      </ShapeSource>
    </>
  );
}
