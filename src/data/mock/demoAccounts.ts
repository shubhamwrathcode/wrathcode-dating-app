import { randomWaveform } from '@/core/utils';
import { CurrentUser, Match, Message } from '@/data/models';
import { MEN_PHOTOS, WOMEN_PHOTOS } from './photos';
import { SEED_PROFILES } from './profiles';

export const ME_ID = 'me';

const HOUR = 3600000;
const DAY = 24 * HOUR;

const base = {
  id: ME_ID,
  verified: true,
  online: true,
  lastActiveAt: Date.now(),
  likedMe: false,
  locationGranted: true,
  distanceKm: 0,
};

/** Two ready-made personas so any salesperson can demo instantly. */
export const DEMO_ACCOUNTS: Record<string, CurrentUser> = {
  '9999900001': {
    ...base,
    phone: '9999900001',
    name: 'Aarav Mehta',
    dob: new Date(new Date().getFullYear() - 29, 4, 14).toISOString(),
    gender: 'man',
    interestedIn: 'women',
    intent: 'long_term',
    photos: [MEN_PHOTOS[0], MEN_PHOTOS[5], MEN_PHOTOS[10]],
    bio: 'Product guy who cooks a mean rajma chawal. Looking for my person to explore the city with.',
    interests: ['Travel', 'Coffee', 'Cooking', 'Startups', 'Hiking', 'Music', 'Books'],
    prompts: [
      { question: 'My ideal Sunday…', answer: 'Sunrise trek, a big breakfast and a long nap.' },
      { question: 'A green flag I look for…', answer: 'You’re kind to strangers and honest with friends.' },
      { question: 'Together we could…', answer: 'Find the best cold coffee in every city we visit.' },
    ],
    values: ['Family', 'Honesty', 'Growth'],
    lifestyle: {
      heightCm: 180, education: 'Master’s', job: 'Product Manager', company: 'Wrathcode',
      drinking: 'socially', smoking: 'never', languages: ['English', 'Hindi', 'Rajasthani'],
    },
    city: 'C-Scheme, Jaipur',
    voiceIntroSec: 12,
  },
  '9999900002': {
    ...base,
    phone: '9999900002',
    name: 'Sara Kapoor',
    dob: new Date(new Date().getFullYear() - 27, 8, 2).toISOString(),
    gender: 'woman',
    interestedIn: 'men',
    intent: 'marriage',
    photos: [WOMEN_PHOTOS[2], WOMEN_PHOTOS[7], WOMEN_PHOTOS[12]],
    bio: 'Architect, plant mom and amateur baker. Ready for something real.',
    interests: ['Art', 'Coffee', 'Yoga', 'Travel', 'Books', 'Photography', 'Foodie'],
    prompts: [
      { question: 'The way to win me over is…', answer: 'Bring me filter coffee and a terrible pun.' },
      { question: 'My simple pleasures…', answer: 'Rain, chai and an old Kishore Kumar playlist.' },
      { question: 'I’m looking for someone who…', answer: 'Wants a partner, not a project.' },
    ],
    values: ['Family', 'Kindness', 'Loyalty'],
    lifestyle: {
      heightCm: 165, education: 'Master’s', job: 'Architect', company: 'Studio Lotus',
      drinking: 'never', smoking: 'never', languages: ['English', 'Hindi', 'Punjabi'],
    },
    city: 'Bandra, Mumbai',
    voiceIntroSec: 14,
  },
};

interface SeedChat {
  matches: Match[];
  messages: Record<string, Message[]>;
}

/**
 * Pre-made matches and chats per persona. Each one demos a story beat:
 * active chat, 48h anti-ghosting reminder, 5-day close-chat flow, fresh match.
 */
export const buildDemoChats = (user: CurrentUser): SeedChat => {
  const wanted = user.interestedIn === 'women' ? 'woman' : 'man';
  const candidates = SEED_PROFILES.filter(p => p.gender === wanted).slice(0, 5);
  const now = Date.now();
  const [a, b, c, d, e] = candidates;

  const msg = (
    matchId: string,
    senderId: string,
    text: string,
    ago: number,
    extra: Partial<Message> = {},
  ): Message => ({
    id: `${matchId}_${ago}_${senderId}`,
    matchId,
    senderId,
    type: 'text',
    text,
    createdAt: now - ago,
    status: 'read',
    ...extra,
  });

  const matches: Match[] = [
    { id: `m_${a.id}`, profileId: a.id, createdAt: now - 2 * DAY, lastMessageAt: now - 6 * 60000, unread: 2 },
    { id: `m_${b.id}`, profileId: b.id, createdAt: now - 4 * DAY, lastMessageAt: now - 50 * HOUR, unread: 1 },
    { id: `m_${c.id}`, profileId: c.id, createdAt: now - 9 * DAY, lastMessageAt: now - 6 * DAY, unread: 0 },
    { id: `m_${d.id}`, profileId: d.id, createdAt: now - 3 * HOUR, unread: 0, viaSuperLike: true },
    { id: `m_${e.id}`, profileId: e.id, createdAt: now - 20 * 60000, unread: 0 },
  ];

  const messages: Record<string, Message[]> = {
    [matches[0].id]: [
      msg(matches[0].id, a.id, `Hey ${user.name.split(' ')[0]}! Your Sunday prompt is literally my dream day 😄`, 2 * DAY),
      msg(matches[0].id, ME_ID, 'Haha finally someone who gets it! Trek person too?', 2 * DAY - 20 * 60000),
      msg(matches[0].id, a.id, 'Absolutely. Did Triund last month 🏔️', 1 * DAY),
      msg(matches[0].id, ME_ID, '', 22 * HOUR, { type: 'voice', durationSec: 8, waveform: randomWaveform() }),
      msg(matches[0].id, a.id, 'Okay your voice note made my day 🥰', 10 * 60000, { status: 'delivered' }),
      msg(matches[0].id, a.id, 'So… coffee this weekend?', 6 * 60000, { status: 'delivered' }),
    ],
    [matches[1].id]: [
      msg(matches[1].id, ME_ID, 'Hi! Loved your answer about road trips 🚗', 3 * DAY),
      msg(matches[1].id, b.id, 'Thank you! Where was your last one?', 50 * HOUR, { status: 'delivered' }),
    ],
    [matches[2].id]: [
      msg(matches[2].id, c.id, 'Hey there 👋', 8 * DAY),
      msg(matches[2].id, ME_ID, 'Hi! How’s your week going?', 6 * DAY),
    ],
    [matches[3].id]: [],
    [matches[4].id]: [],
  };

  return { matches, messages };
};
