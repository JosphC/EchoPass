import type { Bus, BusPosition } from '../api/schemas/bus';
import type { AppNotification } from '../api/schemas/notification';
import type { Report, ReportKind } from '../api/schemas/report';
import type { RecentTrip, SavedRoute } from '../api/schemas/trip';
import type { Charge, DailyCap, Pass, PaymentMethod } from '../api/schemas/wallet';

export interface WalletRepo {
  getPass(): Promise<Pass>;
  getPaymentMethod(): Promise<PaymentMethod>;
  getDailyCap(): Promise<DailyCap>;
  getCharges(): Promise<Charge[]>;
}

export interface BusRepo {
  getBuses(): Promise<Bus[]>;
  getPositions(): Promise<BusPosition[]>;
}

export interface ReportRepo {
  getReports(): Promise<Report[]>;
  submitReport(kind: ReportKind, line: string): Promise<Report>;
  confirmReport(id: string): Promise<Report>;
}

export interface TripRepo {
  getSavedRoutes(): Promise<SavedRoute[]>;
  getRecentTrips(): Promise<RecentTrip[]>;
}

export interface NotificationRepo {
  getNotifications(): Promise<AppNotification[]>;
  markRead(id: string): Promise<void>;
}

export interface Repositories {
  wallet: WalletRepo;
  bus: BusRepo;
  report: ReportRepo;
  trip: TripRepo;
  notification: NotificationRepo;
}
