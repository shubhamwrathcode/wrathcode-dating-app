import { calcAge } from '@/core/utils';
import { DiscoveryFilters, InterestedIn, Profile } from '@/data/models';
import { PROFILES_BY_ID, SEED_PROFILES } from '@/data/mock/profiles';

const genderMatches = (p: Profile, pref: InterestedIn) =>
  pref === 'everyone' || (pref === 'women' ? p.gender === 'woman' : p.gender === 'man');

export const passesFilters = (p: Profile, f: DiscoveryFilters) => {
  const age = calcAge(p.dob);
  if (age < f.ageMin || age > f.ageMax) {
    return false;
  }
  if (p.distanceKm > f.maxDistanceKm) {
    return false;
  }
  if (f.intents.length && !f.intents.includes(p.intent)) {
    return false;
  }
  if (f.verifiedOnly && !p.verified) {
    return false;
  }
  const h = p.lifestyle.heightCm ?? 0;
  if (h && (h < f.heightMin || h > f.heightMax)) {
    return false;
  }
  if (f.languages.length && !p.lifestyle.languages.some(l => f.languages.includes(l))) {
    return false;
  }
  return true;
};

export const profileRepository = {
  getAll(): Profile[] {
    return SEED_PROFILES;
  },

  getById(id: string): Profile | undefined {
    return PROFILES_BY_ID[id];
  },

  /** Profiles eligible for the swipe deck. */
  getDeck(opts: {
    interestedIn: InterestedIn;
    filters: DiscoveryFilters;
    excludeIds: Set<string>;
  }): Profile[] {
    return SEED_PROFILES.filter(
      p =>
        !opts.excludeIds.has(p.id) &&
        genderMatches(p, opts.interestedIn) &&
        passesFilters(p, opts.filters),
    );
  },

  /** Pool for Daily Picks / Likes You — gender preference only, filters ignored. */
  getPool(interestedIn: InterestedIn, excludeIds: Set<string>): Profile[] {
    return SEED_PROFILES.filter(p => !excludeIds.has(p.id) && genderMatches(p, interestedIn));
  },
};
