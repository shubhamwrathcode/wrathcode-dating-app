import {
  CITIES,
  EDUCATION_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGES,
  PROMPT_QUESTIONS,
  VALUES,
} from '@/core/constants';
import { pick, pickMany, seededRandom } from '@/core/utils';
import { Frequency, Gender, Intent, Profile } from '@/data/models';
import { MEN_PHOTOS, WOMEN_PHOTOS } from './photos';

const WOMEN = ['Ananya', 'Isha', 'Kavya', 'Meera', 'Riya', 'Saanvi', 'Tara', 'Aditi', 'Diya', 'Nisha', 'Pooja', 'Sneha', 'Aisha', 'Zoya', 'Priya', 'Neha', 'Shreya', 'Kiara', 'Myra', 'Anika', 'Ira', 'Naina', 'Tanvi', 'Avni', 'Mahi', 'Sana', 'Rhea', 'Simran', 'Jhanvi', 'Aarohi', 'Khushi', 'Nandini', 'Radhika', 'Vidhi', 'Ishita', 'Mansi', 'Trisha', 'Palak'];
const MEN = ['Arjun', 'Kabir', 'Rohan', 'Vihaan', 'Aditya', 'Dev', 'Ishaan', 'Karan', 'Neil', 'Rahul', 'Siddharth', 'Varun', 'Yash', 'Aryan', 'Kunal', 'Nikhil', 'Pranav', 'Reyansh', 'Samar', 'Veer', 'Zayan', 'Arnav', 'Dhruv', 'Harsh', 'Kartik', 'Manav', 'Parth', 'Rudra', 'Shaurya', 'Tejas', 'Uday', 'Vivaan'];

const JOBS = [
  ['Product Designer', 'Zomato'], ['Software Engineer', 'Razorpay'], ['Architect', 'Studio Lotus'],
  ['Chartered Accountant', 'Deloitte'], ['Doctor', 'Fortis'], ['Marketing Lead', 'Nykaa'],
  ['Founder', 'Stealth startup'], ['Data Scientist', 'Flipkart'], ['Lawyer', 'Khaitan & Co'],
  ['Teacher', 'DPS'], ['Content Creator', 'Freelance'], ['Consultant', 'McKinsey'],
  ['Pilot', 'IndiGo'], ['Chef', 'The Leela'], ['Product Manager', 'Swiggy'], ['Photographer', 'Freelance'],
];

const BIOS = [
  'Weekend trekker, weekday overthinker. Looking for my favourite person to share chai with.',
  'Equal parts ambition and Sunday naps. I’ll always share my fries.',
  'Family-first, adventure-second, dessert always. Let’s skip the small talk.',
  'Building things by day, burning dinners by night. Swipe right if you can cook.',
  'Believer in long walks, longer conversations and good playlists.',
  'Here for something real. Kind, curious and a little bit dramatic about food.',
  'Bookshop wanderer. Will plan the trip, will forget the charger.',
  'Gym at 7, office at 10, Netflix at 11. Looking for someone to break the routine with.',
];

const ANSWERS: Record<string, string[]> = {
  'My ideal Sunday…': ['Late breakfast, a long drive and golgappe at sunset.', 'Farmers market, a new recipe and a nap I didn’t plan.', 'Badminton in the morning, board games with friends at night.'],
  'A green flag I look for…': ['Someone who’s kind to waiters and texts back.', 'You remember the little things I mention once.', 'Close with your family, honest about your feelings.'],
  'The way to win me over is…': ['Bring me filter coffee and a terrible pun.', 'Plan a surprise picnic. Bonus points for good playlists.', 'Be curious. Ask me the second question.'],
  'I geek out on…': ['Old Bollywood songs and their backstories.', 'Space documentaries and F1 strategy.', 'Interior design reels at 2 AM.'],
  'My simple pleasures…': ['Rain, chai and pakode. Classic for a reason.', 'Window seat, headphones, no notifications.', 'A clean kitchen and a new candle.'],
  'Together we could…': ['Try every momo place in the city and rank them.', 'Road trip to the mountains with a ridiculous playlist.', 'Build a tiny garden on the balcony.'],
  'A life goal of mine…': ['Visit 30 countries before 35.', 'Open a small café that doubles as a bookstore.', 'Run a full marathon and not cry at the end.'],
  'I’m looking for someone who…': ['Wants a partner, not a project.', 'Laughs easily and loves deeply.', 'Is ready for something real and isn’t scared to say it.'],
  'Two truths and a lie…': ['I’ve met Shah Rukh, I can’t whistle, I’ve skydived.', 'I speak 4 languages, I hate mangoes, I’ve been on TV.', 'I’ve never seen snow, I can juggle, I own 40 plants.'],
  'My love language is…': ['Quality time. Phones away, conversations on.', 'Acts of service — I will absolutely fix your playlist.', 'Words of affirmation and good morning texts.'],
};

const FREQ: Frequency[] = ['never', 'socially', 'often'];
const INTENT_POOL: Intent[] = ['long_term', 'long_term', 'marriage', 'marriage', 'open'];

const makeProfile = (index: number, gender: Gender, name: string, rnd: () => number): Profile => {
  const age = 23 + Math.floor(rnd() * 14);
  const now = new Date();
  const dob = new Date(now.getFullYear() - age, Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 27));
  const pool = gender === 'woman' ? WOMEN_PHOTOS : MEN_PHOTOS;
  const start = index % pool.length;
  const photoCount = 3 + Math.floor(rnd() * 2);
  const photos = Array.from({ length: photoCount }, (_, k) => pool[(start + k * 5) % pool.length]);
  const cityObj = pick(CITIES, rnd);
  const [job, company] = pick(JOBS, rnd);
  const prompts = pickMany(PROMPT_QUESTIONS, 3, rnd).map(q => ({ question: q, answer: pick(ANSWERS[q], rnd) }));
  const langs = ['English', 'Hindi', ...pickMany(LANGUAGES.slice(2), Math.floor(rnd() * 2), rnd)];

  return {
    id: `p_${index.toString().padStart(2, '0')}`,
    name,
    dob: dob.toISOString(),
    gender,
    intent: pick(INTENT_POOL, rnd),
    photos,
    bio: pick(BIOS, rnd),
    interests: pickMany(INTEREST_OPTIONS, 5 + Math.floor(rnd() * 4), rnd),
    prompts,
    values: pickMany(VALUES, 3, rnd),
    lifestyle: {
      heightCm: gender === 'woman' ? 152 + Math.floor(rnd() * 22) : 165 + Math.floor(rnd() * 24),
      education: pick(EDUCATION_OPTIONS, rnd),
      job,
      company,
      drinking: pick(FREQ, rnd),
      smoking: rnd() > 0.8 ? 'socially' : 'never',
      languages: langs,
    },
    city: `${pick(cityObj.areas, rnd)}, ${cityObj.city}`,
    distanceKm: 1 + Math.floor(rnd() * 45),
    verified: rnd() > 0.3,
    online: rnd() > 0.62,
    lastActiveAt: Date.now() - Math.floor(rnd() * 36) * 3600000,
    voiceIntroSec: rnd() > 0.5 ? 9 + Math.floor(rnd() * 6) : undefined,
    videoPrompt: rnd() > 0.7,
    likedMe: rnd() > 0.55,
    superLikedMe: rnd() > 0.92,
    isPremium: rnd() > 0.8,
  };
};

const buildSeed = (): Profile[] => {
  const rnd = seededRandom(20261118);
  const out: Profile[] = [];
  WOMEN.forEach((n, i) => out.push(makeProfile(i + 1, 'woman', n, rnd)));
  MEN.forEach((n, i) => out.push(makeProfile(WOMEN.length + i + 1, 'man', n, rnd)));
  return out;
};

/** 70 seeded demo profiles (38 women, 32 men) across Indian cities. */
export const SEED_PROFILES: Profile[] = buildSeed();

export const PROFILES_BY_ID: Record<string, Profile> = Object.fromEntries(
  SEED_PROFILES.map(p => [p.id, p]),
);
