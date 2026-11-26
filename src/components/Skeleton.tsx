import React, { useEffect } from 'react';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/core/theme';
import { GradientFill } from './GradientView';

/** Blush shimmer sweep (1.2s loop). Also used over the blurred "Likes you" grid. */
export const Shimmer = ({ duration = 1200, intensity = 0.55 }: { duration?: number; intensity?: number }) => {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduce) {
      t.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, false);
    }
  }, [t, duration, reduce]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(t.value, [0, 1], [-300, 400]) }, { rotate: '15deg' }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.shimmerWrap, style]}>
      <View style={styles.shimmer}>
        <GradientFill colors={['rgba(255,255,255,0)', `rgba(255,255,255,${intensity})`, 'rgba(255,255,255,0)']} angle={90} />
      </View>
    </Animated.View>
  );
};

export const Skeleton = ({
  width = '100%', height = 16, radius = 8, style,
}: { width?: DimensionValue; height?: DimensionValue; radius?: number; style?: StyleProp<ViewStyle> }) => {
  const { colors, isDark } = useTheme();
  return (
    <View style={[{ width, height, borderRadius: radius, backgroundColor: isDark ? colors.surfaceAlt : colors.primarySoft, overflow: 'hidden' }, style]}>
      <Shimmer intensity={isDark ? 0.08 : 0.6} />
    </View>
  );
};

export const ChatListSkeleton = () => (
  <View style={styles.list}>
    {Array.from({ length: 6 }).map((_, i) => (
      <View key={i} style={styles.row}>
        <Skeleton width={56} height={56} radius={28} />
        <View style={styles.lines}>
          <Skeleton width="45%" height={14} />
          <Skeleton width="80%" height={12} />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  shimmerWrap: { overflow: 'hidden' },
  shimmer: { width: 160, height: '200%', top: '-50%' },
  list: { paddingHorizontal: 20, paddingVertical: 16, gap: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  lines: { flex: 1, gap: 8 },
});
