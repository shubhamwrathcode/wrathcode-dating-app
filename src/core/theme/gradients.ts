export interface GradientToken {
  colors: string[];
  locations?: number[];
  /** CSS-style angle in degrees (0° = to top, 90° = to right). */
  angle: number;
}

export const gradients = {
  /** Wrathcode Violet (logo) — primary buttons, like button, active tab, sent bubbles */
  primary: {
    colors: ['#7C03B2', '#A218C2', '#DE24F8'],
    locations: [0, 0.5, 1],
    angle: 135,
  },
  /** Wrathcode Night (logo) — splash, match screen, onboarding hero */
  romance: {
    colors: ['#320066', '#7C03B2', '#DE24F8'],
    locations: [0, 0.55, 1],
    angle: 160,
  },
  /** Deep Violet — platinum, paywall header */
  premium: {
    colors: ['#09101C', '#320066', '#7C03B2'],
    locations: [0, 0.5, 1],
    angle: 135,
  },
  /** Champagne — gold plan, super like, boost */
  gold: { colors: ['#F9D976', '#F39F86'], angle: 135 },
  /** Lavender Mist — light backgrounds */
  soft: { colors: ['#FBF6FF', '#F2E6FF'], angle: 180 },
  /** Wrathcode Navy — dark backgrounds */
  night: { colors: ['#160C2A', '#09101C'], angle: 180 },
  /** Card overlay for text readability on photos */
  cardOverlay: {
    colors: ['rgba(0,0,0,0)', 'rgba(20,4,40,0.85)'],
    locations: [0.45, 1],
    angle: 180,
  },
  glass: {
    colors: ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.08)'],
    angle: 135,
  },
  superlike: { colors: ['#3BA8FF', '#6FC3FF'], angle: 135 },
} satisfies Record<string, GradientToken>;

export type GradientName = keyof typeof gradients;
