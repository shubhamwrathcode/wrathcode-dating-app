import { generateReply } from '@/core/services/icebreakers';
import { realtime } from '@/core/services/realtime';
import { uid } from '@/core/utils';
import { Message, Profile } from '@/data/models';

const timers = new Set<ReturnType<typeof setTimeout>>();
const later = (ms: number, fn: () => void) => {
  const t = setTimeout(() => {
    timers.delete(t);
    fn();
  }, ms);
  timers.add(t);
};

/**
 * Chat transport. `send` simulates the server round trip:
 * sent → delivered → read (if online) → typing → reply.
 * Replace with socket.emit('message:send') when the backend exists.
 */
export const chatRepository = {
  send(message: Message, partner: Profile, opts: { autoReply: boolean }) {
    const { matchId, id } = message;
    later(350, () => realtime.emit('status', { matchId, messageId: id, status: 'sent' }));
    later(900, () => realtime.emit('status', { matchId, messageId: id, status: 'delivered' }));

    if (!opts.autoReply) {
      return;
    }

    const readDelay = partner.online ? 1600 : 4200;
    later(readDelay, () => realtime.emit('status', { matchId, messageId: id, status: 'read' }));

    if (message.type === 'date') {
      later(readDelay + 1800, () => {
        realtime.emit('message', {
          id: uid('msg'),
          matchId,
          senderId: partner.id,
          type: 'text',
          text: 'Yes! I’m in 🥰 Can’t wait.',
          createdAt: Date.now(),
          status: 'delivered',
        });
      });
      return;
    }

    const typingAt = readDelay + 600;
    const replyText =
      message.type === 'voice'
        ? 'Aww I love voice notes 🥹 Your voice is so calm!'
        : message.type === 'photo'
        ? 'Wow, that looks amazing 😍 Where is this?'
        : message.type === 'sticker' || message.type === 'emoji'
        ? '😂😂'
        : generateReply(message.text ?? '', partner);
    const typingFor = Math.min(3200, 900 + replyText.length * 35);

    later(typingAt, () => realtime.emit('typing', { matchId, typing: true }));
    later(typingAt + typingFor, () => {
      realtime.emit('typing', { matchId, typing: false });
      realtime.emit('message', {
        id: uid('msg'),
        matchId,
        senderId: partner.id,
        type: 'text',
        text: replyText,
        createdAt: Date.now(),
        status: 'delivered',
      });
    });
  },

  /** Partner accepts a date proposal shortly after reading it. */
  respondToDate(matchId: string, messageId: string, onAccept: () => void) {
    later(3600, () => {
      onAccept();
      realtime.emit('status', { matchId, messageId, status: 'read' });
    });
  },

  dispose() {
    timers.forEach(clearTimeout);
    timers.clear();
  },
};
