import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage, STORE_KEYS } from '@/core/services/storage';
import { uid } from '@/core/utils';
import { AppNotification } from '@/data/models';

interface NotificationState {
  items: AppNotification[];
  push: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    set => ({
      items: [],
      push: n =>
        set(s => ({
          items: [{ ...n, id: uid('ntf'), createdAt: Date.now(), read: false }, ...s.items].slice(0, 60),
        })),
      markAllRead: () => set(s => ({ items: s.items.map(i => ({ ...i, read: true })) })),
      markRead: id => set(s => ({ items: s.items.map(i => (i.id === id ? { ...i, read: true } : i)) })),
      clear: () => set({ items: [] }),
    }),
    { name: STORE_KEYS.notifications, storage: persistStorage },
  ),
);

export const useUnreadNotifications = () => useNotificationStore(s => s.items.filter(i => !i.read).length);
