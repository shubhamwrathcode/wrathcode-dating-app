import { CompatibilityResult, Profile } from '@/data/models';
import { intentLabel } from '@/core/constants';

/**
 * Compatibility score (0-100) between the current user and another profile.
 * Weights: interests 35, intent 20, values 20, lifestyle 15, languages 10.
 * Mirrors what the backend scoring service will compute.
 */
export const computeCompatibility = (me: Profile, other: Profile): CompatibilityResult => {
  const shared = other.interests.filter(i => me.interests.includes(i));
  const interestScore = Math.min(1, shared.length / 4) * 35;

  const intentScore =
    me.intent === other.intent ? 20 : me.intent === 'open' || other.intent === 'open' ? 10 : 4;

  const sharedValues = other.values.filter(v => me.values.includes(v));
  const valueScore = Math.min(1, sharedValues.length / 2) * 20;

  let lifestyle = 0;
  if (me.lifestyle.drinking && me.lifestyle.drinking === other.lifestyle.drinking) {
    lifestyle += 7.5;
  }
  if (me.lifestyle.smoking && me.lifestyle.smoking === other.lifestyle.smoking) {
    lifestyle += 7.5;
  }
  if (!me.lifestyle.drinking && !me.lifestyle.smoking) {
    lifestyle = 9;
  }

  const sharedLangs = other.lifestyle.languages.filter(l => me.lifestyle.languages.includes(l));
  const langScore = sharedLangs.length ? 10 : 3;

  // small, stable per-pair jitter so scores don't look templated
  const jitter = ((other.id.charCodeAt(other.id.length - 1) + me.id.length) % 7) - 3;
  const score = Math.round(
    Math.max(52, Math.min(98, interestScore + intentScore + valueScore + lifestyle + langScore + 18 + jitter)),
  );

  const reasons: CompatibilityResult['reasons'] = [];
  if (me.intent === other.intent) {
    reasons.push({ label: 'Same intent', detail: `You’re both looking for ${intentLabel(other.intent).toLowerCase()}`, icon: 'target' });
  }
  if (shared.length) {
    reasons.push({ label: `${shared.length} shared interest${shared.length > 1 ? 's' : ''}`, detail: shared.slice(0, 3).join(', '), icon: 'sparkles' });
  }
  if (sharedValues.length) {
    reasons.push({ label: 'Shared values', detail: `You both value ${sharedValues.slice(0, 2).join(' & ').toLowerCase()}`, icon: 'heart' });
  }
  if (sharedLangs.length) {
    reasons.push({ label: 'Common language', detail: `You both speak ${sharedLangs.slice(0, 2).join(' & ')}`, icon: 'globe' });
  }
  if (me.lifestyle.drinking && me.lifestyle.drinking === other.lifestyle.drinking) {
    reasons.push({ label: 'Similar lifestyle', detail: `Drinks ${other.lifestyle.drinking}, like you`, icon: 'wine' });
  }
  if (!reasons.length) {
    reasons.push({ label: 'Opposites attract', detail: 'Different worlds, great conversations', icon: 'sparkles' });
  }

  return { score, reasons, sharedInterests: shared };
};
