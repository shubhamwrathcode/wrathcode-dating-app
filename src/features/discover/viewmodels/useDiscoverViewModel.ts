import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useShallow } from 'zustand/react/shallow';
import { useNow } from '@/core/hooks';
import { computeCompatibility } from '@/core/utils/compatibility';
import { DiscoveryFilters, Profile, SwipeAction } from '@/data/models';
import { profileRepository } from '@/data/repositories/profileRepository';
import { performSwipe, undoLastSwipe } from '@/domain/discovery';
import { RootStackParamList } from '@/navigation/types';
import { useChatStore } from '@/store/useChatStore';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { useUnreadNotifications } from '@/store/useNotificationStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { toast } from '@/store/useToastStore';

export const useDiscoverViewModel = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useSessionStore(s => s.user)!;
  const { swipes, filters, setFilters } = useDiscoveryStore(
    useShallow(s => ({ swipes: s.swipes, filters: s.filters, setFilters: s.setFilters })),
  );
  const blockedIds = useSettingsStore(s => s.blockedIds);
  const matches = useChatStore(s => s.matches);
  const showDistance = useSettingsStore(s => s.privacy.showDistance);
  const paused = useSettingsStore(s => s.paused);
  const plan = usePremiumStore(s => s.plan);
  const boostEndsAt = usePremiumStore(s => s.boostEndsAt);
  usePremiumStore(s => s.likes); // re-render when the like counter changes
  const unreadNotifications = useUnreadNotifications();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const now = useNow(1000, !!boostEndsAt && boostEndsAt > Date.now());

  const excluded = useMemo(
    () => new Set([...swipes.map(s => s.profileId), ...blockedIds, ...matches.map(m => m.profileId)]),
    [swipes, blockedIds, matches],
  );

  const deck = useMemo(
    () => profileRepository.getDeck({ interestedIn: user.interestedIn, filters, excludeIds: excluded }),
    [user.interestedIn, filters, excluded],
  );

  const compatibility = useCallback((p: Profile) => computeCompatibility(user, p).score, [user]);

  const countFor = useCallback(
    (f: DiscoveryFilters) => profileRepository.getDeck({ interestedIn: user.interestedIn, filters: f, excludeIds: excluded }).length,
    [user.interestedIn, excluded],
  );

  /** Called before the fly-out animation; returns false to spring the card back. */
  const canSwipe = useCallback(
    (action: SwipeAction) => {
      const premium = usePremiumStore.getState();
      if (action === 'like' && premium.likesRemaining() <= 0) {
        nav.navigate('Paywall', { reason: 'likes' });
        return false;
      }
      if (action === 'superlike' && premium.superLikesRemaining() <= 0) {
        nav.navigate('Paywall', { reason: 'superlikes' });
        return false;
      }
      return true;
    },
    [nav],
  );

  const commitSwipe = useCallback(
    (profile: Profile, action: SwipeAction) => {
      const result = performSwipe(profile, action);
      if (!result.ok) {
        nav.navigate('Paywall', { reason: result.reason === 'likes_exhausted' ? 'likes' : 'superlikes' });
        return;
      }
      if (result.match) {
        const matchId = result.match.id;
        setTimeout(() => nav.navigate('Match', { matchId }), 120);
      } else if (action === 'superlike') {
        toast.show({ kind: 'info', title: `Super Like sent to ${profile.name} ⭐`, body: 'You’ll stand out at the top of their stack.' });
      }
    },
    [nav],
  );

  const undo = useCallback(() => {
    const r = undoLastSwipe();
    if (!r.ok) {
      if (r.reason === 'premium') {
        nav.navigate('Paywall', { reason: 'undo' });
      } else {
        toast.info('Nothing to undo');
      }
    }
  }, [nav]);

  const boostActive = !!boostEndsAt && boostEndsAt > now;

  return {
    user,
    deck,
    filters,
    setFilters,
    filtersOpen,
    openFilters: () => setFiltersOpen(true),
    closeFilters: () => setFiltersOpen(false),
    countFor,
    compatibility,
    showDistance,
    paused,
    plan,
    likesLeft: usePremiumStore.getState().likesRemaining(),
    boostActive,
    boostRemainingMs: boostActive ? boostEndsAt! - now : 0,
    unreadNotifications,
    canSwipe,
    commitSwipe,
    undo,
    openProfile: (p: Profile) => nav.navigate('ProfileDetail', { profileId: p.id, source: 'deck' }),
    openBoost: () => nav.navigate('Boost'),
    openNotifications: () => nav.navigate('Notifications'),
    openTravel: () => (plan === 'platinum' ? toast.info('Travel mode', 'Pick a city in Settings → Discovery') : nav.navigate('Paywall', { reason: 'general' })),
    unpause: () => useSettingsStore.getState().setPaused(false),
  };
};
