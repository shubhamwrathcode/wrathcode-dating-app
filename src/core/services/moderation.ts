/**
 * Client-side moderation. In production, text goes through a profanity
 * library and images through AWS Rekognition / Google Vision on upload.
 */
const BLOCKED_WORDS = ['fuck', 'shit', 'bitch', 'bastard', 'asshole', 'chutiya', 'madarchod', 'behenchod', 'harami', 'saala', 'kamina'];

const pattern = new RegExp(`\\b(${BLOCKED_WORDS.join('|')})\\b`, 'gi');

export const containsProfanity = (text: string) => {
  pattern.lastIndex = 0;
  return pattern.test(text);
};

export const maskProfanity = (text: string) =>
  text.replace(pattern, w => w[0] + '*'.repeat(Math.max(1, w.length - 1)));

/** Demo NSFW check: gallery items tagged `nsfw` are flagged, mirroring a vision API verdict. */
export const isNsfwImage = (uri: string) => uri.includes('nsfw=1');

const SCAM_HINTS = [/upi/i, /paytm/i, /send money/i, /bitcoin/i, /crypto invest/i, /whatsapp me/i];
export const looksLikeScam = (text: string) => SCAM_HINTS.some(r => r.test(text));
