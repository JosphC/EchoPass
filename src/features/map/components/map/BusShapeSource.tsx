import { useCallback, useMemo } from 'react';
import type { FeatureCollection, Point } from 'geojson';
import { CircleLayer, Images, ShapeSource, SymbolLayer, type OnPressEvent } from '@maplibre/maplibre-react-native';
import busHeadingIcon from '../../../../assets/bus-heading.png';
import { bearingOnRoute } from '../../../../services/repositories/gtfs/routeProgress';
import { findRoute } from '../../../../services/repositories/gtfs/timetable';
import type { BusMarker } from '../../hooks/useLiveMap';
import { MAP_FONT_BOLD } from '../../mapStyle';

interface BusShapeSourceProps {
  markers: BusMarker[];
  selectedId: string | null;
  primaryColor: string;
  onSelect: (id: string) => void;
  onClusterPress: (coordinate: [number, number]) => void;
}

/** Official GTFS colors (trams yellow, trolleybuses…) and the travel direction along the route. */
function styleOf(m: BusMarker, fallback: string): { color: string; textColor: string; bearing?: number } {
  const route = findRoute(m.bus.line);
  const bearing = m.position ? bearingOnRoute(m.bus.line, m.bus.destination, m.position) : null;
  return {
    color: route?.color ?? fallback,
    textColor: route?.textColor ?? '#FFFFFF',
    ...(bearing === null ? {} : { bearing }),
  };
}

/**
 * Autobuze live cu clustering nativ, ca în Google Maps: cerc în culoarea
 * liniei, săgeată spre direcția de mers, tap pe pin sau zoom pe cluster.
 */
export function BusShapeSource({ markers, selectedId, primaryColor, onSelect, onClusterPress }: BusShapeSourceProps) {
  const shape = useMemo<FeatureCollection>(() => {
    return {
      type: 'FeatureCollection',
      features: markers.flatMap((m) =>
        m.position
          ? [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [m.position.lng, m.position.lat] },
                properties: {
                  busId: m.bus.id,
                  line: m.bus.line,
                  selected: m.bus.id === selectedId,
                  ...styleOf(m, primaryColor),
                },
              },
            ]
          : [],
      ),
    };
  }, [markers, selectedId, primaryColor]);

  const handlePress = useCallback(
    (event: OnPressEvent) => {
      const feature = event.features[0];
      const props = (feature?.properties ?? {}) as { busId?: string; point_count?: number };
      if (!feature || props.point_count !== undefined) {
        const coords = (feature?.geometry as Point | undefined)?.coordinates;
        if (coords && coords.length >= 2) onClusterPress([coords[0], coords[1]]);
        return;
      }
      if (props.busId) onSelect(props.busId);
    },
    [onSelect, onClusterPress],
  );

  return (
    <>
      {/* SDF: one white arrow tinted per line through iconColor. */}
      <Images images={{ busHeading: { source: busHeadingIcon, sdf: true } }} />
      <ShapeSource id="buses" shape={shape} cluster clusterRadius={50} onPress={handlePress}>
        <CircleLayer
          id="bus-clusters"
          filter={['has', 'point_count']}
          style={{ circleColor: primaryColor, circleRadius: 24, circleStrokeColor: '#FFFFFF', circleStrokeWidth: 3 }}
        />
        <SymbolLayer
          id="bus-cluster-count"
          filter={['has', 'point_count']}
          style={{ textField: '{point_count}', textFont: MAP_FONT_BOLD, textSize: 15, textColor: '#FFFFFF', textAllowOverlap: true }}
        />
        <CircleLayer
          id="bus-selected"
          filter={['all', ['!', ['has', 'point_count']], ['==', ['get', 'selected'], true]]}
          style={{ circleColor: ['get', 'color'], circleRadius: 22, circleOpacity: 0.3 }}
        />
        {/* The 48 dp arrow sits under the 16 dp circle: only its tip shows, pointing the way. */}
        <SymbolLayer
          id="bus-heading"
          filter={['all', ['!', ['has', 'point_count']], ['has', 'bearing']]}
          style={{
            iconImage: 'busHeading',
            iconSize: 0.5,
            iconColor: ['get', 'color'],
            iconRotate: ['get', 'bearing'],
            iconRotationAlignment: 'map',
            iconAllowOverlap: true,
            iconIgnorePlacement: true,
          }}
        />
        <CircleLayer
          id="bus-single"
          filter={['!', ['has', 'point_count']]}
          style={{ circleColor: ['get', 'color'], circleRadius: 13, circleStrokeColor: '#FFFFFF', circleStrokeWidth: 2.5 }}
        />
        <SymbolLayer
          id="bus-line"
          filter={['!', ['has', 'point_count']]}
          style={{
            textField: '{line}',
            textFont: MAP_FONT_BOLD,
            textSize: 11,
            textColor: ['get', 'textColor'],
            textAllowOverlap: true,
          }}
        />
      </ShapeSource>
    </>
  );
}
