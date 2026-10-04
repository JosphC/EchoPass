import { loadStations, searchStations, trolleybusesAt, type Station } from '../../src/features/map';
import type { BusMarker } from '../../src/features/map';

function marker(line: string): BusMarker {
  return {
    bus: { id: `${line}-1`, line, destination: 'X', crowd: 1, delayMin: 0, delayReason: null },
    position: { busId: `${line}-1`, lat: 45.75, lng: 21.22, nextStop: 'S', arrivesInMin: 0, updatedAt: '2026-10-04T09:00:00Z' },
  };
}

const station: Station = { id: '1', name: 'Catedrala', lat: 45.75, lng: 21.22, lines: ['11', '2'] };

describe('stations', () => {
  it('loads the validated GTFS asset', () => {
    const stations = loadStations();
    expect(stations.length).toBeGreaterThan(800);
    expect(stations.every((s) => s.lines.length > 0)).toBe(true);
  });

  it('searches by substring and caps results', () => {
    const stations = loadStations();
    const hits = searchStations(stations, 'catedrala');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((s) => s.name.toLowerCase().includes('catedrala'))).toBe(true);
    expect(searchStations(stations, 'x')).toEqual([]);
  });

  it('keeps only trolleybuses serving the station', () => {
    const markers = [marker('11'), marker('14'), marker('2'), marker('33')];
    const filtered = trolleybusesAt(markers, station);
    expect(filtered.map((m) => m.bus.line)).toEqual(['11']);
  });
});
