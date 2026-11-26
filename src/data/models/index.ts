export type Gender = 'man' | 'woman' | 'nonbinary';
export type InterestedIn = 'men' | 'women' | 'everyone';
export type Intent = 'long_term' | 'marriage' | 'open';
export type Frequency = 'never' | 'socially' | 'often';
export type PlanId = 'free' | 'gold' | 'platinum';

export interface ProfilePrompt {
  question: string;
  answer: string;
}

export interface Lifestyle {
  heightCm?: number;
  education?: string;
  job?: string;
  company?: string;
  drinking?: Frequency;
  smoking?: Frequency;
  religion?: string;
  languages: string[];
}

export interface Profile {
  id: string;
  name: string;
  dob: string; // ISO date
  gender: Gender;
  intent: Intent;
  photos: string[];
  bio: string;
  interests: string[];
  prompts: ProfilePrompt[];
  values: string[];
  lifestyle: Lifestyle;
  city: string;
  distanceKm: number;
  verified: boolean;
  online: boolean;
  lastActiveAt: number;
  voiceIntroSec?: number;
  /** Local file URI of the recorded voice intro. */
  voiceIntroUri?: string;
  videoPrompt?: boolean;
  /** Demo flag: this profile already liked the current user (drives instant matches). */
  likedMe: boolean;
  superLikedMe?: boolean;
  isPremium?: boolean;
}

export interface CurrentUser extends Profile {
  phone: string;
  interestedIn: InterestedIn;
  locationGranted: boolean;
  familyMode?: boolean;
}

export type MessageType = 'text' | 'emoji' | 'sticker' | 'photo' | 'voice' | 'date' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface DateProposal {
  place: string;
  area: string;
  dateISO: string;
  time: string;
  status: 'proposed' | 'accepted' | 'declined';
  sharedWithContact?: boolean;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string; // 'me' or profile id
  type: MessageType;
  text?: string;
  uri?: string;
  durationSec?: number;
  waveform?: number[];
  date?: DateProposal;
  createdAt: number;
  status: MessageStatus;
  reactions?: string[];
  replyToId?: string;
  /** True if the moderation layer hid/blurred the content */
  flagged?: boolean;
}

export interface Match {
  id: string;
  profileId: string;
  createdAt: number;
  lastMessageAt?: number;
  unread: number;
  viaSuperLike?: boolean;
  closed?: boolean;
  closedReason?: string;
}

export type SwipeAction = 'like' | 'pass' | 'superlike';

export interface SwipeRecord {
  profileId: string;
  action: SwipeAction;
  at: number;
  matchId?: string;
}

export interface DiscoveryFilters {
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  intents: Intent[];
  verifiedOnly: boolean;
  heightMin: number;
  heightMax: number;
  languages: string[];
}

export interface CompatibilityResult {
  score: number;
  reasons: { label: string; detail: string; icon: 'heart' | 'sparkles' | 'target' | 'globe' | 'wine' }[];
  sharedInterests: string[];
}

export type NotificationKind = 'match' | 'message' | 'like' | 'picks' | 'safety' | 'premium';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  profileId?: string;
  matchId?: string;
}

export interface TrustedContact {
  name: string;
  phone: string;
}

export interface PlanFeatures {
  dailyLikes: number; // Infinity for unlimited
  dailyPicks: number;
  seeWhoLiked: boolean;
  superLikesPerWeek: number;
  undo: boolean;
  boostsPerMonth: number;
  incognito: boolean;
  travelMode: boolean;
  messageBeforeMatch: number;
  priorityPicks: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  tagline: string;
  features: PlanFeatures;
}

export type ReportReason =
  | 'fake'
  | 'inappropriate'
  | 'harassment'
  | 'scam'
  | 'underage'
  | 'offline'
  | 'other';
