import { Profile } from '@/data/models';

/**
 * "AI" icebreakers built from both profiles. The production version sends the
 * same inputs (shared interests + their prompts) to an LLM endpoint; this local
 * generator keeps the demo working offline with the same output shape.
 */
const byInterest: Record<string, string[]> = {
  Travel: ['What’s the one trip you’d take again tomorrow?', 'Mountains or beaches for your next getaway?'],
  Coffee: ['Pour-over or a strong filter kaapi — where do you stand? ☕', 'What’s your go-to café order?'],
  Hiking: ['Best trek you’ve done so far? I’m collecting recommendations 🥾'],
  Music: ['Which song has been on repeat for you this week? 🎧'],
  'Live gigs': ['Best concert you’ve ever been to?'],
  Books: ['What are you reading right now? I need a new book 📚'],
  Cooking: ['What’s your signature dish? Asking for a future dinner 😄'],
  Foodie: ['If we had one meal in your city, where would you take me?'],
  'Street food': ['Pani puri or momos — this decides everything 😄'],
  Cricket: ['Who’s your all-time favourite cricketer? 🏏'],
  Fitness: ['Morning workout person or night owl at the gym?'],
  Yoga: ['How did you get into yoga?'],
  Photography: ['What do you love shooting most — people, places or food?'],
  Startups: ['If you could build any startup tomorrow, what would it be?'],
  Dogs: ['Tell me everything about your dream dog 🐶'],
  Pets: ['Do you have a pet? I need photos 🐾'],
  Bollywood: ['Which Bollywood movie can you watch on loop?'],
  'Road trips': ['Your ultimate road-trip playlist starts with…?'],
  'Stand-up comedy': ['Favourite stand-up comic right now? 😂'],
  Art: ['Which artist would you love to see live in a gallery?'],
};

const generic = [
  'Your profile made me smile — what’s been the highlight of your week?',
  'Quick one: chai or coffee? It’s important 😄',
  'What does a perfect first date look like to you?',
];

export const generateIcebreakers = (me: Profile, them: Profile, count = 3): string[] => {
  const shared = them.interests.filter(i => me.interests.includes(i));
  const out: string[] = [];

  for (const interest of shared) {
    const pool = byInterest[interest];
    if (pool) {
      out.push(pool[0]);
    } else {
      out.push(`We both love ${interest.toLowerCase()} — how did you get into it?`);
    }
    if (out.length >= count - 1) {
      break;
    }
  }

  const prompt = them.prompts[0];
  if (prompt) {
    const q = prompt.question.replace('…', '').toLowerCase();
    out.push(`Loved your answer to “${q}” — tell me more!`);
  }

  for (const g of generic) {
    if (out.length >= count) {
      break;
    }
    out.push(g);
  }
  return out.slice(0, count);
};

/** Contextual canned replies used by the mock realtime layer. */
export const generateReply = (incoming: string, them: Profile): string => {
  const t = incoming.toLowerCase();
  if (/(hi|hey|hello|namaste)\b/.test(t)) {
    return `Hey! 😊 So glad we matched. How’s your day going?`;
  }
  if (t.includes('coffee') || t.includes('chai')) {
    return 'Coffee, always ☕ Though I’d never say no to a good cutting chai!';
  }
  if (t.includes('weekend') || t.includes('sunday')) {
    return 'Slow mornings, a long walk and something good to eat. You?';
  }
  if (t.includes('date') || t.includes('meet')) {
    return 'I’d love that! Send me a plan from the date planner 🗓️';
  }
  if (t.includes('?')) {
    const interest = them.interests[0]?.toLowerCase() ?? 'travel';
    return `Ooh good question! Honestly anything with ${interest} wins me over 😄 What about you?`;
  }
  const pool = [
    'Haha that’s so true 😂',
    'Okay I like how you think ✨',
    'Tell me more!',
    'That’s honestly adorable 🥰',
    'Same here! We should definitely talk about this over coffee.',
  ];
  return pool[Math.floor(Math.random() * pool.length)];
};
