import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming,
} from 'react-native-reanimated';

const LiveBar = ({ i, color, height }: { i: number; color: string; height: number }) => {
  const v = useSharedValue(0.3);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!reduce) {
      v.value = withDelay(
        (i * 53) % 400,
        withRepeat(withTiming(0.35 + ((i * 37) % 60) / 100, { duration: 260 + ((i * 71) % 220), easing: Easing.inOut(Easing.ease) }), -1, true),
      );
    }
  }, [i, v, reduce]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: v.value }] }));
  return <Animated.View style={[styles.bar, { height, backgroundColor: color }, style]} />;
};

interface Props {
  bars?: number[];
  live?: boolean;
  /** 0..1 playback progress — bars before it use `activeColor` */
  progress?: number;
  color: string;
  activeColor?: string;
  height?: number;
  count?: number;
}

/** Voice waveform: live (recording) or static with playback progress fill. */
export const Waveform = ({ bars, live, progress = 0, color, activeColor, height = 28, count = 28 }: Props) => {
  if (live) {
    return (
      <View style={[styles.row, { height }]}>
        {Array.from({ length: count }).map((_, i) => (
          <LiveBar key={i} i={i} color={color} height={height} />
        ))}
      </View>
    );
  }
  const data = bars ?? Array.from({ length: count }, (_, i) => 0.3 + (((i * 37) % 70) / 100));
  return (
    <View style={[styles.row, { height }]}>
      {data.map((b, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { height: Math.max(3, b * height), backgroundColor: i / data.length < progress ? activeColor ?? color : color },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2.5 },
  bar: { width: 3, borderRadius: 2 },
});
