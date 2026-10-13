import type { Bus, BusPosition } from '../../api/schemas/bus';
import type { AppNotification } from '../../api/schemas/notification';
import type { Report } from '../../api/schemas/report';
import type { RecentTrip, SavedRoute } from '../../api/schemas/trip';
import type { Charge, DailyCap, WalletItem } from '../../api/schemas/wallet';

export const seedWalletItems: WalletItem[] = [
  { kind: 'card', id: 'card-1', network: 'visa', last4: '4021', holder: 'Ion Popescu', expiry: '11/28', token: 'tok_mock_card-1', bank: 'Nova Bank', tag: 'Principal' },
  { kind: 'card', id: 'card-2', network: 'mastercard', last4: '7718', holder: 'Ion Popescu', expiry: '03/27', token: 'tok_mock_card-2', bank: 'Meridian', tag: 'Economii' },
  {
    kind: 'pass',
    id: 'pass-1',
    name: 'Abonament lunar',
    holder: 'Ion Popescu',
    validFrom: '2026-10-03',
    validUntil: '2026-11-02',
    lines: 'all',
    theme: 'ocean',
    cardNumber: '090100428669',
  },
];

export const seedDailyCap: DailyCap = { limitRon: 8, spentRon: 6 };

export const seedCharges: Charge[] = [
  { id: 'ch-1', line: '15', destination: 'T. Grozăvescu (Poșta Mare)', amount: 3, currency: 'RON', status: 'completed', paidWith: 'card-1', startedAt: '2026-10-03T07:42:00Z', endedAt: '2026-10-03T08:05:00Z', qrToken: 'qr_mock_ch-1' },
  { id: 'ch-2', line: '12', destination: 'Spital', amount: 3, currency: 'RON', status: 'completed', paidWith: 'card-1', startedAt: '2026-10-02T17:15:00Z', endedAt: '2026-10-02T17:40:00Z', qrToken: 'qr_mock_ch-2' },
  { id: 'ch-3', line: '32', destination: 'Sud', amount: 2, currency: 'RON', status: 'capped', paidWith: 'card-1', startedAt: '2026-10-02T08:05:00Z', endedAt: '2026-10-02T08:30:00Z', qrToken: 'qr_mock_ch-3' },
];

export const seedBuses: Bus[] = [
  { id: 'bus-17a', line: '17', destination: 'Centru', crowd: 2, delayMin: 4, delayReason: 'Trafic' },
  { id: 'bus-11a', line: '11', destination: 'Gara de Nord', crowd: 1, delayMin: 0, delayReason: null },
  { id: 'bus-14a', line: '14', destination: 'Spitalul Municipal', crowd: 3, delayMin: 0, delayReason: null },
];

export const seedPositions: BusPosition[] = [
  { busId: 'bus-17a', lat: 45.7645, lng: 21.2315, nextStop: 'Piața Mărăști', arrivesInMin: 2, updatedAt: '2026-10-03T09:00:00Z' },
  { busId: 'bus-11a', lat: 45.763, lng: 21.222, nextStop: 'Spitalul Municipal', arrivesInMin: 5, updatedAt: '2026-10-03T09:00:00Z' },
  { busId: 'bus-14a', lat: 45.752, lng: 21.228, nextStop: 'Piața Timișoara 700', arrivesInMin: 8, updatedAt: '2026-10-03T09:00:00Z' },
];

export const seedReports: Report[] = [
  { id: 'rep-1', kind: 'traffic', line: '17', stopName: 'Piața Mărăști', confirmations: 3, expiresAt: '2027-10-03T09:20:00Z', createdAt: '2026-10-03T07:12:00Z' },
  { id: 'rep-2', kind: 'crowding', line: '11', stopName: 'Spitalul Municipal', confirmations: 1, expiresAt: '2027-10-03T09:20:00Z', createdAt: '2026-10-03T08:40:00Z' },
];

export const seedSavedRoutes: SavedRoute[] = [
  { id: 'sr-1', from: 'Acasa', to: 'Birou', line: '5' },
  { id: 'sr-2', from: 'Birou', to: 'Gara Centrala', line: '12' },
];

export const seedRecentTrips: RecentTrip[] = [
  { id: 'rt-1', from: 'Acasă', to: 'Birou', date: '2026-10-03', time: '07:42', line: '5', fareRon: 3, distanceKm: 7.2, durationMin: 18 },
  { id: 'rt-2', from: 'Birou', to: 'Gara Centrală', date: '2026-10-02', time: '17:10', line: '12', fareRon: 3, distanceKm: 5.4, durationMin: 25 },
  { id: 'rt-3', from: 'Gara Centrală', to: 'Piața Unirii', date: '2026-10-01', time: '08:05', line: '32', fareRon: 3, distanceKm: 12.8, durationMin: 45 },
  { id: 'rt-4', from: 'Piața Unirii', to: 'Cartier Florilor', date: '2026-09-30', time: '13:20', line: '9', fareRon: 2, distanceKm: 3.6, durationMin: 15 },
  { id: 'rt-5', from: 'Cartier Florilor', to: 'Acasă', date: '2026-09-29', time: '19:30', line: '5', fareRon: 3, distanceKm: 4.9, durationMin: 20 },
];

export const seedNotifications: AppNotification[] = [
  { id: 'n-1', kind: 'charge', title: 'Plata calatorie', body: 'Linia 5: 3 lei, la coborare.', createdAt: '2026-10-03T07:42:00Z', read: false },
  { id: 'n-2', kind: 'delay', title: 'Intarziere linia 32', body: 'Lucrari: +9 min.', createdAt: '2026-10-03T07:15:00Z', read: false },
  { id: 'n-3', kind: 'cap', title: 'Plafon aproape atins', body: 'Ai cheltuit 6 din 8 lei azi.', createdAt: '2026-10-02T17:15:00Z', read: true },
  { id: 'n-4', kind: 'renewal', title: 'Abonament expira', body: 'Reinnoieste in 30 de zile.', createdAt: '2026-10-01T09:00:00Z', read: true },
];
