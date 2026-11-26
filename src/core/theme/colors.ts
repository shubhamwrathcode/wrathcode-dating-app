export interface Palette {
  primary: string;
  primarySoft: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  like: string;
  pass: string;
  superlike: string;
  success: string;
  warning: string;
  error: string;
  white: string;
  black: string;
  overlay: string;
  gold: string;
}

export const lightColors: Palette = {
  primary: '#7C03B2',
  primarySoft: '#F3E6FF',
  secondary: '#DE24F8',
  background: '#FCF8FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F6EDFF',
  textPrimary: '#1A1028',
  textSecondary: '#6B6280',
  border: '#ECE1F5',
  like: '#DE24F8',
  pass: '#9AA0AE',
  superlike: '#3BA8FF',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(20,4,40,0.55)',
  gold: '#F3B95F',
};

export const darkColors: Palette = {
  primary: '#C04EF0',
  primarySoft: '#2A1240',
  secondary: '#DE24F8',
  background: '#09101C',
  surface: '#151027',
  surfaceAlt: '#1E1633',
  textPrimary: '#F5F0FA',
  textSecondary: '#ABA2BF',
  border: '#2A2140',
  like: '#DE24F8',
  pass: '#6F6880',
  superlike: '#5AB8FF',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.65)',
  gold: '#F9D976',
};
