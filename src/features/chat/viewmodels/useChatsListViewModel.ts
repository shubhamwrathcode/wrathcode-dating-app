import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GHOSTING_REMINDER_MS } from '@/core/constants';
import { Match, Message, Profile } from '@/data/models';
import { ME_ID } from '@/data/mock/demoAccounts';
import { profileRepository } from '@/data/repositories/profileRepository';
import { RootStackParamList } from '@/navigation/types';
import { useChatStore } from '@/store/useChatStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export interface Conversation {
  match: Match;
  profile: Profile;
  last?: Message;
  yourTurn: boolean;
  stale: boolean;
  typing: boolean;
}

const preview = (m?: Message) => {
  if (!m) {
    return '';
  }
  const mine = m.senderId === ME_ID ? 'You: ' : '';
  switch (m.type) {
    case 'voice':
      return `${mine}🎤 Voice note`;
    case 'photo':
      return `${mine}📷 Photo`;
    case 'sticker':
      return `${mine}${m.text}`;
    case 'date':
      return `${mine}🗓️ Date plan: ${m.date?.place}`;
    default:
      return `${mine}${m.text ?? ''}`;
  }
};

export const useChatsListViewModel = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const matches = useChatStore(s => s.matches);
  const messages = useChatStore(s => s.messages);
  const typing = useChatStore(s => s.typing);
  const blocked = useSettingsStore(s => s.blockedIds);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // brief skeleton on first paint (mirrors the network fetch in production)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const all = useMemo(() => {
    const now = Date.now();
    return matches
      .filter(m => !blocked.includes(m.profileId))
      .map(match => {
        const profile = profileRepository.getById(match.profileId);
        if (!profile) {
          return null;
        }
        const list = (messages[match.id] ?? []).filter(x => x.type !== 'system');
        const last = list[list.length - 1];
        return {
          match,
          profile,
          last,
          yourTurn: !!last && last.senderId !== ME_ID,
          stale: !!last && now - last.createdAt > GHOSTING_REMINDER_MS,
          typing: !!typing[match.id],
        } as Conversation;
      })
      .filter((x): x is Conversation => !!x);
  }, [matches, messages, typing, blocked]);

  const q = query.trim().toLowerCase();
  const filtered = q ? all.filter(c => c.profile.name.toLowerCase().includes(q)) : all;

  const newMatches = filtered.filter(c => !c.last).sort((a, b) => b.match.createdAt - a.match.createdAt);
  const conversations = filtered
    .filter(c => c.last)
    .sort((a, b) => (b.match.lastMessageAt ?? 0) - (a.match.lastMessageAt ?? 0));

  return {
    loading,
    query,
    setQuery,
    newMatches,
    conversations,
    preview,
    isEmpty: all.length === 0,
    open: (matchId: string) => nav.navigate('ChatRoom', { matchId }),
    goDiscover: () => nav.navigate('Main', { screen: 'Discover' }),
  };
};
