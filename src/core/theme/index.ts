import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';
import { darkColors, lightColors, Palette } from './colors';
import { gradients } from './gradients';
import { makeShadow, motion, radius, spacing, typography } from './tokens';

export * from './colors';
export * from './gradients';
export * from './tokens';

export interface Theme {
  isDark: boolean;
  colors: Palette;
  gradients: typeof gradients;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  motion: typeof motion;
  shadow: ReturnType<typeof makeShadow>;
  shadowSoft: ReturnType<typeof makeShadow>;
}

export const useIsDark = () => {
  const system = useColorScheme();
  const mode = useSettingsStore(s => s.themeMode);
  return mode === 'system' ? system === 'dark' : mode === 'dark';
};

export const useTheme = (): Theme => {
  const isDark = useIsDark();
  return useMemo(
    () => ({
      isDark,
      colors: isDark ? darkColors : lightColors,
      gradients,
      spacing,
      radius,
      typography,
      motion,
      shadow: makeShadow(isDark),
      shadowSoft: makeShadow(isDark, '#FF4D8D', 0.5),
    }),
    [isDark],
  );
};
