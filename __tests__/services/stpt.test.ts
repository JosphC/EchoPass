import { parseStptEnvelope } from '../../src/services/repositories/real/stpt/schemas';
import { mapVehicleToBus, mapVehicleToPosition } from '../../src/services/repositories/real/stpt/mapper';
import { createStptBusRepo } from '../../src/services/repositories/real/busRepo';

const vehicle = {
  id: '1805',
  lat: 45.76168,
  lng: 21.244579,
  bearing: 64.1,
  speed: 34.1,
  route: '11',
  directionId: '0',
  headsign: 'Arena Aqua',
  stop: 'Piata Badea Cartan',
  timestamp: 1791054983000,
  isAccessible: true,
  routeId: 'R_TB_11',
  tripId: '11.1_WESB_T_02_17',
  shapeId: '11.1_T',
};

describe('stpt adapter (faza 5)', () => {
  it('parses the live envelope and maps a trolleybus', () => {
    const envelope = parseStptEnvelope({ success: true, data: { vehicles: [vehicle], age_seconds: 16, is_stale: false } });
    expect(envelope.data.vehicles).toHaveLength(1);
    expect(mapVehicleToBus(vehicle).line).toBe('11');
    expect(mapVehicleToBus(vehicle).crowd).toBe(1);
    const pos = mapVehicleToPosition(vehicle);
    expect(pos.lat).toBeCloseTo(45.76168);
    expect(pos.nextStop).toBe('Piata Badea Cartan');
  });

  it('rejects bad payloads at the boundary', () => {
    expect(() => parseStptEnvelope({ success: false })).toThrow();
    expect(() => parseStptEnvelope({ success: true, data: { vehicles: [{ id: 'x' }], age_seconds: 1, is_stale: false } })).toThrow();
  });

  it('shares one snapshot between buses and positions', async () => {
    const realFetch = globalThis.fetch;
    const envelope = { success: true, data: { vehicles: [vehicle], age_seconds: 5, is_stale: false } };
    const spy = jest.fn().mockResolvedValue({ ok: true, json: async () => envelope });
    globalThis.fetch = spy as unknown as typeof fetch;
    try {
      const repo = createStptBusRepo();
      const [buses, positions] = await Promise.all([repo.getBuses(), repo.getPositions()]);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(buses[0].id).toBe(positions[0].busId);
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it('falls back to mocks on stale feeds and network errors', async () => {
    const realFetch = globalThis.fetch;
    const stale = { success: true, data: { vehicles: [], age_seconds: 900, is_stale: true } };
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => stale }) as unknown as typeof fetch;
    try {
      await expect(createStptBusRepo().getBuses()).resolves.toHaveLength(3);
    } finally {
      globalThis.fetch = realFetch;
    }
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    try {
      const repo = createStptBusRepo();
      await expect(repo.getBuses()).resolves.toHaveLength(3);
      await expect(repo.getPositions()).resolves.toHaveLength(3);
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
