import type { Repositories } from '../types';
import { createBusMock } from './busMock';
import { createNotificationMock } from './notificationMock';
import { createReportMock } from './reportMock';
import { createTripMock } from './tripMock';
import { createWalletMock } from './walletMock';

export function createMockRepositories(): Repositories {
  return {
    wallet: createWalletMock(),
    bus: createBusMock(),
    report: createReportMock(),
    trip: createTripMock(),
    notification: createNotificationMock(),
  };
}
