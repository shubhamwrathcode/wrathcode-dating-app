import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info' | 'match' | 'message';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  body?: string;
  image?: string;
  onPress?: () => void;
}

interface ToastState {
  current: Toast | null;
  show: (t: Omit<Toast, 'id'>) => void;
  hide: () => void;
}

let counter = 0;

/** Global in-app banner (stands in for push notifications while the app is open). */
export const useToastStore = create<ToastState>()(set => ({
  current: null,
  show: t => set({ current: { ...t, id: ++counter } }),
  hide: () => set({ current: null }),
}));

export const toast = {
  success: (title: string, body?: string) => useToastStore.getState().show({ kind: 'success', title, body }),
  error: (title: string, body?: string) => useToastStore.getState().show({ kind: 'error', title, body }),
  info: (title: string, body?: string) => useToastStore.getState().show({ kind: 'info', title, body }),
  show: (t: Omit<Toast, 'id'>) => useToastStore.getState().show(t),
};
