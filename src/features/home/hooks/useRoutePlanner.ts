import { useState } from 'react';
import { nearestStation, type LatLng, type LocationPlace, type Station } from '../../map';
import type { TransitOption } from '../../planner';

export type PlannerPoint = Station | LocationPlace;

export interface SearchedRoute {
  from: PlannerPoint;
  to: PlannerPoint;
}

export interface RouteNavigator {
  plan: (
    from: PlannerPoint,
    to: PlannerPoint,
    option?: TransitOption,
    coords?: LatLng | null,
    destCoords?: LatLng | null,
  ) => void;
  notifications: () => void;
}

/** Route planner state plus navigation actions, to keep routes slim. */
export function useRoutePlanner(pickStation: (station: Station | null) => void, nav: RouteNavigator) {
  const [origin, setOrigin] = useState<PlannerPoint | null>(null);
  const [originCoords, setOriginCoords] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<PlannerPoint | null>(null);
  const [searched, setSearched] = useState<SearchedRoute | null>(null);

  function changeOrigin(next: PlannerPoint | null, coords: LatLng | null): void {
    setOrigin(next);
    setOriginCoords(coords);
    setSearched(null);
    const station = next && 'lines' in next ? next : (next?.station ?? null);
    pickStation(station);
  }

  function changeDestination(next: PlannerPoint | null): void {
    setDestination(next);
    setSearched(null);
  }

  function swap(): void {
    setOrigin(destination);
    setDestination(origin);
    if (origin && destination && origin.id !== destination.id) {
      setSearched({ from: destination, to: origin });
    }
  }

  function doSearch(from: PlannerPoint, to: PlannerPoint): void {
    setSearched({ from, to });
    const dCoords = { lat: to.lat, lng: to.lng };
    nav.plan(from, to, undefined, originCoords, dCoords);
  }

  function openOption(option: TransitOption): void {
    if (searched) {
      const dCoords = { lat: searched.to.lat, lng: searched.to.lng };
      nav.plan(searched.from, searched.to, option, originCoords, dCoords);
    }
  }

  function goArrivalDirections(arrivalStation: Station, userCoords?: LatLng | null): void {
    const activeCoords = userCoords ?? originCoords;
    if (origin && origin.id !== arrivalStation.id) {
      nav.plan(origin, arrivalStation, undefined, activeCoords);
    } else {
      const fromStation = activeCoords ? nearestStation(activeCoords) : null;
      const start = fromStation ?? arrivalStation;
      nav.plan(start, arrivalStation, undefined, activeCoords);
    }
  }

  return {
    origin,
    originCoords,
    destination,
    searched,
    changeOrigin,
    changeDestination,
    swap,
    doSearch,
    openOption,
    goArrivalDirections,
    openNotifications: nav.notifications,
  };
}
