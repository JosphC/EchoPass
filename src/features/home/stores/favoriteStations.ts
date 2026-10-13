import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FavoriteStationsState {
  ids: string[];
  toggle: (id: string) => void;
}

export const useFavoriteStations = create<FavoriteStationsState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
    }),
    { name: 'echopass-favorites', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
