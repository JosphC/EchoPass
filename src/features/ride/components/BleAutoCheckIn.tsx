import { useQueryClient } from '@tanstack/react-query';
import { t } from '../../../core/i18n';
import type { BusPosition } from '../../../services/api/schemas/bus';
import { findRoute } from '../../../services/repositories/gtfs/timetable';
import { useBusPresence } from '../../detection';
import { useBuses } from '../../map';
import type { DetectedVehicle } from '../rideStore';
import { useRideStore } from '../rideStore';
import { useRideDetector } from '../hooks/useRideDetector';

function modeLabel(line: string): string {
  const mode = findRoute(line)?.mode;
  if (mode === 'tram') return t('common.modeTram');
  if (mode === 'trolley') return t('common.modeTrolley');
  return t('common.modeBus');
}

/**
 * Automatic BLE check-in / check-out. Renders nothing; mount once at the
 * root. Boarding resolves the advertised vehicle id against the live fleet
 * (the server still cross-checks with GPS before charging); alighting from
 * the vehicle of the active ride closes it.
 */
export function BleAutoCheckIn() {
  const client = useQueryClient();
  const { buses } = useBuses();
  const { handleDetected, clearRide } = useRideDetector();

  useBusPresence(true, {
    onEnter: (vehicleId) => {
      const state = useRideStore.getState();
      if (state.status !== 'idle' && state.activeRide?.vehicleId === vehicleId) return;
      const bus = buses.find((b) => b.id === vehicleId);
      if (!bus) return;
      const position = client.getQueryData<BusPosition[]>(['positions'])?.find((p) => p.busId === vehicleId);
      const vehicle: DetectedVehicle = {
        line: bus.line,
        vehicleId,
        vehicleType: modeLabel(bus.line),
        station: position?.nextStop ?? '',
        destination: bus.destination,
      };
      void handleDetected(vehicle);
    },
    onLeave: (vehicleId) => {
      if (useRideStore.getState().activeRide?.vehicleId === vehicleId) clearRide();
    },
  });

  return null;
}
