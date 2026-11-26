import { haptics } from '@/core/services/haptics';
import { Match, Profile, SwipeAction } from '@/data/models';
import { useChatStore } from '@/store/useChatStore';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { usePremiumStore } from '@/store/usePremiumStore';

export type SwipeResult =
  | { ok: true; match?: Match }
  | { ok: false; reason: 'likes_exhausted' | 'superlikes_exhausted' };

/**
 * Swipe use case: enforces plan limits, records the swipe and creates a
 * match when the like is mutual (backend: POST /swipes → match event).
 */
export const performSwipe = (profile: Profile, action: SwipeAction): SwipeResult => {
  const premium = usePremiumStore.getState();

  if (action === 'like' && !premium.consumeLike()) {
    return { ok: false, reason: 'likes_exhausted' };
  }
  if (action === 'superlike' && !premium.consumeSuperLike()) {
    return { ok: false, reason: 'superlikes_exhausted' };
  }

  let match: Match | undefined;
  // A super like counts as a like for matching; it also makes a "maybe" profile more likely to match.
  const mutual = profile.likedMe || (action === 'superlike' && profile.id.charCodeAt(profile.id.length - 1) % 2 === 0);
  if (action !== 'pass' && mutual) {
    const created = useChatStore.getState().createMatch(profile.id, action === 'superlike');
    match = created;
    useNotificationStore.getState().push({
      kind: 'match',
      title: 'It’s a match! 💞',
      body: `You and ${profile.name} liked each other.`,
      profileId: profile.id,
      matchId: created.id,
    });
    haptics.success();
  } else if (action !== 'pass') {
    haptics.light();
  }

  useDiscoveryStore.getState().recordSwipe(profile.id, action, match?.id);
  return { ok: true, match };
};

export type UndoResult = { ok: true; profileId: string } | { ok: false; reason: 'premium' | 'empty' };

export const undoLastSwipe = (): UndoResult => {
  if (!usePremiumStore.getState().features().undo) {
    return { ok: false, reason: 'premium' };
  }
  const last = useDiscoveryStore.getState().popLastSwipe();
  if (!last) {
    return { ok: false, reason: 'empty' };
  }
  if (last.matchId) {
    useChatStore.getState().removeMatch(last.matchId);
  }
  haptics.selection();
  return { ok: true, profileId: last.profileId };
};
