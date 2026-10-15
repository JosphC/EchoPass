import { useEffect, useRef } from 'react';
import { createBleScanner } from '../ble/scanner';
import { BLE_POLL_MS, stepPresence, type PresenceMap } from '../ble/presence';
import type { BlePoll } from '../types';

export interface BusPresenceHandlers {
  onEnter: (vehicleId: string) => void;
  onLeave: (vehicleId: string) => void;
}

/**
 * Scans on-board BLE transmitters while `enabled` and reports boarding /
 * alighting per vehicle (smoothed RSSI + hysteresis, see `stepPresence`).
 */
export function useBusPresence(enabled: boolean, handlers: BusPresenceHandlers): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return;
    let buffer: BlePoll[] = [];
    let presence: PresenceMap = {};
    let stopScan: (() => void) | null = null;
    let cancelled = false;

    void createBleScanner()
      .start((sample) => {
        buffer.push(sample);
      })
      .then((stop) => {
        if (cancelled) stop();
        else stopScan = stop;
      });

    const timer = setInterval(() => {
      const step = stepPresence(presence, buffer);
      buffer = [];
      presence = step.presence;
      for (const id of step.entered) handlersRef.current.onEnter(id);
      for (const id of step.left) handlersRef.current.onLeave(id);
    }, BLE_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
      stopScan?.();
    };
  }, [enabled]);
}
