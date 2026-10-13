import { searchLocalPlaces, stationToPlace } from '../../../src/features/map/places';
import { loadStations } from '../../../src/features/map/stations';
import { planTransit } from '../../../src/features/planner/transit';

describe('Places & Free Multimodal Search', () => {
  it('finds Cămin 9C by exact and typo queries', () => {
    const resultsExact = searchLocalPlaces('camin 9c');
    expect(resultsExact.length).toBeGreaterThan(0);
    expect(resultsExact[0].name).toBe('Cămin 9C');
    expect(resultsExact[0].kind).toBe('poi');
    expect(resultsExact[0].lat).toBeCloseTo(45.7492, 2);

    const resultsTypo = searchLocalPlaces('cmain 9c');
    expect(resultsTypo.length).toBeGreaterThan(0);
    expect(resultsTypo.some((p) => p.name === 'Cămin 9C')).toBe(true);
  });

  it('finds Schaeffler România', () => {
    const results = searchLocalPlaces('schaeffler');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Schaeffler România');
    expect(results[0].kind).toBe('poi');
    expect(results[0].lat).toBeCloseTo(45.7825, 2);
  });

  it('finds STPT transit stations alongside POIs', () => {
    const stations = loadStations();
    const firstStation = stations[0];
    const results = searchLocalPlaces(firstStation.name);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.kind === 'station')).toBe(true);
  });

  it('stationToPlace maps a Station correctly', () => {
    const sampleStation = loadStations()[0];
    const place = stationToPlace(sampleStation);
    expect(place.id).toBe(`station-${sampleStation.id}`);
    expect(place.name).toBe(sampleStation.name);
    expect(place.kind).toBe('station');
    expect(place.station).toBe(sampleStation);
  });

  it('calculates full multimodal route with initial walk, bus ride and destination walk from Cămin 9C to Schaeffler', () => {
    const camin9c = searchLocalPlaces('camin 9c')[0];
    const schaeffler = searchLocalPlaces('schaeffler')[0];

    const options = planTransit(
      { station: null, coords: { lat: camin9c.lat, lng: camin9c.lng }, name: camin9c.name },
      { coords: { lat: schaeffler.lat, lng: schaeffler.lng }, name: schaeffler.name },
      [],
    );

    expect(options.length).toBeGreaterThan(0);
    const best = options[0];

    // Must have at least 2 legs (walk + ride or walk + ride + walk)
    expect(best.legs.length).toBeGreaterThanOrEqual(2);

    // Initial leg is walking from Cămin 9C to the board station
    expect(best.legs[0].kind).toBe('walk');
    expect(best.legs[0].minutes).toBeGreaterThan(0);

    // Ride leg is using STPT line
    const rideLeg = best.legs.find((l) => l.kind === 'ride');
    expect(rideLeg).toBeDefined();
    expect(rideLeg?.line).toBeDefined();

    // Final leg is walking to Schaeffler if alight station is not right at destination
    const lastLeg = best.legs[best.legs.length - 1];
    if (lastLeg.kind === 'walk' && best.legs.length > 2) {
      expect(lastLeg.toName).toBe('Schaeffler România');
      expect(lastLeg.minutes).toBeGreaterThan(0);
    }
  });
});
