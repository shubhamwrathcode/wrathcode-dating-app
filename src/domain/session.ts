import { clearAllStores } from '@/core/services/storage';
import { AuthResult } from '@/data/repositories/authRepository';
import { buildDemoChats } from '@/data/mock/demoAccounts';
import { chatRepository } from '@/data/repositories/chatRepository';
import { useChatStore } from '@/store/useChatStore';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';

const resetUserData = () => {
  chatRepository.dispose();
  useChatStore.getState().reset();
  useDiscoveryStore.getState().reset();
  useNotificationStore.getState().clear();
  usePremiumStore.getState().reset();
};

/** Completes sign-in; demo personas get their pre-made matches and chats. */
export const completeSignIn = (result: AuthResult) => {
  resetUserData();
  useSessionStore.getState().signIn(result);
  if (result.user) {
    const { matches, messages } = buildDemoChats(result.user);
    useChatStore.getState().seed(matches, messages);
    const notify = useNotificationStore.getState().push;
    notify({ kind: 'picks', title: 'Your Daily Picks are ready ✨', body: '7 hand-picked profiles, chosen for you.' });
    notify({ kind: 'like', title: 'New likes 💗', body: 'Several people liked your profile today.' });
  }
};

/** First-time users get a warm welcome match pool after onboarding. */
export const finishOnboarding = () => {
  useSessionStore.getState().completeOnboarding();
  useNotificationStore.getState().push({
    kind: 'picks',
    title: 'Welcome to DilSe 💞',
    body: 'Your first Daily Picks are ready.',
  });
};

export const signOut = () => {
  resetUserData();
  useSessionStore.getState().signOut();
};

/** Data-deletion compliant: wipes every persisted store. */
export const deleteAccount = async () => {
  resetUserData();
  useSettingsStore.getState().reset();
  useSessionStore.getState().signOut();
  await clearAllStores();
};
