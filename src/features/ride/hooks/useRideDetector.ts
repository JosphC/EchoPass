import { useCallback } from 'react';
import { t } from '../../../core/i18n';
import { useSettingsStore } from '../../settings';
import { useAutoCharge } from '../../wallet';
import { useRideStore, type DetectedVehicle } from '../rideStore';

const DEFAULT_MOCK_VEHICLE: DetectedVehicle = {
  line: '15',
  vehicleId: '3114',
  vehicleType: 'Troleibuz',
  station: 'Piața Mărăști',
  destination: 'T. Grozăvescu (Poșta Mare)',
  rssi: -62,
  clusterCount: 3,
};

export const TRAM_MOCK_VEHICLE: DetectedVehicle = {
  line: '1',
  vehicleId: '102',
  vehicleType: 'Tramvai',
  station: 'Complex Studențesc',
  destination: 'Gara de Nord',
  rssi: -58,
  clusterCount: 4,
};

export function useRideDetector() {
  const askBeforeCharge = useSettingsStore((s) => s.askBeforeCharge);
  const status = useRideStore((s) => s.status);
  const detectedVehicle = useRideStore((s) => s.detectedVehicle);
  const passengerCount = useRideStore((s) => s.passengerCount);
  const activeRide = useRideStore((s) => s.activeRide);
  const activeTicket = useRideStore((s) => s.activeTicket);
  const toastMessage = useRideStore((s) => s.toastMessage);

  const detectVehicle = useRideStore((s) => s.detectVehicle);
  const setPassengerCount = useRideStore((s) => s.setPassengerCount);
  const incrementPassengers = useRideStore((s) => s.incrementPassengers);
  const decrementPassengers = useRideStore((s) => s.decrementPassengers);
  const dismissDetection = useRideStore((s) => s.dismissDetection);
  const setActiveRide = useRideStore((s) => s.setActiveRide);
  const startTicket = useRideStore((s) => s.startTicket);
  const applyTransfer = useRideStore((s) => s.applyTransfer);
  const setToastMessage = useRideStore((s) => s.setToastMessage);
  const clearRide = useRideStore((s) => s.clearRide);
  const resetAll = useRideStore((s) => s.resetAll);

  const { startRideCharge, confirmRideCharge } = useAutoCharge();

  const handleDetected = useCallback(
    async (vehicle: DetectedVehicle, nowMs = Date.now()) => {
      const ticket = useRideStore.getState().activeTicket;
      if (ticket && ticket.expiresAtMs > nowMs) {
        const remainingMin = applyTransfer(vehicle, nowMs);
        setToastMessage(
          `${t('ride.freeTransfer')} ${t('ride.transferActive')} · ${t('plan.line')} ${vehicle.line} · ${remainingMin} ${t('ride.minLeft')}`,
        );
        return;
      }
      if (askBeforeCharge) {
        detectVehicle(vehicle);
        return;
      }
      try {
        const result = await startRideCharge(vehicle.line, nowMs, 1);
        if (result) {
          const startedAt = new Date(nowMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const expiresAtMs = nowMs + 60 * 60 * 1000;
          setActiveRide({
            line: vehicle.line, vehicleId: vehicle.vehicleId, passengers: 1, amount: result.charge.amount,
            station: vehicle.station, destination: vehicle.destination, startedAt, chargeId: result.charge.id, expiresAtMs,
          });
          startTicket({
            ticketId: `tkt-${result.charge.id}`, originalLine: vehicle.line, currentLine: vehicle.line,
            passengers: 1, startedAtMs: nowMs, expiresAtMs, chargeId: result.charge.id, isTransfer: false, transfersCount: 0,
            destination: vehicle.destination, station: vehicle.station,
          });
          const fareStr = result.coveredByPass ? t('ride.pass') : `${result.charge.amount.toFixed(2).replace('.', ',')} lei`;
          setToastMessage(`${t('plan.line')} ${vehicle.line} · 1 ${t('ride.person')} · ${fareStr}`);
        }
      } catch {
        detectVehicle(vehicle);
      }
    },
    [applyTransfer, askBeforeCharge, detectVehicle, setActiveRide, setToastMessage, startRideCharge, startTicket],
  );

  const confirmBoarding = useCallback(
    async (overridePassengers?: number, nowMs = Date.now()) => {
      const vehicle = detectedVehicle ?? DEFAULT_MOCK_VEHICLE;
      const passengers = overridePassengers ?? passengerCount;
      const result = await confirmRideCharge(vehicle.line, nowMs, passengers);
      const startedAt = new Date(nowMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const expiresAtMs = nowMs + 60 * 60 * 1000;
      setActiveRide({
        line: vehicle.line, vehicleId: vehicle.vehicleId, passengers, amount: result.charge.amount,
        station: vehicle.station, destination: vehicle.destination, startedAt, chargeId: result.charge.id, expiresAtMs,
      });
      startTicket({
        ticketId: `tkt-${result.charge.id}`, originalLine: vehicle.line, currentLine: vehicle.line,
        passengers, startedAtMs: nowMs, expiresAtMs, chargeId: result.charge.id, isTransfer: false, transfersCount: 0,
        destination: vehicle.destination, station: vehicle.station,
      });
      const fareStr = result.charge.amount === 0 ? t('ride.pass') : `${result.charge.amount.toFixed(2).replace('.', ',')} lei`;
      const passText = `${passengers} ${passengers === 1 ? t('ride.person') : t('ride.people')}`;
      setToastMessage(`${t('plan.line')} ${vehicle.line} · ${passText} · ${fareStr}`);
    },
    [confirmRideCharge, detectedVehicle, passengerCount, setActiveRide, setToastMessage, startTicket],
  );

  const simulateBoarding = useCallback(
    (custom?: Partial<DetectedVehicle>) => {
      const vehicle: DetectedVehicle = { ...DEFAULT_MOCK_VEHICLE, ...custom };
      void handleDetected(vehicle);
    },
    [handleDetected],
  );

  const simulateTransfer = useCallback(
    (custom?: Partial<DetectedVehicle>, remainingMin = 25) => {
      const now = Date.now();
      const currentTicket = useRideStore.getState().activeTicket;
      if (!currentTicket) {
        startTicket({
          ticketId: `tkt-sim-${now}`, originalLine: '15', currentLine: '15', passengers: 1,
          startedAtMs: now - (60 - remainingMin) * 60000, expiresAtMs: now + remainingMin * 60000,
          chargeId: `ch-sim-${now}`, isTransfer: false, transfersCount: 0,
        });
      }
      const vehicle: DetectedVehicle = { ...TRAM_MOCK_VEHICLE, ...custom };
      void handleDetected(vehicle, now);
    },
    [handleDetected, startTicket],
  );

  return {
    status, detectedVehicle, passengerCount, activeRide, activeTicket, toastMessage,
    setPassengerCount, incrementPassengers, decrementPassengers, dismissDetection,
    confirmBoarding, simulateBoarding, simulateTransfer, clearRide, resetAll, setToastMessage, handleDetected,
  };
}
