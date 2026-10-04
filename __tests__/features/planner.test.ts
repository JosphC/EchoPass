import { buildRouteOptions, sortOptions } from '../../src/features/planner/options';
import { seedBuses } from '../../src/services/repositories/mock/seed';

describe('planner options (faza 5)', () => {
  it('builds walk+ride options from live buses', () => {
    const options = buildRouteOptions('Acasa', 'Birou', seedBuses);
    expect(options).toHaveLength(3);
    expect(options[0].steps.map((s) => s.kind)).toEqual(['walk', 'ride']);
  });

  it('returns empty without endpoints or buses', () => {
    expect(buildRouteOptions('', 'Birou', seedBuses)).toEqual([]);
    expect(buildRouteOptions('Acasa', 'Birou', [])).toEqual([]);
  });

  it('sorts by fastest, cheapest and roomiest', () => {
    const options = buildRouteOptions('Acasa', 'Birou', seedBuses);
    const fastest = sortOptions(options, 'fastest');
    expect(fastest[0].durationMin).toBeLessThanOrEqual(fastest[1].durationMin);
    const roomiest = sortOptions(options, 'roomiest');
    expect(roomiest[0].crowd).toBeLessThanOrEqual(roomiest[1].crowd);
  });
});
