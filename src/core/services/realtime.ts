import { Message, MessageStatus } from '@/data/models';

/**
 * In-memory stand-in for the Socket.IO client. Exposes the same event surface
 * (message / status / typing) so the chat ViewModel won't change when the
 * Node.js backend lands — only this file gets swapped for `socket.io-client`.
 */
type Events = {
  message: Message;
  status: { matchId: string; messageId: string; status: MessageStatus };
  typing: { matchId: string; typing: boolean };
};

type Handler<K extends keyof Events> = (payload: Events[K]) => void;

class RealtimeClient {
  private handlers: { [K in keyof Events]?: Set<Handler<K>> } = {};

  on<K extends keyof Events>(event: K, handler: Handler<K>) {
    const map = this.handlers as Record<string, Set<Handler<K>> | undefined>;
    const set = (map[event] ??= new Set<Handler<K>>());
    set.add(handler);
    return () => {
      set.delete(handler);
    };
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    (this.handlers[event] as Set<Handler<K>> | undefined)?.forEach(h => h(payload));
  }
}

export const realtime = new RealtimeClient();
