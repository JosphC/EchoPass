import { create } from 'zustand';

export type SettingsKey = 'tripReminders' | 'arrivalAlerts' | 'disruptions' | 'locationSharing' | 'askBeforeCharge';

interface SettingsState {
  tripReminders: boolean;
  arrivalAlerts: boolean;
  disruptions: boolean;
  locationSharing: boolean;
  /** ON = confirm every boarding; OFF = automatic payment. Read by wallet, never written there. */
  askBeforeCharge: boolean;
  toggle: (key: SettingsKey) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  tripReminders: false,
  arrivalAlerts: false,
  disruptions: true,
  locationSharing: false,
  askBeforeCharge: true,
  toggle: (key) => set((s) => ({ ...s, [key]: !s[key] })),
}));

export function useSettings(): SettingsState {
  return useSettingsStore();
}
