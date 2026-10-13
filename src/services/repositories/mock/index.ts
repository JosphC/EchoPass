import type { Repositories } from '../types';
import { createArrivalsMock } from './arrivalsMock';
import { createBusMock } from './busMock';
import { createNotificationMock } from './notificationMock';
import { createReportMock } from './reportMock';
import { createTripMock } from './tripMock';
import { createWalletRepoMock } from './walletRepo.mock';

export function createMockRepositories(): Repositories {
  return {
    wallet: createWalletRepoMock(),
    bus: createBusMock(),
    report: createReportMock(),
    trip: createTripMock(),
    notification: createNotificationMock(),
    arrivals: createArrivalsMock(),
  };
}
