import { NativeModules } from 'react-native';

/**
 * Hărți 100% gratuite și open-source: MapLibre + OpenFreeMap.
 * Fără cheie API, fără cont, fără factură. Necesită atribuire (randată automat de hartă).
 */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
/** Dark base map for the dark app theme (same glyph server and fonts as liberty). */
export const MAP_STYLE_URL_DARK = 'https://tiles.openfreemap.org/styles/dark';

export function mapStyleUrl(isDark: boolean): string {
  return isDark ? MAP_STYLE_URL_DARK : MAP_STYLE_URL;
}

export const MAP_ATTRIBUTION = '© OpenMapTiles © OpenStreetMap contributors';

/**
 * Modulul nativ MapLibre există în build? Fals când bundle-ul JS e mai nou decât APK-ul
 * (ex. dev-client vechi + Metro nou) — atunci arătăm lista în loc să crăpăm la montare.
 */
export function isMapNativeAvailable(): boolean {
  return (NativeModules as Record<string, unknown>).MLRNModule != null;
}

/**
 * Fonts served by the OpenFreeMap glyph endpoint. Any SymbolLayer with text
 * MUST set one: the MapLibre default ("Open Sans Regular") 404s there and
 * the whole layer — icons included — silently stops rendering.
 */
export const MAP_FONT_REGULAR = ['Noto Sans Regular'];
export const MAP_FONT_BOLD = ['Noto Sans Bold'];

/**
 * Map-label colours belong to the base map, not to the app theme palette:
 * Google-Maps transit blue on a white halo on the light tiles, light blue on
 * a dark halo on the dark tiles.
 */
export const MAP_TRANSIT_LABEL = '#1967D2';
export const MAP_LABEL_HALO = '#FFFFFF';
export const MAP_TRANSIT_LABEL_DARK = '#8AB4F8';
export const MAP_LABEL_HALO_DARK = '#202124';
