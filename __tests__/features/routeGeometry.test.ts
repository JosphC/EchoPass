import { decodePolyline6, fetchWalkingGeometry } from '../../src/features/planner/routeGeometry';
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

  describe('pedestrian router order', () => {
    const from = { lat: 45.7537, lng: 21.2257 };
    const to = { lat: 45.7577, lng: 21.2287 };
    const realFetch = globalThis.fetch;
    afterEach(() => {
      globalThis.fetch = realFetch;
    });

    it('asks Valhalla (pedestrian) first and never the car-only OSRM demo when it answers', async () => {
      const calls: string[] = [];
      globalThis.fetch = jest.fn(async (url: RequestInfo | URL) => {
        calls.push(String(url));
        return { ok: true, json: async () => ({ trip: { legs: [{ shape: 'c_igvAoqnog@b[~MnhC~p@' }] } }) } as Response;
      }) as typeof fetch;
      const path = await fetchWalkingGeometry([from, to]);
      expect(calls).toHaveLength(1);
      expect(calls[0]).toContain('valhalla');
      expect(path[0]).toEqual(from);
      expect(path[path.length - 1]).toEqual(to);
    });

    it('falls back to OSRM, then to the straight line', async () => {
      const calls: string[] = [];
      globalThis.fetch = jest.fn(async (url: RequestInfo | URL) => {
        calls.push(String(url));
        return { ok: false, json: async () => ({}) } as Response;
      }) as typeof fetch;
      const shifted = { lat: from.lat + 0.001, lng: from.lng };
      const path = await fetchWalkingGeometry([shifted, to]);
      expect(calls[0]).toContain('valhalla');
      expect(calls[1]).toContain('router.project-osrm.org');
      expect(path).toEqual([shifted, to]);
    });
  });
});
