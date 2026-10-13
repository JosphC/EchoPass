import { decodePolyline6 } from '../../src/features/planner/routeGeometry';
import { walkMin } from '../../src/features/planner/transitHelpers';

describe('walking geometry', () => {
  it('decodes a Valhalla polyline6 shape', () => {
    const decoded = decodePolyline6('c_igvAoqnog@b[~MnhC~p@');
    expect(decoded).toHaveLength(3);
    expect(decoded[0].lat).toBeCloseTo(45.74925, 5);
    expect(decoded[0].lng).toBeCloseTo(21.24164, 5);
    expect(decoded[1].lat).toBeCloseTo(45.7488, 5);
    expect(decoded[2].lat).toBeCloseTo(45.7466, 5);
    expect(decoded[2].lng).toBeCloseTo(21.2406, 5);
  });

  it('decodes an empty shape to no points', () => {
    expect(decodePolyline6('')).toEqual([]);
  });

  it('estimates walking time with a road factor, not straight-line speed', () => {
    // 1 km straight: 1/4.5*60 = ~13 min optimistic, ~17 min realistic.
    const minutes = walkMin({ lat: 45.74925, lng: 21.24164 }, { lat: 45.75824, lng: 21.24164 });
    expect(minutes).toBeGreaterThan(13);
    expect(minutes).toBeLessThan(25);
  });
});
