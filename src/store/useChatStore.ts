import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage, STORE_KEYS } from '@/core/services/storage';
import { DateProposal, Match, Message, MessageStatus } from '@/data/models';
import { ME_ID } from '@/data/mock/demoAccounts';

const STATUS_RANK: Record<MessageStatus, number> = { sending: 0, sent: 1, delivered: 2, read: 3 };

interface ChatState {
  matches: Match[];
  messages: Record<string, Message[]>;
  typing: Record<string, boolean>;
  activeMatchId: string | null;

  seed: (matches: Match[], messages: Record<string, Message[]>) => void;
  createMatch: (profileId: string, viaSuperLike?: boolean) => Match;
  removeMatch: (matchId: string) => void;
  removeMatchByProfile: (profileId: string) => void;
  addMessage: (msg: Message) => void;
  receive: (msg: Message) => void;
  updateStatus: (matchId: string, messageId: string, status: MessageStatus) => void;
  setTyping: (matchId: string, typing: boolean) => void;
  setActive: (matchId: string | null) => void;
  markRead: (matchId: string) => void;
  toggleReaction: (matchId: string, messageId: string, emoji: string) => void;
  updateDate: (matchId: string, messageId: string, patch: Partial<DateProposal>) => void;
  closeChat: (matchId: string, reason: string) => void;
  reset: () => void;
}

const patchMessage = (
  list: Message[] | undefined,
  id: string,
  fn: (m: Message) => Message,
): Message[] => (list ?? []).map(m => (m.id === id ? fn(m) : m));

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      matches: [],
      messages: {},
      typing: {},
      activeMatchId: null,

      seed: (matches, messages) => set({ matches, messages }),

      createMatch: (profileId, viaSuperLike) => {
        const existing = get().matches.find(m => m.profileId === profileId);
        if (existing) {
          return existing;
        }
        const match: Match = { id: `m_${profileId}`, profileId, createdAt: Date.now(), unread: 0, viaSuperLike };
        set(s => ({ matches: [match, ...s.matches], messages: { ...s.messages, [match.id]: [] } }));
        return match;
      },

      removeMatch: matchId =>
        set(s => {
          const { [matchId]: _removed, ...rest } = s.messages;
          return { matches: s.matches.filter(m => m.id !== matchId), messages: rest };
        }),

      removeMatchByProfile: profileId => {
        const m = get().matches.find(x => x.profileId === profileId);
        if (m) {
          get().removeMatch(m.id);
        }
      },

      addMessage: msg =>
        set(s => ({
          messages: { ...s.messages, [msg.matchId]: [...(s.messages[msg.matchId] ?? []), msg] },
          matches: s.matches.map(m => (m.id === msg.matchId ? { ...m, lastMessageAt: msg.createdAt } : m)),
        })),

      receive: msg => {
        const isActive = get().activeMatchId === msg.matchId;
        set(s => ({
          messages: {
            ...s.messages,
            [msg.matchId]: [...(s.messages[msg.matchId] ?? []), isActive ? { ...msg, status: 'read' } : msg],
          },
          matches: s.matches.map(m =>
            m.id === msg.matchId
              ? { ...m, lastMessageAt: msg.createdAt, unread: isActive ? 0 : m.unread + 1 }
              : m,
          ),
        }));
      },

      updateStatus: (matchId, messageId, status) =>
        set(s => ({
          messages: {
            ...s.messages,
            [matchId]: patchMessage(s.messages[matchId], messageId, m =>
              STATUS_RANK[status] > STATUS_RANK[m.status] ? { ...m, status } : m,
            ),
          },
        })),

      setTyping: (matchId, typing) => set(s => ({ typing: { ...s.typing, [matchId]: typing } })),

      setActive: activeMatchId => set({ activeMatchId }),

      markRead: matchId =>
        set(s => ({
          matches: s.matches.map(m => (m.id === matchId ? { ...m, unread: 0 } : m)),
          messages: {
            ...s.messages,
            [matchId]: (s.messages[matchId] ?? []).map(m =>
              m.senderId !== ME_ID && m.status !== 'read' ? { ...m, status: 'read' } : m,
            ),
          },
        })),

      toggleReaction: (matchId, messageId, emoji) =>
        set(s => ({
          messages: {
            ...s.messages,
            [matchId]: patchMessage(s.messages[matchId], messageId, m => {
              const current = m.reactions ?? [];
              return {
                ...m,
                reactions: current.includes(emoji) ? current.filter(e => e !== emoji) : [...current, emoji].slice(-3),
              };
            }),
          },
        })),

      updateDate: (matchId, messageId, patch) =>
        set(s => ({
          messages: {
            ...s.messages,
            [matchId]: patchMessage(s.messages[matchId], messageId, m =>
              m.date ? { ...m, date: { ...m.date, ...patch } } : m,
            ),
          },
        })),

      closeChat: (matchId, reason) =>
        set(s => ({
          matches: s.matches.map(m => (m.id === matchId ? { ...m, closed: true, closedReason: reason } : m)),
        })),

      reset: () => set({ matches: [], messages: {}, typing: {}, activeMatchId: null }),
    }),
    {
      name: STORE_KEYS.chat,
      storage: persistStorage,
      partialize: s => ({ matches: s.matches, messages: s.messages }),
    },
  ),
);
