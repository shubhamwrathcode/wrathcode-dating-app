import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DAILY_PICKS_TOTAL, PLANS } from '@/core/constants';
import { useNow } from '@/core/hooks';
import { seededRandom, todayKey } from '@/core/utils';
import { computeCompatibility } from '@/core/utils/compatibility';
import { CompatibilityResult, Profile } from '@/data/models';
import { profileRepository } from '@/data/repositories/profileRepository';
import { RootStackParamList } from '@/navigation/types';
import { useChatStore } from '@/store/useChatStore';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export interface Pick {
  profile: Profile;
  compat: CompatibilityResult;
  locked: boolean;
}

const msUntilMidnight = (now: number) => {
  const d = new Date(now);
  d.setHours(24, 0, 0, 0);
  return d.getTime() - now;
};

/**
 * Daily Picks: 7 curated profiles from the compatibility score. The pool is
 * shuffled with a per-day seed so picks refresh every morning.
 */
export const useDailyPicksViewModel = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useSessionStore(s => s.user)!;
  const plan = usePremiumStore(s => s.plan);
  const swipes = useDiscoveryStore(s => s.swipes);
  const blocked = useSettingsStore(s => s.blockedIds);
  const matches = useChatStore(s => s.matches);
  const now = useNow(60000);
  const day = todayKey(new Date(now));

  const picks = useMemo<Pick[]>(() => {
    const exclude = new Set([...blocked, ...matches.map(m => m.profileId)]);
    const rnd = seededRandom(day.split('-').reduce((a, n) => a * 31 + Number(n), 7));
    const pool = profileRepository
      .getPool(user.interestedIn, exclude)
      .map(p => ({ p, c: computeCompatibility(user, p), r: rnd() }))
      // top 20 by score, then a daily shuffle so the 7 change each day
      .sort((a, b) => b.c.score - a.c.score)
      .slice(0, 20)
      .sort((a, b) => a.r - b.r)
      .slice(0, DAILY_PICKS_TOTAL)
      .sort((a, b) => b.c.score - a.c.score);
    const unlocked = PLANS[plan].features.dailyPicks;
    return pool.map((x, i) => ({ profile: x.p, compat: x.c, locked: i >= unlocked }));
  }, [user, plan, blocked, matches, day]);

  const swipedIds = useMemo(() => new Set(swipes.map(s => s.profileId)), [swipes]);

  return {
    picks,
    plan,
    priority: PLANS[plan].features.priorityPicks,
    refreshIn: msUntilMidnight(now),
    unlockedCount: picks.filter(p => !p.locked).length,
    isActed: (id: string) => swipedIds.has(id),
    open: (pick: Pick) =>
      pick.locked ? nav.navigate('Paywall', { reason: 'picks' }) : nav.navigate('ProfileDetail', { profileId: pick.profile.id, source: 'picks' }),
    upgrade: () => nav.navigate('Paywall', { reason: 'picks' }),
  };
};

/** "Likes you": blurred with a shimmer for free users, unlocked for Gold/Platinum. */
export const useLikesYouViewModel = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useSessionStore(s => s.user)!;
  const plan = usePremiumStore(s => s.plan);
  const swipes = useDiscoveryStore(s => s.swipes);
  const blocked = useSettingsStore(s => s.blockedIds);
  const matches = useChatStore(s => s.matches);

  const likes = useMemo(() => {
    const exclude = new Set([...blocked, ...matches.map(m => m.profileId), ...swipes.map(s => s.profileId)]);
    return profileRepository
      .getPool(user.interestedIn, exclude)
      .filter(p => p.likedMe)
      .sort((a, b) => Number(!!b.superLikedMe) - Number(!!a.superLikedMe));
  }, [user.interestedIn, blocked, matches, swipes]);

  const unlocked = PLANS[plan].features.seeWhoLiked;

  return {
    likes,
    unlocked,
    open: (p: Profile) => (unlocked ? nav.navigate('ProfileDetail', { profileId: p.id, source: 'likes' }) : nav.navigate('Paywall', { reason: 'likes_you' })),
    upgrade: () => nav.navigate('Paywall', { reason: 'likes_you' }),
  };
};
