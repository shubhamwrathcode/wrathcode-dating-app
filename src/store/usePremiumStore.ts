import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BOOST_DURATION_MS, PLANS } from '@/core/constants';
import { persistStorage, STORE_KEYS } from '@/core/services/storage';
import { monthKey, todayKey, weekKey } from '@/core/utils';
import { PlanFeatures, PlanId } from '@/data/models';

interface Counter {
  key: string;
  count: number;
}

const used = (c: Counter, key: string) => (c.key === key ? c.count : 0);
const bump = (c: Counter, key: string): Counter => ({ key, count: used(c, key) + 1 });

interface PremiumState {
  plan: PlanId;
  renewsAt: number | null;
  likes: Counter;
  superLikes: Counter;
  boosts: Counter;
  extraBoosts: number;
  extraSuperLikes: number;
  boostEndsAt: number | null;

  features: () => PlanFeatures;
  isPremium: () => boolean;
  likesRemaining: () => number;
  superLikesRemaining: () => number;
  boostsRemaining: () => number;
  isBoostActive: () => boolean;

  consumeLike: () => boolean;
  consumeSuperLike: () => boolean;
  activateBoost: () => boolean;
  setPlan: (plan: PlanId, renewsAt: number | null) => void;
  addConsumable: (kind: 'boost' | 'superlike', qty: number) => void;
  reset: () => void;
}

const initial = {
  plan: 'free' as PlanId,
  renewsAt: null as number | null,
  likes: { key: '', count: 0 },
  superLikes: { key: '', count: 0 },
  boosts: { key: '', count: 0 },
  extraBoosts: 0,
  extraSuperLikes: 0,
  boostEndsAt: null as number | null,
};

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      ...initial,

      features: () => PLANS[get().plan].features,
      isPremium: () => get().plan !== 'free',

      likesRemaining: () => {
        const f = get().features();
        return Number.isFinite(f.dailyLikes) ? Math.max(0, f.dailyLikes - used(get().likes, todayKey())) : Infinity;
      },
      superLikesRemaining: () =>
        Math.max(0, get().features().superLikesPerWeek - used(get().superLikes, weekKey())) + get().extraSuperLikes,
      boostsRemaining: () =>
        Math.max(0, get().features().boostsPerMonth - used(get().boosts, monthKey())) + get().extraBoosts,
      isBoostActive: () => {
        const end = get().boostEndsAt;
        return end !== null && end > Date.now();
      },

      consumeLike: () => {
        if (get().likesRemaining() <= 0) {
          return false;
        }
        set(s => ({ likes: bump(s.likes, todayKey()) }));
        return true;
      },

      consumeSuperLike: () => {
        const s = get();
        const allowanceLeft = s.features().superLikesPerWeek - used(s.superLikes, weekKey());
        if (allowanceLeft > 0) {
          set({ superLikes: bump(s.superLikes, weekKey()) });
          return true;
        }
        if (s.extraSuperLikes > 0) {
          set({ extraSuperLikes: s.extraSuperLikes - 1 });
          return true;
        }
        return false;
      },

      activateBoost: () => {
        const s = get();
        if (s.isBoostActive()) {
          return false;
        }
        const allowanceLeft = s.features().boostsPerMonth - used(s.boosts, monthKey());
        if (allowanceLeft > 0) {
          set({ boosts: bump(s.boosts, monthKey()), boostEndsAt: Date.now() + BOOST_DURATION_MS });
          return true;
        }
        if (s.extraBoosts > 0) {
          set({ extraBoosts: s.extraBoosts - 1, boostEndsAt: Date.now() + BOOST_DURATION_MS });
          return true;
        }
        return false;
      },

      setPlan: (plan, renewsAt) => set({ plan, renewsAt }),

      addConsumable: (kind, qty) =>
        set(s => (kind === 'boost' ? { extraBoosts: s.extraBoosts + qty } : { extraSuperLikes: s.extraSuperLikes + qty })),

      reset: () => set({ ...initial }),
    }),
    {
      name: STORE_KEYS.premium,
      storage: persistStorage,
      partialize: s => ({
        plan: s.plan, renewsAt: s.renewsAt, likes: s.likes, superLikes: s.superLikes, boosts: s.boosts,
        extraBoosts: s.extraBoosts, extraSuperLikes: s.extraSuperLikes, boostEndsAt: s.boostEndsAt,
      }),
    },
  ),
);

/** Reactive plan hooks — subscribe to the raw fields so components re-render. */
export const usePlan = () => usePremiumStore(s => s.plan);
export const usePlanFeatures = () => usePremiumStore(s => PLANS[s.plan].features);
