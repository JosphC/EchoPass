import * as Location from 'expo-location';
import { useState } from 'react';
import { t } from '../../../core/i18n';
import { nearestStation, type LatLng, type Station } from '../../../features/map';

export interface LocatedOrigin {
  station: Station;
  coords: LatLng;
}

/** GPS origin: nearest stop to the device, with denial handled inline. */
export function useLocateOrigin() {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function locate(): Promise<LocatedOrigin | null> {
    setLocating(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(t('home.locationDenied'));
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      return { station: nearestStation(coords), coords };
    } catch {
      setError(t('home.locationDenied'));
      return null;
    } finally {
      setLocating(false);
    }
  }

  return { locating, error, setError, locate };
}
