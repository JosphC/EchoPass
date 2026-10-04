import { create } from 'zustand';

export type SettingsKey = 'tripReminders' | 'arrivalAlerts' | 'disruptions' | 'locationSharing';

interface SettingsState {
  tripReminders: boolean;
  arrivalAlerts: boolean;
  disruptions: boolean;
  locationSharing: boolean;
  toggle: (key: SettingsKey) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  tripReminders: false,
  arrivalAlerts: false,
  disruptions: false,
  locationSharing: false,
  toggle: (key) => set((s) => ({ ...s, [key]: !s[key] })),
}));

export function useSettings(): SettingsState {
  return useSettingsStore();
}
