import { PLANS } from '@/core/constants';
import { delay } from '@/core/utils';
import { PlanId } from '@/data/models';

export type Consumable = 'boost_1' | 'boost_5' | 'superlike_5' | 'superlike_15';

export const CONSUMABLES: Record<Consumable, { title: string; price: number; qty: number; kind: 'boost' | 'superlike' }> = {
  boost_1: { title: '1 Boost', price: 149, qty: 1, kind: 'boost' },
  boost_5: { title: '5 Boosts', price: 549, qty: 5, kind: 'boost' },
  superlike_5: { title: '5 Super Likes', price: 199, qty: 5, kind: 'superlike' },
  superlike_15: { title: '15 Super Likes', price: 449, qty: 15, kind: 'superlike' },
};

/**
 * Billing. Stubs the RevenueCat / Play Billing / StoreKit purchase flow with
 * the same promise shape, so the paywall ViewModel stays unchanged.
 */
export const premiumRepository = {
  getPlans() {
    return [PLANS.gold, PLANS.platinum];
  },

  async purchasePlan(planId: PlanId): Promise<{ planId: PlanId; renewsAt: number; receipt: string }> {
    await delay(1500);
    return {
      planId,
      renewsAt: Date.now() + 30 * 24 * 3600 * 1000,
      receipt: `rc_${planId}_${Date.now()}`,
    };
  },

  async purchaseConsumable(id: Consumable) {
    await delay(1200);
    return CONSUMABLES[id];
  },

  async restore(): Promise<PlanId | null> {
    await delay(1000);
    return null;
  },
};
