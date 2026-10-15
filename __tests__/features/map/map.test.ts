import { MAP_ATTRIBUTION, MAP_STYLE_URL, isMapNativeAvailable } from '../../../src/features/map';

describe('stil hartă (maplibre)', () => {
  it('folosește tile-uri gratuite fără cheie', () => {
    expect(MAP_STYLE_URL).toContain('tiles.openfreemap.org');
    expect(MAP_ATTRIBUTION).toContain('OpenStreetMap');
  });

  it('raportează modulul nativ lipsă în jest (fără native)', () => {
    expect(isMapNativeAvailable()).toBe(false);
  });
});
