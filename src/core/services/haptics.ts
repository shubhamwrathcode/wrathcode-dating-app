import { Platform, Vibration } from 'react-native';

/**
 * Haptics facade. Uses the core Vibration API so the demo has zero native
 * setup; swap the internals for react-native-haptic-feedback / expo-haptics
 * without touching call sites.
 */
const vibrate = (pattern: number | number[]) => {
  try {
    Vibration.vibrate(pattern as number);
  } catch {
    // vibration unavailable (simulator)
  }
};

export const haptics = {
  light: () => vibrate(Platform.OS === 'android' ? 12 : 10),
  medium: () => vibrate(Platform.OS === 'android' ? 25 : 20),
  success: () => vibrate(Platform.OS === 'android' ? [0, 30, 60, 40] : 40),
  warning: () => vibrate(Platform.OS === 'android' ? [0, 50, 40, 50] : 60),
  selection: () => vibrate(8),
};
