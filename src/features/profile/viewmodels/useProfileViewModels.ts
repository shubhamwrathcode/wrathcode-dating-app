import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNow } from '@/core/hooks';
import { CurrentUser } from '@/data/models';
import { RootStackParamList } from '@/navigation/types';
import { useChatStore } from '@/store/useChatStore';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useSessionStore } from '@/store/useSessionStore';

export interface CompletenessItem {
  key: string;
  label: string;
  tip: string;
  weight: number;
  done: boolean;
}

/** Profile completeness meter with actionable tips. */
export const profileCompleteness = (u: CurrentUser) => {
  const items: CompletenessItem[] = [
    { key: 'photos', label: '4+ photos', tip: 'Add at least 4 photos — full-body and a hobby shot work best', weight: 20, done: u.photos.length >= 4 },
    { key: 'bio', label: 'Bio', tip: 'Write a short bio so people know your vibe', weight: 10, done: u.bio.trim().length >= 20 },
    { key: 'prompts', label: '3 prompts', tip: 'Answer 3 prompts — they start most conversations', weight: 15, done: u.prompts.length >= 3 },
    { key: 'interests', label: 'Interests', tip: 'Pick at least 5 interests for better Daily Picks', weight: 10, done: u.interests.length >= 5 },
    { key: 'voice', label: 'Voice intro', tip: 'Record a 15s voice intro — 2× more conversations', weight: 15, done: !!u.voiceIntroSec },
    { key: 'verified', label: 'Verified', tip: 'Verify with a selfie to get the blue tick', weight: 15, done: u.verified },
    { key: 'lifestyle', label: 'Lifestyle', tip: 'Add your job, education and height', weight: 10, done: !!(u.lifestyle.job && u.lifestyle.education && u.lifestyle.heightCm) },
    { key: 'values', label: 'Values', tip: 'Pick the 3 values that matter most to you', weight: 5, done: u.values.length >= 3 },
  ];
  const score = items.reduce((n, i) => n + (i.done ? i.weight : 0), 0);
  return { score, items, missing: items.filter(i => !i.done) };
};

export const useMyProfileViewModel = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useSessionStore(s => s.user)!;
  const plan = usePremiumStore(s => s.plan);
  const boostEndsAt = usePremiumStore(s => s.boostEndsAt);
  usePremiumStore(s => s.boosts);
  usePremiumStore(s => s.extraBoosts);
  usePremiumStore(s => s.superLikes);
  usePremiumStore(s => s.extraSuperLikes);
  const matchCount = useChatStore(s => s.matches.length);
  const likesSent = useDiscoveryStore(s => s.swipes.filter(x => x.action !== 'pass').length);
  const now = useNow(1000, !!boostEndsAt && boostEndsAt > Date.now());
  const completeness = useMemo(() => profileCompleteness(user), [user]);
  const premium = usePremiumStore.getState();

  return {
    user,
    plan,
    completeness,
    boostActive: !!boostEndsAt && boostEndsAt > now,
    boostRemainingMs: boostEndsAt ? Math.max(0, boostEndsAt - now) : 0,
    boostsLeft: premium.boostsRemaining(),
    superLikesLeft: premium.superLikesRemaining(),
    stats: { matches: matchCount, likesSent },
    edit: () => nav.navigate('EditProfile'),
    preview: () => nav.navigate('PreviewProfile'),
    settings: () => nav.navigate('Settings'),
    safety: () => nav.navigate('Safety'),
    paywall: () => nav.navigate('Paywall', { reason: 'general' }),
    boost: () => nav.navigate('Boost'),
    notifications: () => nav.navigate('Notifications'),
  };
};
