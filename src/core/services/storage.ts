import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Shared persistence adapter for every zustand store. */
export const persistStorage = createJSONStorage(() => AsyncStorage);

export const STORE_KEYS = {
  session: 'amora.session',
  settings: 'amora.settings',
  discovery: 'amora.discovery',
  chat: 'amora.chat',
  premium: 'amora.premium',
  notifications: 'amora.notifications',
} as const;

export const clearAllStores = () => Promise.all(Object.values(STORE_KEYS).map(k => AsyncStorage.removeItem(k)));
