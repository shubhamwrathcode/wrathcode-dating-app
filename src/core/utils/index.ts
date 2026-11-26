import { MIN_AGE } from '@/core/constants';

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const calcAge = (dobISO: string, now = new Date()) => {
  const dob = new Date(dobISO);
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const isAdult = (dobISO: string) => calcAge(dobISO) >= MIN_AGE;

/** Parses DD/MM/YYYY into an ISO date, or null if invalid. */
export const parseDob = (input: string): string | null => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!m) {
    return null;
  }
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (d.getFullYear() !== Number(yyyy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) {
    return null;
  }
  if (d.getTime() > Date.now()) {
    return null;
  }
  return d.toISOString();
};

/** Auto-format typing into DD/MM/YYYY. */
export const maskDob = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join('/');
};

export const isValidIndianPhone = (phone: string) => /^[6-9]\d{9}$/.test(phone);

export const formatPhone = (phone: string) =>
  phone.length === 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : phone;

export const formatClock = (ts: number) => {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
};

export const formatRelative = (ts: number, now = Date.now()) => {
  const diff = Math.max(0, now - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) {
    return 'now';
  }
  if (min < 60) {
    return `${min}m`;
  }
  const hr = Math.floor(min / 60);
  if (hr < 24) {
    return `${hr}h`;
  }
  const days = Math.floor(hr / 24);
  if (days < 7) {
    return `${days}d`;
  }
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatDuration = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
};

export const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatHeight = (cm?: number) => {
  if (!cm) {
    return '';
  }
  const inches = Math.round(cm / 2.54);
  return `${Math.floor(inches / 12)}'${inches % 12}" · ${cm} cm`;
};

export const todayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** ISO week key, used to reset weekly super-like counters. */
export const weekKey = (d = new Date()) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${week}`;
};

export const monthKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}`;

/** Deterministic PRNG so the seeded demo data is identical on every launch. */
export const seededRandom = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pick = <T,>(arr: readonly T[], rnd: () => number) => arr[Math.floor(rnd() * arr.length)];

export const pickMany = <T,>(arr: readonly T[], n: number, rnd: () => number) => {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0]);
  }
  return out;
};

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const randomWaveform = (bars = 28) =>
  Array.from({ length: bars }, () => 0.2 + Math.random() * 0.8);

export const formatHoursMinutes = (ms: number) => {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};
