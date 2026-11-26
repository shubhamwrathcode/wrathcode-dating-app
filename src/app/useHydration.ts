import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';

const stores = [useSessionStore, useSettingsStore, useChatStore, useDiscoveryStore, usePremiumStore, useNotificationStore];

/** True once every persisted store has rehydrated from AsyncStorage. */
export const useHydration = () => {
  const allHydrated = () => stores.every(s => s.persist.hasHydrated());
  const [hydrated, setHydrated] = useState(allHydrated);

  useEffect(() => {
    if (hydrated) {
      return;
    }
    const unsubs = stores.map(s => s.persist.onFinishHydration(() => setHydrated(allHydrated())));
    setHydrated(allHydrated());
    return () => unsubs.forEach(u => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return hydrated;
};
