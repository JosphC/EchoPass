import type { Arrival, ArrivalsQuery } from '../api/schemas/arrival';
import type { Bus, BusPosition } from '../api/schemas/bus';
import type { AppNotification } from '../api/schemas/notification';
import type { Report, ReportKind } from '../api/schemas/report';
import type { RecentTrip, SavedRoute } from '../api/schemas/trip';
import type { Charge, ChargeStatus, DailyCap, NewCardInput, NewPassInput, WalletItem } from '../api/schemas/wallet';

export interface CreateChargeInput {
  line: string;
  amount: number;
  paidWith: string;
  status: ChargeStatus;
}

export interface UpdateChargeInput {
  amount?: number;
  status?: ChargeStatus;
  endedAt?: string;
}

export interface WalletRepo {
  getDailyCap(): Promise<DailyCap>;
  listItems(): Promise<WalletItem[]>;
  addCard(input: NewCardInput): Promise<WalletItem>;
  addPass(input: NewPassInput): Promise<WalletItem>;
  removeItem(id: string): Promise<void>;
  setDefaultSource(id: string): Promise<void>;
  renewPass(id: string, days?: number): Promise<WalletItem>;
  listCharges(): Promise<Charge[]>;
  createCharge(input: CreateChargeInput): Promise<Charge>;
  updateCharge(id: string, patch: UpdateChargeInput): Promise<Charge>;
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

export interface StopArrivalsRepo {
  getArrivals(stopId: string, query: ArrivalsQuery, nowMs?: number): Promise<Arrival[]>;
}

export interface Repositories {
  wallet: WalletRepo;
  bus: BusRepo;
  report: ReportRepo;
  trip: TripRepo;
  notification: NotificationRepo;
  arrivals: StopArrivalsRepo;
}
