import { hasMapKey } from '../../src/features/map';

describe('map key (faza 5)', () => {
  it('reports no key in jest (list fallback active)', () => {
    expect(hasMapKey()).toBe(false);
  });
});
