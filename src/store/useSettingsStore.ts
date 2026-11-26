import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage, STORE_KEYS } from '@/core/services/storage';
import { TrustedContact } from '@/data/models';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Language = 'en' | 'hi';

export interface NotificationPrefs {
  matches: boolean;
  messages: boolean;
  likes: boolean;
  dailyPicks: boolean;
  promotions: boolean;
}

export interface PrivacyPrefs {
  showDistance: boolean;
  showOnline: boolean;
  readReceipts: boolean;
  slowReveal: boolean;
  screenshotAlerts: boolean;
}

interface SettingsState {
  themeMode: ThemeMode;
  language: Language;
  notifications: NotificationPrefs;
  privacy: PrivacyPrefs;
  incognito: boolean;
  paused: boolean;
  trustedContact: TrustedContact | null;
  blockedIds: string[];
  reportedIds: string[];

  setThemeMode: (m: ThemeMode) => void;
  setLanguage: (l: Language) => void;
  setNotification: (k: keyof NotificationPrefs, v: boolean) => void;
  setPrivacy: (k: keyof PrivacyPrefs, v: boolean) => void;
  setIncognito: (v: boolean) => void;
  setPaused: (v: boolean) => void;
  setTrustedContact: (c: TrustedContact | null) => void;
  block: (profileId: string) => void;
  unblock: (profileId: string) => void;
  report: (profileId: string) => void;
  reset: () => void;
}

const initial = {
  themeMode: 'system' as ThemeMode,
  language: 'en' as Language,
  notifications: { matches: true, messages: true, likes: true, dailyPicks: true, promotions: false },
  privacy: { showDistance: true, showOnline: true, readReceipts: true, slowReveal: false, screenshotAlerts: true },
  incognito: false,
  paused: false,
  trustedContact: null as TrustedContact | null,
  blockedIds: [] as string[],
  reportedIds: [] as string[],
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      ...initial,
      setThemeMode: themeMode => set({ themeMode }),
      setLanguage: language => set({ language }),
      setNotification: (k, v) => set(s => ({ notifications: { ...s.notifications, [k]: v } })),
      setPrivacy: (k, v) => set(s => ({ privacy: { ...s.privacy, [k]: v } })),
      setIncognito: incognito => set({ incognito }),
      setPaused: paused => set({ paused }),
      setTrustedContact: trustedContact => set({ trustedContact }),
      block: id => set(s => ({ blockedIds: s.blockedIds.includes(id) ? s.blockedIds : [...s.blockedIds, id] })),
      unblock: id => set(s => ({ blockedIds: s.blockedIds.filter(x => x !== id) })),
      report: id => set(s => ({ reportedIds: [...new Set([...s.reportedIds, id])] })),
      reset: () => set({ ...initial }),
    }),
    { name: STORE_KEYS.settings, storage: persistStorage },
  ),
);
