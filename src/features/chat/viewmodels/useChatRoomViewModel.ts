import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GHOSTING_CLOSE_MS, GHOSTING_REMINDER_MS, SLOW_REVEAL_MESSAGES } from '@/core/constants';
import { useNow } from '@/core/hooks';
import { generateIcebreakers } from '@/core/services/icebreakers';
import { looksLikeScam } from '@/core/services/moderation';
import { DateProposal, Message } from '@/data/models';
import { ME_ID } from '@/data/mock/demoAccounts';
import { profileRepository } from '@/data/repositories/profileRepository';
import { addSystemMessage, sendMessage } from '@/domain/chat';
import { RootStackParamList } from '@/navigation/types';
import { useChatStore } from '@/store/useChatStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { toast } from '@/store/useToastStore';

const EMPTY: Message[] = [];

export const CLOSE_CHAT_MESSAGE =
  'Hey! I don’t think we’re quite the right match, but I really enjoyed chatting. Wishing you the very best 🌸';

export type GhostState = 'none' | 'reply_reminder' | 'close_suggestion';

export const useChatRoomViewModel = (matchId: string) => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useSessionStore(s => s.user)!;
  const match = useChatStore(s => s.matches.find(m => m.id === matchId));
  const messages = useChatStore(s => s.messages[matchId] ?? EMPTY);
  const typing = useChatStore(s => !!s.typing[matchId]);
  const slowReveal = useSettingsStore(s => s.privacy.slowReveal);
  const screenshotAlerts = useSettingsStore(s => s.privacy.screenshotAlerts);
  const trustedContact = useSettingsStore(s => s.trustedContact);
  const partner = match ? profileRepository.getById(match.profileId) : undefined;
  const now = useNow(30000);

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [actionFor, setActionFor] = useState<Message | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [ghostDismissed, setGhostDismissed] = useState(false);
  const mountedAt = useRef(Date.now());

  // presence: this chat is "active" while focused → incoming messages arrive read
  useFocusEffect(
    useCallback(() => {
      useChatStore.getState().setActive(matchId);
      useChatStore.getState().markRead(matchId);
      return () => useChatStore.getState().setActive(null);
    }, [matchId]),
  );

  useEffect(() => {
    if (match?.unread) {
      useChatStore.getState().markRead(matchId);
    }
  }, [match?.unread, matchId]);

  const real = useMemo(() => messages.filter(m => m.type !== 'system'), [messages]);
  const last = real[real.length - 1];

  const ghostState: GhostState = useMemo(() => {
    if (!last || match?.closed || ghostDismissed) {
      return 'none';
    }
    const age = now - last.createdAt;
    if (last.senderId === ME_ID && age > GHOSTING_CLOSE_MS) {
      return 'close_suggestion';
    }
    if (last.senderId !== ME_ID && age > GHOSTING_REMINDER_MS) {
      return 'reply_reminder';
    }
    return 'none';
  }, [last, now, match?.closed, ghostDismissed]);

  const icebreakers = useMemo(
    () => (partner && real.length === 0 ? generateIcebreakers(user, partner, 3) : []),
    [partner, user, real.length],
  );

  const blurPhotos = slowReveal && real.length < SLOW_REVEAL_MESSAGES;
  const byId = useMemo(() => Object.fromEntries(messages.map(m => [m.id, m])), [messages]);

  const send = useCallback(
    (payload: Parameters<typeof sendMessage>[1]) => {
      const sent = sendMessage(matchId, { ...payload, replyToId: replyTo?.id });
      setReplyTo(null);
      setGhostDismissed(true);
      if (sent?.text && looksLikeScam(sent.text)) {
        toast.info('Stay safe 💛', 'Never share money or payment details with matches.');
      }
    },
    [matchId, replyTo],
  );

  const sendText = useCallback((text: string) => send({ type: 'text', text }), [send]);

  const proposeDate = useCallback(
    (date: DateProposal) => {
      send({ type: 'date', date });
      if (date.sharedWithContact && trustedContact) {
        toast.success('Date details shared', `${trustedContact.name} will be notified on the day`);
      }
    },
    [send, trustedContact],
  );

  const react = useCallback(
    (m: Message, emoji: string) => {
      useChatStore.getState().toggleReaction(matchId, m.id, emoji);
      setActionFor(null);
    },
    [matchId],
  );

  const closeChat = useCallback(() => {
    sendMessage(matchId, { type: 'text', text: CLOSE_CHAT_MESSAGE });
    setTimeout(() => {
      useChatStore.getState().closeChat(matchId, 'kind_close');
      addSystemMessage(matchId, 'You closed this chat kindly. Thanks for keeping DilSe ghost-free 💛');
    }, 600);
  }, [matchId]);

  const unmatch = useCallback(() => {
    useChatStore.getState().removeMatch(matchId);
    toast.info(`Unmatched with ${partner?.name ?? ''}`);
    nav.goBack();
  }, [matchId, partner, nav]);

  const block = useCallback(() => {
    if (!partner) {
      return;
    }
    useSettingsStore.getState().block(partner.id);
    useChatStore.getState().removeMatch(matchId);
    toast.info(`${partner.name} blocked`);
    nav.goBack();
  }, [partner, matchId, nav]);

  /** Demo of the screenshot-alert system message (native: screenshot listener). */
  const simulateScreenshot = useCallback(() => {
    if (!screenshotAlerts) {
      toast.info('Screenshot alerts are off', 'Turn them on in the Safety centre');
      return;
    }
    addSystemMessage(matchId, `📸 ${partner?.name ?? 'They'} took a screenshot of this chat`);
  }, [matchId, partner, screenshotAlerts]);

  return {
    match,
    partner,
    messages,
    byId,
    typing,
    icebreakers,
    ghostState,
    dismissGhost: () => setGhostDismissed(true),
    blurPhotos,
    revealProgress: Math.min(1, real.length / SLOW_REVEAL_MESSAGES),
    trustedContact,
    mountedAt: mountedAt.current,
    replyTo,
    setReplyTo,
    actionFor,
    setActionFor,
    menuOpen,
    setMenuOpen,
    plannerOpen,
    setPlannerOpen,
    reportOpen,
    setReportOpen,
    sendText,
    sendSticker: (s: string) => send({ type: 'sticker', text: s }),
    sendPhoto: (uri: string) => send({ type: 'photo', uri }),
    sendVoice: (v: { durationSec: number; waveform: number[] }) => send({ type: 'voice', ...v }),
    proposeDate,
    acceptDate: (m: Message) => useChatStore.getState().updateDate(matchId, m.id, { status: 'accepted' }),
    react,
    heart: (m: Message) => {
      if (!m.reactions?.includes('❤️')) {
        useChatStore.getState().toggleReaction(matchId, m.id, '❤️');
      }
    },
    closeChat,
    unmatch,
    block,
    simulateScreenshot,
    call: (video: boolean) => nav.navigate('Call', { matchId, video }),
    openProfile: () => partner && nav.navigate('ProfileDetail', { profileId: partner.id, source: 'chat' }),
    openSafety: () => nav.navigate('Safety'),
    back: () => nav.goBack(),
  };
};
