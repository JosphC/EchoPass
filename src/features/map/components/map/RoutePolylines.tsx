import { Polyline } from 'react-native-maps';
import type { LatLng } from '../../arrivals';
import type { MapRouteSegment } from './LiveMap';

interface RoutePolylinesProps {
  ready: boolean;
  routeSegments?: MapRouteSegment[];
  walkPath?: LatLng[];
  destWalkPath?: LatLng[];
  primaryColor: string;
}

/**
 * Polyline rendering for walk legs, transit legs, and direct paths.
 * Matches Google Maps style with clean casing and high contrast in both light and dark mode.
 */
export function RoutePolylines({
  ready,
  routeSegments,
  walkPath,
  destWalkPath,
  primaryColor,
}: RoutePolylinesProps) {
  if (!ready) return null;

  const casingColor = '#FFFFFF';
  const walkCasingColor = '#FFFFFF';

  if (routeSegments && routeSegments.length > 0) {
    return (
      <>
        {routeSegments.flatMap((seg) => {
          const coords = seg.coordinates.map((p) => ({ latitude: p.lat, longitude: p.lng }));
          const coreWidth = seg.kind === 'transit' ? 6 : 4;
          if (seg.kind === 'walk') {
            return [
              <Polyline
                key={`${seg.id}-casing`}
                coordinates={coords}
                strokeColor={walkCasingColor}
                strokeWidth={coreWidth + 3}
                lineDashPattern={[8, 8]}
                lineCap="round"
                zIndex={9}
              />,
              <Polyline
                key={seg.id}
                coordinates={coords}
                strokeColor={seg.color}
                strokeWidth={coreWidth}
                lineDashPattern={[8, 8]}
                lineCap="round"
                zIndex={10}
              />,
            ];
          }
          // Transit leg: contrasting casing + vibrant colored core
          return [
            <Polyline
              key={`${seg.id}-casing`}
              coordinates={coords}
              strokeColor={casingColor}
              strokeWidth={coreWidth + 4}
              lineCap="round"
              lineJoin="round"
              zIndex={19}
            />,
            <Polyline
              key={seg.id}
              coordinates={coords}
              strokeColor={seg.color}
              strokeWidth={coreWidth}
              lineCap="round"
              lineJoin="round"
              zIndex={20}
            />,
          ];
        })}
      </>
    );
  }

  return (
    <>
      {walkPath && walkPath.length > 1 ? (
        <Polyline
          coordinates={walkPath.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
          strokeColor={primaryColor}
          strokeWidth={4}
          lineDashPattern={[8, 8]}
        />
      ) : null}
      {destWalkPath && destWalkPath.length > 1 ? (
        <Polyline
          coordinates={destWalkPath.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
          strokeColor="#DC2626"
          strokeWidth={4}
          lineDashPattern={[8, 8]}
        />
      ) : null}
    </>
  );
}
