import { Fragment } from 'react';
import type { FeatureCollection, LineString } from 'geojson';
import { CircleLayer, LineLayer, ShapeSource } from '@maplibre/maplibre-react-native';
import { metersPerPixel, pointsAlong } from '../../../../core/utils/geo';
import { findRoute } from '../../../../services/repositories/gtfs/timetable';
import type { LatLng } from '../../arrivals';
import type { MapRouteSegment } from './LiveMap';

interface RoutePolylinesProps {
  ready: boolean;
  routeSegments?: MapRouteSegment[];
  walkPath?: LatLng[];
  destWalkPath?: LatLng[];
  primaryColor: string;
  /** Current map zoom: dots are re-spaced so they stay ~12 px apart on screen. */
  zoom: number;
}

function toLineString(coords: LatLng[]): LineString {
  return { type: 'LineString', coordinates: coords.map((p) => [p.lng, p.lat]) };
}

/** Screen distance between walking dots, like Google Maps. */
const DOT_SPACING_PX = 12;

/**
 * Google-Maps-style walking dots, computed as points along the path (native
 * dash arrays turn into blobs on the many corners of a footpath, and
 * line-placed symbols get dropped on short segments).
 */
function WalkDots({ id, path, color, zoom }: { id: string; path: LatLng[]; color: string; zoom: number }) {
  // Half-zoom buckets: re-spacing on every camera tick is wasted work.
  const stepM = DOT_SPACING_PX * metersPerPixel(Math.round(zoom * 2) / 2, path[0].lat);
  const shape: FeatureCollection = {
    type: 'FeatureCollection',
    // Endpoints sit under the stop / destination pins: leave them uncovered.
    features: pointsAlong(path, stepM).slice(1, -1).map((p, index) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { index },
    })),
  };
  return (
    <ShapeSource id={id} shape={shape}>
      <CircleLayer
        id={`${id}-dots`}
        style={{ circleColor: color, circleRadius: 4, circleStrokeColor: '#FFFFFF', circleStrokeWidth: 1 }}
      />
    </ShapeSource>
  );
}

/** Below this zoom intermediate stops would merge into a white stripe. */
const STOP_DOTS_MIN_ZOOM = 13;

/**
 * Google Maps transit leg: white dots for every stop passed on the way and
 * larger dark-ringed circles where you board and get off.
 */
function TransitStops({ seg, color }: { seg: MapRouteSegment; color: string }) {
  const ends = [seg.coordinates[0], seg.coordinates[seg.coordinates.length - 1]];
  const point = (p: LatLng, kind: 'via' | 'end') => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
    properties: { kind },
  });
  const shape: FeatureCollection = {
    type: 'FeatureCollection',
    features: [...(seg.stops ?? []).map((p) => point(p, 'via')), ...ends.map((p) => point(p, 'end'))],
  };
  return (
    <ShapeSource id={`stops-${seg.id}`} shape={shape}>
      <CircleLayer
        id={`stops-${seg.id}-via`}
        minZoomLevel={STOP_DOTS_MIN_ZOOM}
        filter={['==', ['get', 'kind'], 'via']}
        style={{ circleColor: '#FFFFFF', circleRadius: 3.5, circleStrokeColor: color, circleStrokeWidth: 1.5 }}
      />
      <CircleLayer
        id={`stops-${seg.id}-end`}
        filter={['==', ['get', 'kind'], 'end']}
        style={{ circleColor: '#FFFFFF', circleRadius: 6.5, circleStrokeColor: '#202124', circleStrokeWidth: 2.5 }}
      />
    </ShapeSource>
  );
}

function toShape(lines: LineString[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: lines.map((geometry, index) => ({ type: 'Feature', geometry, properties: { index } })),
  };
}

/**
 * Rute pietonale și de tranzit ca straturi de linii: carcasă albă + miez colorat,
 * stilul Google Maps, contrast bun în modul deschis și închis.
 */
export function RoutePolylines({ ready, routeSegments, walkPath, destWalkPath, primaryColor, zoom }: RoutePolylinesProps) {
  if (!ready) return null;

  if (routeSegments && routeSegments.length > 0) {
    return (
      <>
        {routeSegments.map((seg) => {
          if (seg.kind === 'walk') {
            return seg.coordinates.length > 1 ? (
              <WalkDots key={seg.id} id={`walk-${seg.id}`} path={seg.coordinates} color={seg.color} zoom={zoom} />
            ) : null;
          }
          const shape = toShape([toLineString(seg.coordinates)]);
          // Official line color (tram yellow, trolleybus…), like the badge in the steps.
          const color = (seg.line ? findRoute(seg.line)?.color : null) ?? seg.color;
          return (
            <Fragment key={seg.id}>
              <ShapeSource id={`route-${seg.id}`} shape={shape}>
                <LineLayer
                  id={`route-${seg.id}-casing`}
                  style={{ lineColor: '#FFFFFF', lineWidth: 10, lineCap: 'round', lineJoin: 'round' }}
                />
                <LineLayer
                  id={`route-${seg.id}-core`}
                  style={{ lineColor: color, lineWidth: 6, lineCap: 'round', lineJoin: 'round' }}
                />
              </ShapeSource>
              {seg.coordinates.length > 1 ? <TransitStops seg={seg} color={color} /> : null}
            </Fragment>
          );
        })}
      </>
    );
  }

  return (
    <>
      {walkPath && walkPath.length > 1 ? (
        <WalkDots id="walk-path" path={walkPath} color={primaryColor} zoom={zoom} />
      ) : null}
      {destWalkPath && destWalkPath.length > 1 ? (
        <WalkDots id="dest-walk-path" path={destWalkPath} color="#DC2626" zoom={zoom} />
      ) : null}
    </>
  );
}
