import { haptics } from '@/core/services/haptics';
import { maskProfanity, isNsfwImage } from '@/core/services/moderation';
import { realtime } from '@/core/services/realtime';
import { uid } from '@/core/utils';
import { Message } from '@/data/models';
import { ME_ID } from '@/data/mock/demoAccounts';
import { chatRepository } from '@/data/repositories/chatRepository';
import { profileRepository } from '@/data/repositories/profileRepository';
import { useChatStore } from '@/store/useChatStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { toast } from '@/store/useToastStore';
import { navigate } from '@/navigation/navigationRef';

export type OutgoingMessage = Omit<Message, 'id' | 'matchId' | 'senderId' | 'createdAt' | 'status'>;

/** Send use case: moderation → optimistic insert → transport. */
export const sendMessage = (matchId: string, payload: OutgoingMessage) => {
  const chat = useChatStore.getState();
  const match = chat.matches.find(m => m.id === matchId);
  const partner = match && profileRepository.getById(match.profileId);
  if (!match || !partner || match.closed) {
    return null;
  }

  const message: Message = {
    ...payload,
    text: payload.text ? maskProfanity(payload.text) : payload.text,
    flagged: payload.uri ? isNsfwImage(payload.uri) : undefined,
    id: uid('msg'),
    matchId,
    senderId: ME_ID,
    createdAt: Date.now(),
    status: 'sending',
  };
  chat.addMessage(message);
  haptics.selection();
  chatRepository.send(message, partner, { autoReply: true });

  if (message.type === 'date') {
    chatRepository.respondToDate(matchId, message.id, () => {
      useChatStore.getState().updateDate(matchId, message.id, { status: 'accepted' });
      toast.success('Date confirmed 🗓️', `${partner.name} accepted your plan`);
    });
  }
  return message;
};

/** Adds a system line (screenshot alerts, close-chat notices). */
export const addSystemMessage = (matchId: string, text: string) =>
  useChatStore.getState().addMessage({
    id: uid('sys'),
    matchId,
    senderId: 'system',
    type: 'system',
    text,
    createdAt: Date.now(),
    status: 'read',
  });

let wired = false;

/** Connects the realtime transport to the stores. Call once at app start. */
export const initRealtime = () => {
  if (wired) {
    return;
  }
  wired = true;

  realtime.on('status', ({ matchId, messageId, status }) => {
    const readReceipts = useSettingsStore.getState().privacy.readReceipts;
    useChatStore.getState().updateStatus(matchId, messageId, !readReceipts && status === 'read' ? 'delivered' : status);
  });

  realtime.on('typing', ({ matchId, typing }) => useChatStore.getState().setTyping(matchId, typing));

  realtime.on('message', msg => {
    const chat = useChatStore.getState();
    chat.receive(msg);
    if (chat.activeMatchId === msg.matchId) {
      return;
    }
    const match = chat.matches.find(m => m.id === msg.matchId);
    const partner = match && profileRepository.getById(match.profileId);
    if (!partner) {
      return;
    }
    useNotificationStore.getState().push({
      kind: 'message',
      title: partner.name,
      body: msg.text ?? 'Sent you a message',
      profileId: partner.id,
      matchId: msg.matchId,
    });
    if (useSettingsStore.getState().notifications.messages) {
      toast.show({
        kind: 'message',
        title: partner.name,
        body: msg.text ?? 'Sent you a message',
        image: partner.photos[0],
        onPress: () => navigate('ChatRoom', { matchId: msg.matchId }),
      });
    }
  });
};
