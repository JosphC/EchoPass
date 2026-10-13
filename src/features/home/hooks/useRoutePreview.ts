import { useEffect, useMemo, useState } from 'react';
import type { BusMarker, LatLng, LocationPlace, MapPinPoint, MapRouteSegment, Station } from '../../map';
import { planTransit, useRouteGeometry, type DestinationTarget, type TransitOption } from '../../planner';

export type RoutePlacePoint = Station | LocationPlace;

interface UseRoutePreviewParams {
  origin: RoutePlacePoint | null;
  originCoords: LatLng | null;
  destination: RoutePlacePoint | null;
  markers: BusMarker[];
  active: boolean;
}

export function useRoutePreview({
  origin,
  originCoords,
  destination,
  markers,
  active,
}: UseRoutePreviewParams) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const originStation =
    origin && 'station' in origin && origin.station
      ? origin.station
      : origin && 'lines' in origin
        ? origin
        : null;
  const originCoord = useMemo(
    () => originCoords ?? (origin ? { lat: origin.lat, lng: origin.lng } : null),
    [originCoords?.lat, originCoords?.lng, origin?.lat, origin?.lng],
  );

  const destStation =
    destination && 'station' in destination && destination.station
      ? destination.station
      : destination && 'lines' in destination
        ? destination
        : null;
  const destCoords = useMemo(
    () => (destination ? { lat: destination.lat, lng: destination.lng } : null),
    [destination?.lat, destination?.lng],
  );

  const destTarget: DestinationTarget | null = useMemo(() => {
    if (!destination) return null;
    return (
      destStation ?? {
        station: null,
        coords: destCoords ?? { lat: destination.lat, lng: destination.lng },
        name: destination.name,
      }
    );
  }, [destination, destStation, destCoords]);

  const options = useMemo(() => {
    if (!active || !origin || !destTarget) return [];
    return planTransit(
      { station: originStation, coords: originCoord, name: origin.name },
      destTarget,
      markers,
    );
  }, [active, origin, originStation, originCoord, destTarget, markers]);

  useEffect(() => {
    if (options.length === 0) {
      setSelectedId(null);
    } else if (!selectedId || !options.some((o) => o.id === selectedId)) {
      setSelectedId(options[0].id);
    }
  }, [options, selectedId]);

  const selectedOption = useMemo(
    () => options.find((o) => o.id === selectedId) ?? options[0] ?? null,
    [options, selectedId],
  );

  const startPoint = useMemo(
    () =>
      originCoord ??
      (originStation && selectedOption && originStation.id !== selectedOption.boardStation.id
        ? originStation
        : null),
    [originCoord, originStation, selectedOption?.boardStation.id],
  );
  const endPoint = useMemo(
    () =>
      destCoords ??
      (destStation && selectedOption && destStation.id !== selectedOption.alightStation.id
        ? destStation
        : null),
    [destCoords, destStation, selectedOption?.alightStation.id],
  );

  const { segments, allCoordinates } = useRouteGeometry(startPoint, selectedOption, endPoint);

  const extraStations = useMemo(() => {
    if (!selectedOption) return undefined;
    const list: Station[] = [];
    if (selectedOption.transferStation && selectedOption.transferStation.id !== selectedOption.boardStation.id) {
      list.push(selectedOption.transferStation);
    }
    if (selectedOption.alightStation.id !== selectedOption.boardStation.id) {
      list.push(selectedOption.alightStation);
    }
    return list.length > 0 ? list : undefined;
  }, [selectedOption]);

  const originPin: MapPinPoint | null = useMemo(
    () => (startPoint && origin ? { lat: startPoint.lat, lng: startPoint.lng, title: origin.name } : null),
    [startPoint, origin?.name],
  );
  const destPin: MapPinPoint | null = useMemo(
    () => (endPoint && destination ? { lat: endPoint.lat, lng: endPoint.lng, title: destination.name } : null),
    [endPoint, destination?.name],
  );

  return {
    options,
    selectedOption,
    selectOption: (opt: TransitOption) => setSelectedId(opt.id),
    routeSegments: (active && selectedOption ? segments : undefined) as MapRouteSegment[] | undefined,
    routeFitCoords: active && selectedOption ? allCoordinates : undefined,
    originPin: active && selectedOption ? originPin : null,
    destPin: active && selectedOption ? destPin : null,
    extraStations: active && selectedOption ? extraStations : undefined,
  };
}
