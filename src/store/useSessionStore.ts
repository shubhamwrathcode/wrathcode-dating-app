import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage, STORE_KEYS } from '@/core/services/storage';
import { CurrentUser } from '@/data/models';
import { ME_ID } from '@/data/mock/demoAccounts';

export type SessionStatus = 'guest' | 'onboarding' | 'active';

export type OnboardingDraft = Partial<CurrentUser>;

interface SessionState {
  status: SessionStatus;
  hasSeenWelcome: boolean;
  user: CurrentUser | null;
  draft: OnboardingDraft;
  authProvider: 'phone' | 'google' | 'apple' | null;

  setSeenWelcome: () => void;
  signIn: (args: { phone: string; user: CurrentUser | null; provider: 'phone' | 'google' | 'apple' }) => void;
  updateDraft: (patch: OnboardingDraft) => void;
  completeOnboarding: () => void;
  updateUser: (patch: Partial<CurrentUser>) => void;
  signOut: () => void;
}

const draftDefaults = (phone: string): OnboardingDraft => ({
  id: ME_ID,
  phone,
  photos: [],
  interests: [],
  prompts: [],
  values: [],
  lifestyle: { languages: ['English', 'Hindi'] },
  verified: false,
  online: true,
  likedMe: false,
  distanceKm: 0,
  locationGranted: false,
  bio: '',
});

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      status: 'guest',
      hasSeenWelcome: false,
      user: null,
      draft: {},
      authProvider: null,

      setSeenWelcome: () => set({ hasSeenWelcome: true }),

      signIn: ({ phone, user, provider }) =>
        user
          ? set({ status: 'active', user, authProvider: provider, draft: {} })
          : set({ status: 'onboarding', user: null, authProvider: provider, draft: draftDefaults(phone) }),

      updateDraft: patch => set(s => ({ draft: { ...s.draft, ...patch } })),

      completeOnboarding: () => {
        const d = get().draft;
        const user: CurrentUser = {
          id: ME_ID,
          phone: d.phone ?? '',
          name: d.name ?? 'You',
          dob: d.dob ?? new Date(1998, 0, 1).toISOString(),
          gender: d.gender ?? 'man',
          interestedIn: d.interestedIn ?? 'everyone',
          intent: d.intent ?? 'long_term',
          photos: d.photos ?? [],
          bio: d.bio ?? '',
          interests: d.interests ?? [],
          prompts: d.prompts ?? [],
          values: d.values ?? [],
          lifestyle: d.lifestyle ?? { languages: ['English'] },
          city: d.city ?? 'Jaipur',
          distanceKm: 0,
          verified: d.verified ?? false,
          online: true,
          lastActiveAt: Date.now(),
          likedMe: false,
          locationGranted: d.locationGranted ?? false,
          voiceIntroSec: d.voiceIntroSec,
        };
        set({ status: 'active', user, draft: {} });
      },

      updateUser: patch => set(s => (s.user ? { user: { ...s.user, ...patch } } : s)),

      signOut: () => set({ status: 'guest', user: null, draft: {}, authProvider: null }),
    }),
    { name: STORE_KEYS.session, storage: persistStorage },
  ),
);

export const useCurrentUser = () => useSessionStore(s => s.user);
