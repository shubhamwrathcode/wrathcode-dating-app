import { DiscoveryFilters, Intent, Plan, PlanId, ReportReason } from '@/data/models';

export const APP_NAME = 'DilSe';
export const DEMO_OTP = '123456';
export const MIN_AGE = 18;
export const PHOTOS_MIN = 2;
export const PHOTOS_MAX = 6;
export const INTERESTS_MIN = 5;
export const INTERESTS_MAX = 10;
export const PROMPTS_REQUIRED = 3;
export const SLOW_REVEAL_MESSAGES = 10;
export const GHOSTING_REMINDER_MS = 48 * 60 * 60 * 1000;
export const GHOSTING_CLOSE_MS = 5 * 24 * 60 * 60 * 1000;
export const BOOST_DURATION_MS = 30 * 60 * 1000;
export const DAILY_PICKS_TOTAL = 7;

export const INTENTS: { id: Intent; label: string; emoji: string; description: string }[] = [
  { id: 'long_term', label: 'Long-term', emoji: '💞', description: 'Looking for a committed relationship' },
  { id: 'marriage', label: 'Marriage', emoji: '💍', description: 'Ready to find a life partner' },
  { id: 'open', label: 'Open to explore', emoji: '✨', description: 'Seeing where things go, intentionally' },
];

export const intentLabel = (i: Intent) => INTENTS.find(x => x.id === i)?.label ?? i;

export const INTEREST_OPTIONS = [
  'Travel', 'Coffee', 'Hiking', 'Yoga', 'Cooking', 'Photography', 'Music', 'Live gigs',
  'Bollywood', 'Books', 'Startups', 'Fitness', 'Running', 'Cricket', 'Football', 'Badminton',
  'Art', 'Painting', 'Dancing', 'Poetry', 'Gaming', 'Anime', 'Tech', 'Pets', 'Dogs', 'Cats',
  'Foodie', 'Street food', 'Wine', 'Mocktails', 'Road trips', 'Beaches', 'Mountains',
  'Meditation', 'Volunteering', 'Fashion', 'Theatre', 'Stand-up comedy', 'Podcasts',
  'Board games', 'Cycling', 'Swimming', 'Gardening', 'Spirituality', 'Classical music',
];

export const PROMPT_QUESTIONS = [
  'My ideal Sunday…',
  'A green flag I look for…',
  'The way to win me over is…',
  'I geek out on…',
  'My simple pleasures…',
  'Together we could…',
  'A life goal of mine…',
  'I’m looking for someone who…',
  'Two truths and a lie…',
  'My love language is…',
];

export const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Punjabi', 'Kannada', 'Malayalam', 'Urdu', 'Rajasthani'];

export const VALUES = ['Family', 'Ambition', 'Kindness', 'Honesty', 'Humour', 'Faith', 'Adventure', 'Stability', 'Growth', 'Loyalty'];

export const EDUCATION_OPTIONS = ['High school', 'Bachelor’s', 'Master’s', 'PhD', 'Professional (CA/MBBS/LLB)'];
export const RELIGION_OPTIONS = ['Prefer not to say', 'Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Buddhist', 'Spiritual', 'Other'];

export const CITIES = [
  { city: 'Jaipur', areas: ['C-Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Raja Park'] },
  { city: 'Mumbai', areas: ['Bandra', 'Andheri', 'Lower Parel', 'Powai'] },
  { city: 'Delhi', areas: ['Hauz Khas', 'Connaught Place', 'Saket', 'Greater Kailash'] },
  { city: 'Bengaluru', areas: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield'] },
  { city: 'Pune', areas: ['Koregaon Park', 'Baner', 'Viman Nagar', 'Kalyani Nagar'] },
  { city: 'Hyderabad', areas: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Kondapur'] },
  { city: 'Gurugram', areas: ['Cyber Hub', 'Golf Course Road', 'Sector 29', 'Sohna Road'] },
];

export const DATE_PLACES: Record<string, { name: string; area: string; kind: string }[]> = {
  default: [
    { name: 'Blue Tokai Coffee', area: 'City centre', kind: '☕ Café' },
    { name: 'The Book Lounge', area: 'Old town', kind: '📚 Bookstore café' },
    { name: 'Lakeside Walk', area: 'Riverfront', kind: '🌿 Walk' },
    { name: 'Art District Gallery', area: 'Arts quarter', kind: '🎨 Gallery' },
    { name: 'Rooftop Bistro', area: 'Downtown', kind: '🍽️ Dinner' },
    { name: 'Comedy Club', area: 'High street', kind: '🎤 Stand-up' },
  ],
};

export const REPORT_REASONS: { id: ReportReason; label: string; hint: string }[] = [
  { id: 'fake', label: 'Fake profile or catfishing', hint: 'Photos or info aren’t real' },
  { id: 'inappropriate', label: 'Inappropriate photos or messages', hint: 'Nudity, explicit or offensive content' },
  { id: 'harassment', label: 'Harassment or hate', hint: 'Bullying, threats, hate speech' },
  { id: 'scam', label: 'Scam or spam', hint: 'Asking for money, links, promotions' },
  { id: 'underage', label: 'May be under 18', hint: 'We take this extremely seriously' },
  { id: 'offline', label: 'Offline behaviour', hint: 'Something happened on a date' },
  { id: 'other', label: 'Something else', hint: 'Tell us more' },
];

export const DEFAULT_FILTERS: DiscoveryFilters = {
  ageMin: 22,
  ageMax: 38,
  maxDistanceKm: 50,
  intents: [],
  verifiedOnly: false,
  heightMin: 140,
  heightMax: 200,
  languages: [],
};

const UNLIMITED = Number.POSITIVE_INFINITY;

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    tagline: 'Start your story',
    features: {
      dailyLikes: 25, dailyPicks: 3, seeWhoLiked: false, superLikesPerWeek: 1, undo: false,
      boostsPerMonth: 0, incognito: false, travelMode: false, messageBeforeMatch: 0, priorityPicks: false,
    },
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    priceMonthly: 499,
    tagline: 'Date with intention',
    features: {
      dailyLikes: UNLIMITED, dailyPicks: 7, seeWhoLiked: true, superLikesPerWeek: 5, undo: true,
      boostsPerMonth: 1, incognito: false, travelMode: false, messageBeforeMatch: 0, priorityPicks: false,
    },
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    priceMonthly: 999,
    tagline: 'The full DilSe experience',
    features: {
      dailyLikes: UNLIMITED, dailyPicks: 7, seeWhoLiked: true, superLikesPerWeek: 10, undo: true,
      boostsPerMonth: 4, incognito: true, travelMode: true, messageBeforeMatch: 1, priorityPicks: true,
    },
  },
};

export const PLAN_COMPARISON: { label: string; values: Record<PlanId, string | boolean> }[] = [
  { label: 'Daily likes', values: { free: '25', gold: 'Unlimited', platinum: 'Unlimited' } },
  { label: 'Daily Picks', values: { free: '3', gold: '7', platinum: '7 + priority' } },
  { label: 'See who liked you', values: { free: false, gold: true, platinum: true } },
  { label: 'Super likes / week', values: { free: '1', gold: '5', platinum: '10' } },
  { label: 'Undo swipe', values: { free: false, gold: true, platinum: true } },
  { label: 'Boosts / month', values: { free: '0', gold: '1', platinum: '4' } },
  { label: 'Incognito & travel mode', values: { free: false, gold: false, platinum: true } },
  { label: 'Message before matching', values: { free: false, gold: false, platinum: '1 / day' } },
];

export const STICKERS = ['💖', '😍', '🥰', '🔥', '🌹', '☕', '🎉', '🙈', '😂', '🤗', '✨', '🍕'];
export const QUICK_EMOJIS = ['😊', '😂', '🥰', '😍', '😘', '🤗', '😅', '🙈', '🔥', '❤️', '✨', '👋', '🎉', '☕', '🍕', '🌹', '😉', '🤔', '🙌', '💯'];
export const REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];
