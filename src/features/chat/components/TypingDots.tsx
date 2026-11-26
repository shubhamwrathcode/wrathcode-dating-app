import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/core/theme';

const Dot = ({ i, size, color }: { i: number; size: number; color: string }) => {
  const y = useSharedValue(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!reduce) {
      y.value = withDelay(i * 140, withRepeat(withSequence(withTiming(-size * 0.8, { duration: 260 }), withTiming(0, { duration: 260 })), -1, false));
    }
  }, [i, size, y, reduce]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: 0.5 + Math.abs(y.value) / (size * 1.6) }));
  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />;
};

/** Three bouncing dots. */
export const TypingDots = ({ small }: { small?: boolean }) => {
  const { colors } = useTheme();
  const size = small ? 5 : 8;
  return (
    <View style={[styles.row, { gap: size * 0.7 }]}>
      {[0, 1, 2].map(i => (
        <Dot key={i} i={i} size={size} color={small ? colors.primary : colors.textSecondary} />
      ))}
    </View>
  );
};

export const TypingBubble = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TypingDots />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', height: 14 },
  bubble: {
    alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, borderBottomLeftRadius: 6,
    borderWidth: StyleSheet.hairlineWidth, marginLeft: 16, marginBottom: 8,
  },
});
