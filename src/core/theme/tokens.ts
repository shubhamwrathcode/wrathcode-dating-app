import { Platform, TextStyle, ViewStyle } from 'react-native';

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** Horizontal padding used by every screen */
  screen: 20,
  /** Gap between stacked cards / sections */
  section: 16,
} as const;

export const radius = {
  card: 24,
  sheet: 24,
  input: 16,
  md: 12,
  sm: 8,
  pill: 999,
} as const;

/**
 * Poppins (soft, rounded, friendly) for UI + Lora SemiBold Italic for romantic
 * moments. Files live in assets/fonts; names match the PostScript names so the
 * same string works on iOS and Android.
 */
export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  bold: 'Poppins-Bold',
  romantic: 'Lora-SemiBoldItalic',
};

/** Maps a numeric weight to the matching font file (custom fonts ignore fontWeight on Android). */
export const fontForWeight = (w?: TextStyle['fontWeight']) => {
  const n = typeof w === 'number' ? w : Number(w);
  if (w === 'bold' || n >= 650) {
    return fonts.bold;
  }
  if (n >= 500) {
    return fonts.medium;
  }
  return fonts.regular;
};

export const typography = {
  h1: { fontSize: 26, lineHeight: 34, fontFamily: fonts.bold },
  h2: { fontSize: 21, lineHeight: 28, fontFamily: fonts.bold },
  h3: { fontSize: 17, lineHeight: 24, fontFamily: fonts.medium },
  title: { fontSize: 15, lineHeight: 22, fontFamily: fonts.medium },
  body: { fontSize: 14, lineHeight: 21, fontFamily: fonts.regular },
  bodyMedium: { fontSize: 14, lineHeight: 21, fontFamily: fonts.medium },
  caption: { fontSize: 12, lineHeight: 18, fontFamily: fonts.regular },
  captionMedium: { fontSize: 12, lineHeight: 18, fontFamily: fonts.medium },
  micro: { fontSize: 10.5, lineHeight: 15, fontFamily: fonts.medium },
  romantic: { fontSize: 30, lineHeight: 40, fontFamily: fonts.romantic, paddingHorizontal: 4 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export const makeShadow = (isDark: boolean, color = '#FF4D8D', strength = 1): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: isDark ? 0 : 12 },
      shadowOpacity: (isDark ? 0.35 : 0.18) * strength,
      shadowRadius: isDark ? 18 : 16,
    },
    default: {
      elevation: 8 * strength,
      shadowColor: color,
    },
  }) as ViewStyle;

export const motion = {
  fast: 200,
  normal: 250,
  slow: 350,
  celebration: 1800,
  spring: { damping: 15, stiffness: 160, mass: 1 },
  softSpring: { damping: 18, stiffness: 120, mass: 1 },
} as const;
