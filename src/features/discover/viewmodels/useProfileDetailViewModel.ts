import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { computeCompatibility } from '@/core/utils/compatibility';
import { SwipeAction } from '@/data/models';
import { profileRepository } from '@/data/repositories/profileRepository';
import { performSwipe } from '@/domain/discovery';
import { RootStackParamList } from '@/navigation/types';
import { useChatStore } from '@/store/useChatStore';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { toast } from '@/store/useToastStore';

export const useProfileDetailViewModel = (profileId: string) => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useSessionStore(s => s.user)!;
  const profile = profileRepository.getById(profileId);
  const match = useChatStore(s => s.matches.find(m => m.profileId === profileId));
  const swiped = useDiscoveryStore(s => s.swipes.some(x => x.profileId === profileId));
  const showDistance = useSettingsStore(s => s.privacy.showDistance);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const compatibility = useMemo(() => (profile ? computeCompatibility(user, profile) : undefined), [user, profile]);

  const act = useCallback(
    (action: SwipeAction) => {
      if (!profile) {
        return;
      }
      const premium = usePremiumStore.getState();
      if (action === 'like' && premium.likesRemaining() <= 0) {
        nav.navigate('Paywall', { reason: 'likes' });
        return;
      }
      if (action === 'superlike' && premium.superLikesRemaining() <= 0) {
        nav.navigate('Paywall', { reason: 'superlikes' });
        return;
      }
      const result = performSwipe(profile, action);
      nav.goBack();
      if (result.ok && result.match) {
        const matchId = result.match.id;
        setTimeout(() => nav.navigate('Match', { matchId }), 300);
      } else if (result.ok && action !== 'pass') {
        toast.success(action === 'superlike' ? `Super Like sent ⭐` : `You liked ${profile.name} 💗`);
      }
    },
    [profile, nav],
  );

  const block = useCallback(() => {
    if (!profile) {
      return;
    }
    useSettingsStore.getState().block(profile.id);
    useChatStore.getState().removeMatchByProfile(profile.id);
    toast.info(`${profile.name} blocked`, 'They won’t see you or be able to message you.');
    nav.goBack();
  }, [profile, nav]);

  return {
    profile,
    compatibility,
    showDistance,
    match,
    canAct: !match && !swiped,
    act,
    message: () => match && nav.navigate('ChatRoom', { matchId: match.id }),
    menuOpen,
    setMenuOpen,
    reportOpen,
    setReportOpen,
    block,
    close: () => nav.goBack(),
  };
};
