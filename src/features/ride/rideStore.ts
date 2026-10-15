import { create } from 'zustand';
import { formatTransitTime } from '../../core/utils/timezone';

export interface DetectedVehicle {
  line: string;
  vehicleId: string;
  vehicleType: string;
  station: string;
  destination: string;
  rssi?: number;
  clusterCount?: number;
}

export interface ActiveRideState {
  line: string;
  vehicleId: string;
  passengers: number;
  amount: number;
  station: string;
  destination: string;
  startedAt: string;
  chargeId: string;
  isTransfer?: boolean;
  originalLine?: string;
  expiresAtMs?: number;
  transferStation?: string;
  transferAt?: string;
}

export interface ActiveTicketState {
  ticketId: string;
  originalLine: string;
  currentLine: string;
  passengers: number;
  startedAtMs: number;
  expiresAtMs: number;
  chargeId: string;
  isTransfer: boolean;
  transfersCount: number;
  destination?: string;
  station?: string;
  transferStation?: string;
  transferAt?: string;
}

export type RideDetectionStatus = 'idle' | 'detected' | 'validating' | 'active';

interface RideState {
  status: RideDetectionStatus;
  detectedVehicle: DetectedVehicle | null;
  passengerCount: number;
  activeRide: ActiveRideState | null;
  activeTicket: ActiveTicketState | null;
  toastMessage: string | null;

  detectVehicle: (vehicle: DetectedVehicle) => void;
  setPassengerCount: (count: number) => void;
  incrementPassengers: () => void;
  decrementPassengers: () => void;
  dismissDetection: () => void;
  setActiveRide: (ride: ActiveRideState) => void;
  startTicket: (ticket: ActiveTicketState) => void;
  applyTransfer: (vehicle: DetectedVehicle, nowMs?: number) => number;
  setToastMessage: (msg: string | null) => void;
  clearRide: (nowMs?: number) => void;
  resetAll: () => void;
}

export const useRideStore = create<RideState>()((set, get) => ({
  status: 'idle',
  detectedVehicle: null,
  passengerCount: 1,
  activeRide: null,
  activeTicket: null,
  toastMessage: null,

  detectVehicle: (vehicle) =>
    set({ detectedVehicle: vehicle, status: 'detected', passengerCount: 1 }),

  setPassengerCount: (count) =>
    set({ passengerCount: Math.min(10, Math.max(1, count)) }),

  incrementPassengers: () =>
    set((s) => ({ passengerCount: Math.min(10, s.passengerCount + 1) })),

  decrementPassengers: () =>
    set((s) => ({ passengerCount: Math.max(1, s.passengerCount - 1) })),

  dismissDetection: () =>
    set({ status: 'idle', detectedVehicle: null, passengerCount: 1 }),

  setActiveRide: (ride) =>
    set({ activeRide: ride, status: 'active', detectedVehicle: null }),

  startTicket: (ticket) =>
    set({ activeTicket: ticket }),

  applyTransfer: (vehicle, nowMs = Date.now()) => {
    const { activeTicket } = get();
    const remainingMin = activeTicket ? Math.max(1, Math.round((activeTicket.expiresAtMs - nowMs) / 60000)) : 25;
    const expiresAtMs = activeTicket?.expiresAtMs ?? nowMs + remainingMin * 60000;
    const origLine = activeTicket?.originalLine ?? '15';
    const passengers = activeTicket?.passengers ?? 1;
    const chargeId = activeTicket?.chargeId ?? `transfer-${Date.now()}`;
    const startedAt = formatTransitTime(nowMs);

    set({
      status: 'active',
      detectedVehicle: null,
      activeRide: {
        line: vehicle.line, vehicleId: vehicle.vehicleId, passengers, amount: 0,
        station: vehicle.station, destination: vehicle.destination, startedAt,
        chargeId, isTransfer: true, originalLine: origLine, expiresAtMs,
        transferStation: vehicle.station, transferAt: startedAt,
      },
      activeTicket: activeTicket
        ? {
            ...activeTicket, currentLine: vehicle.line, destination: vehicle.destination,
            station: vehicle.station, transferStation: vehicle.station, transferAt: startedAt,
            isTransfer: true, transfersCount: activeTicket.transfersCount + 1,
          }
        : null,
    });
    return remainingMin;
  },

  setToastMessage: (msg) => set({ toastMessage: msg }),

  clearRide: (nowMs = Date.now()) => {
    const { activeTicket } = get();
    const ticketStillValid = Boolean(activeTicket && activeTicket.expiresAtMs > nowMs);
    set({ status: 'idle', activeRide: null, detectedVehicle: null, passengerCount: 1, activeTicket: ticketStillValid ? activeTicket : null });
  },

  resetAll: () =>
    set({ status: 'idle', detectedVehicle: null, passengerCount: 1, activeRide: null, activeTicket: null, toastMessage: null }),
}));
