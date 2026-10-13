/**
 * Official STPT Timișoara subscription catalog
 * (https://stpt.ro/bilete-si-abonamente/, tariffs updated 31.07.2025, VAT included).
 * Renewal extends validity by the product's days; only the wait is estimated.
 */
export interface PassProduct {
  id: string;
  days: number;
  priceRon: number;
  category: 'personal' | 'company';
  nameRo: string;
  nameEn: string;
  coverageRo: string;
  coverageEn: string;
}

export const PASS_PRODUCTS: PassProduct[] = [
  {
    id: 'general-30',
    days: 30,
    priceRon: 160,
    category: 'personal',
    nameRo: 'General – 30 de zile',
    nameEn: 'General – 30 days',
    coverageRo: 'Toate liniile: tramvai / troleibuz / expres / metropolitan',
    coverageEn: 'All lines: tram / trolleybus / express / metropolitan',
  },
  {
    id: 'linie-30',
    days: 30,
    priceRon: 120,
    category: 'personal',
    nameRo: '1 linie – 30 de zile',
    nameEn: '1 line – 30 days',
    coverageRo: 'Tramvai / troleibuz / metropolitan',
    coverageEn: 'Tram / trolleybus / metropolitan',
  },
  {
    id: 'expres-30',
    days: 30,
    priceRon: 140,
    category: 'personal',
    nameRo: '1 linie EXPRES – 30 de zile',
    nameEn: '1 EXPRESS line – 30 days',
    coverageRo: 'Expres',
    coverageEn: 'Express',
  },
  {
    id: 'general-365',
    days: 365,
    priceRon: 1320,
    category: 'personal',
    nameRo: 'Abonament Anual General',
    nameEn: 'Annual General Pass',
    coverageRo: 'Tramvai / troleibuz / expres / metropolitan',
    coverageEn: 'Tram / trolleybus / express / metropolitan',
  },
  {
    id: 'nominalizat-30',
    days: 30,
    priceRon: 240,
    category: 'company',
    nameRo: 'Nominalizate General (1–30 abonamente)',
    nameEn: 'Registered General (1–30 passes)',
    coverageRo: 'Tramvai / troleibuz / expres / metropolitan / vaporetto',
    coverageEn: 'Tram / trolleybus / express / metropolitan / vaporetto',
  },
  {
    id: 'nominalizat-30-plus',
    days: 30,
    priceRon: 160,
    category: 'company',
    nameRo: 'Nominalizate General (peste 30 abonamente)',
    nameEn: 'Registered General (over 30 passes)',
    coverageRo: 'Tramvai / troleibuz / expres / metropolitan / vaporetto',
    coverageEn: 'Tram / trolleybus / express / metropolitan / vaporetto',
  },
  {
    id: 'nenominalizat-30',
    days: 30,
    priceRon: 300,
    category: 'company',
    nameRo: 'Nenominalizate General',
    nameEn: 'Unregistered General',
    coverageRo: 'Tramvai / troleibuz / expres / metropolitan',
    coverageEn: 'Tram / trolleybus / express / metropolitan',
  },
];

export function passCategoryLabel(category: PassProduct['category'], locale: string): string {
  if (category === 'company') return locale === 'ro' ? 'Agenți economici' : 'Companies';
  return locale === 'ro' ? 'Persoane fizice' : 'Individuals';
}
