import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { WalletItem } from './types';

interface WalletState {
  items: WalletItem[];
  defaultSourceId: string | null;
  balanceRon: number;
  setItems: (items: WalletItem[]) => void;
  setDefaultSourceId: (id: string) => void;
  removeItem: (id: string) => void;
  topUpBalance: (amount: number) => void;
  renewPass: (id: string, days?: number) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      items: [],
      defaultSourceId: null,
      balanceRon: 375.0,
      setItems: (items) =>
        set((s) => ({
          items,
          defaultSourceId: s.defaultSourceId && items.some((i) => i.id === s.defaultSourceId) ? s.defaultSourceId : null,
        })),
      setDefaultSourceId: (id) => set({ defaultSourceId: id }),
      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
          defaultSourceId: s.defaultSourceId === id ? null : s.defaultSourceId,
        })),
      topUpBalance: (amount) =>
        set((s) => ({
          balanceRon: Math.round((s.balanceRon + amount) * 100) / 100,
        })),
      renewPass: (id, days = 30) =>
        set((s) => ({
          items: s.items.map((item) => {
            if (item.id !== id || item.kind !== 'pass') return item;
            const curr = new Date(item.validUntil);
            const base = isNaN(curr.getTime()) || curr < new Date() ? new Date() : curr;
            const next = new Date(base.getTime() + days * 86_400_000);
            return {
              ...item,
              validUntil: next.toISOString().slice(0, 10),
            };
          }),
        })),
    }),
    { name: 'echopass-wallet', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
