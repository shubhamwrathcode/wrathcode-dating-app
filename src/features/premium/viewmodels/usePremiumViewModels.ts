import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BOOST_DURATION_MS } from '@/core/constants';
import { useNow } from '@/core/hooks';
import { haptics } from '@/core/services/haptics';
import { PlanId } from '@/data/models';
import { Consumable, CONSUMABLES, premiumRepository } from '@/data/repositories/premiumRepository';
import { PaywallReason, RootStackParamList } from '@/navigation/types';
import { useNotificationStore } from '@/store/useNotificationStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { toast } from '@/store/useToastStore';

const HEADLINES: Record<PaywallReason, { title: string; body: string }> = {
  likes: { title: 'You’re out of likes for today', body: 'Go Gold for unlimited likes — keep the momentum going.' },
  superlikes: { title: 'Out of Super Likes', body: 'Get up to 10 Super Likes a week and stand out instantly.' },
  undo: { title: 'Changed your mind?', body: 'Undo your last swipe with Gold or Platinum.' },
  likes_you: { title: 'See who already likes you', body: 'Match instantly with people who are into you.' },
  picks: { title: 'Unlock all 7 Daily Picks', body: 'Your most compatible matches, every single morning.' },
  boost: { title: 'Get seen by more people', body: 'Boost puts you at the top of Discover for 30 minutes.' },
  incognito: { title: 'Browse privately', body: 'Incognito lets only the people you like see you. Platinum only.' },
  general: { title: 'Upgrade to DilSe Premium', body: 'Date with intention, without limits.' },
};

export const usePaywallViewModel = (reason: PaywallReason = 'general') => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const current = usePremiumStore(s => s.plan);
  const [selected, setSelected] = useState<PlanId>(reason === 'incognito' || current === 'gold' ? 'platinum' : 'gold');
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const purchase = useCallback(async () => {
    setPurchasing(true);
    try {
      const res = await premiumRepository.purchasePlan(selected);
      usePremiumStore.getState().setPlan(res.planId, res.renewsAt);
      useNotificationStore.getState().push({
        kind: 'premium',
        title: `Welcome to ${res.planId === 'platinum' ? 'Platinum' : 'Gold'} 👑`,
        body: 'Your premium features are now unlocked.',
      });
      haptics.success();
      nav.replace('PurchaseSuccess', { plan: res.planId });
    } catch (e) {
      toast.error('Purchase failed', (e as Error).message);
    } finally {
      setPurchasing(false);
    }
  }, [selected, nav]);

  const restore = useCallback(async () => {
    setRestoring(true);
    const plan = await premiumRepository.restore();
    setRestoring(false);
    toast.info(plan ? 'Purchases restored' : 'No previous purchases found');
  }, []);

  return {
    headline: HEADLINES[reason],
    plans: premiumRepository.getPlans(),
    current,
    selected,
    select: (p: PlanId) => {
      haptics.selection();
      setSelected(p);
    },
    purchase,
    purchasing,
    restore,
    restoring,
    close: () => nav.goBack(),
  };
};

export const useBoostViewModel = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const boostEndsAt = usePremiumStore(s => s.boostEndsAt);
  usePremiumStore(s => s.boosts);
  usePremiumStore(s => s.extraBoosts);
  usePremiumStore(s => s.plan);
  const now = useNow(1000);
  const [buying, setBuying] = useState<Consumable | null>(null);
  const active = !!boostEndsAt && boostEndsAt > now;
  const remaining = active ? boostEndsAt! - now : 0;

  const activate = useCallback(() => {
    if (usePremiumStore.getState().activateBoost()) {
      haptics.success();
      toast.success('Boost activated ⚡', 'You’re a top profile in your area for 30 minutes.');
    }
  }, []);

  const buy = useCallback(async (id: Consumable) => {
    setBuying(id);
    const item = await premiumRepository.purchaseConsumable(id);
    usePremiumStore.getState().addConsumable(item.kind, item.qty);
    setBuying(null);
    haptics.success();
    toast.success(`${item.title} added`, item.kind === 'boost' ? 'Activate whenever you’re ready.' : 'Use them on someone special ⭐');
  }, []);

  return {
    active,
    remaining,
    progress: active ? remaining / BOOST_DURATION_MS : 0,
    boostsLeft: usePremiumStore.getState().boostsRemaining(),
    superLikesLeft: usePremiumStore.getState().superLikesRemaining(),
    consumables: Object.entries(CONSUMABLES) as [Consumable, (typeof CONSUMABLES)[Consumable]][],
    activate,
    buy,
    buying,
    paywall: () => nav.navigate('Paywall', { reason: 'boost' }),
    close: () => nav.goBack(),
  };
};
