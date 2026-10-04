import Constants from 'expo-constants';

/** Google Maps key present (compiled from EXPO_PUBLIC_GOOGLE_MAPS_KEY). Without it Android shows a list fallback. */
export function hasMapKey(): boolean {
  const extra = Constants.expoConfig?.extra as { mapsKey?: string } | undefined;
  return typeof extra?.mapsKey === 'string' && extra.mapsKey.length > 0;
}
