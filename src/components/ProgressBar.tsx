import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/core/theme';
import { GradientView } from './GradientView';

/** Gradient progress bar that springs to its new value. */
export const ProgressBar = ({ progress, height = 6 }: { progress: number; height?: number }) => {
  const { colors } = useTheme();
  const reduce = useReducedMotion();
  const value = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, progress));
    value.value = reduce ? withTiming(clamped, { duration: 0 }) : withTiming(clamped, { duration: 300 });
  }, [progress, reduce, value]);

  const fill = useAnimatedStyle(() => ({ width: `${value.value * 100}%` }));

  return (
    <View style={[styles.track, { height, backgroundColor: colors.primarySoft }]}>
      <Animated.View style={[styles.fill, fill]}>
        <GradientView name="primary" style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: { width: '100%', borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, overflow: 'hidden' },
});
