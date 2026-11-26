import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_FILTERS } from '@/core/constants';
import { persistStorage, STORE_KEYS } from '@/core/services/storage';
import { DiscoveryFilters, SwipeAction, SwipeRecord } from '@/data/models';

interface DiscoveryState {
  swipes: SwipeRecord[];
  filters: DiscoveryFilters;
  /** Daily Picks the user has opened today: { dayKey, ids } */
  picksOpened: { key: string; ids: string[] };

  recordSwipe: (profileId: string, action: SwipeAction, matchId?: string) => void;
  popLastSwipe: () => SwipeRecord | undefined;
  setFilters: (patch: Partial<DiscoveryFilters>) => void;
  resetFilters: () => void;
  openPick: (dayKey: string, id: string) => void;
  reset: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      swipes: [],
      filters: DEFAULT_FILTERS,
      picksOpened: { key: '', ids: [] },

      recordSwipe: (profileId, action, matchId) =>
        set(s => ({ swipes: [...s.swipes, { profileId, action, at: Date.now(), matchId }] })),

      popLastSwipe: () => {
        const last = get().swipes[get().swipes.length - 1];
        if (last) {
          set(s => ({ swipes: s.swipes.slice(0, -1) }));
        }
        return last;
      },

      setFilters: patch => set(s => ({ filters: { ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      openPick: (dayKey, id) =>
        set(s => {
          const ids = s.picksOpened.key === dayKey ? s.picksOpened.ids : [];
          return { picksOpened: { key: dayKey, ids: ids.includes(id) ? ids : [...ids, id] } };
        }),

      reset: () => set({ swipes: [], filters: DEFAULT_FILTERS, picksOpened: { key: '', ids: [] } }),
    }),
    { name: STORE_KEYS.discovery, storage: persistStorage },
  ),
);
