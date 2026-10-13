import { PASS_PRODUCTS } from '../../../src/features/wallet/passCatalog';

describe('STPT pass catalog (official tariffs 31.07.2025)', () => {
  it('contains all 7 subscription products', () => {
    expect(PASS_PRODUCTS).toHaveLength(7);
  });

  it('matches official prices and durations', () => {
    const byId = new Map(PASS_PRODUCTS.map((p) => [p.id, p]));
    expect(byId.get('general-30')).toMatchObject({ priceRon: 160, days: 30 });
    expect(byId.get('linie-30')).toMatchObject({ priceRon: 120, days: 30 });
    expect(byId.get('expres-30')).toMatchObject({ priceRon: 140, days: 30 });
    expect(byId.get('general-365')).toMatchObject({ priceRon: 1320, days: 365 });
    expect(byId.get('nominalizat-30')).toMatchObject({ priceRon: 240, days: 30 });
    expect(byId.get('nominalizat-30-plus')).toMatchObject({ priceRon: 160, days: 30 });
    expect(byId.get('nenominalizat-30')).toMatchObject({ priceRon: 300, days: 30 });
  });
});
