import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Icon } from './Icon';

const { width: W, height: H } = Dimensions.get('window');

const FloatingHeart = ({ index }: { index: number }) => {
  const t = useSharedValue(0);
  const cfg = useMemo(
    () => ({
      x: Math.random() * (W - 40),
      size: 14 + Math.random() * 22,
      duration: 4200 + Math.random() * 2600,
      delay: index * 420,
      drift: (Math.random() - 0.5) * 80,
      opacity: 0.35 + Math.random() * 0.5,
    }),
    [index],
  );

  useEffect(() => {
    t.value = withDelay(cfg.delay, withRepeat(withTiming(1, { duration: cfg.duration, easing: Easing.out(Easing.quad) }), -1, false));
  }, [t, cfg]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.1 ? t.value * 10 * cfg.opacity : cfg.opacity * (1 - t.value),
    transform: [
      { translateY: H * 0.15 + (1 - t.value) * H * 0.8 - H * 0.15 },
      { translateX: cfg.drift * Math.sin(t.value * Math.PI * 2) },
      { scale: 0.6 + t.value * 0.6 },
    ],
  }));

  return (
    <Animated.View style={[styles.abs, { left: cfg.x }, style]}>
      <Icon name="heart" filled size={cfg.size} color="rgba(255,255,255,0.9)" />
    </Animated.View>
  );
};

/** Idle loop of hearts drifting upward (match screen, splash). */
export const FloatingHearts = ({ count = 12 }: { count?: number }) => {
  const reduce = useReducedMotion();
  if (reduce) {
    return null;
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }).map((_, i) => (
        <FloatingHeart key={i} index={i} />
      ))}
    </View>
  );
};

const CONFETTI_COLORS = ['#7C03B2', '#DE24F8', '#EE73FF', '#A218C2', '#F9D976', '#FFFFFF'];

const ConfettiPiece = ({ index, originY }: { index: number; originY: number }) => {
  const t = useSharedValue(0);
  const cfg = useMemo(() => {
    const angle = (Math.PI * 2 * index) / 40 + Math.random() * 0.4;
    const power = 140 + Math.random() * 220;
    return {
      dx: Math.cos(angle) * power,
      dy: Math.sin(angle) * power - 120,
      rot: (Math.random() - 0.5) * 900,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
    };
  }, [index]);

  useEffect(() => {
    t.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) });
  }, [t]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, t.value - 0.6) / 0.4,
    transform: [
      { translateX: cfg.dx * t.value },
      { translateY: cfg.dy * t.value + 380 * t.value * t.value },
      { rotate: `${cfg.rot * t.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[styles.abs, { left: W / 2, top: originY, width: cfg.w, height: cfg.h, backgroundColor: cfg.color, borderRadius: 2 }, style]}
    />
  );
};

/** One-shot confetti burst. Change `burstKey` to fire again. */
export const Confetti = ({ burstKey = 0, originY = H * 0.35 }: { burstKey?: number; originY?: number }) => {
  const reduce = useReducedMotion();
  if (reduce) {
    return null;
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} key={burstKey}>
      {Array.from({ length: 40 }).map((_, i) => (
        <ConfettiPiece key={i} index={i} originY={originY} />
      ))}
    </View>
  );
};

/** Small particle burst around a button (like / super like). */
export const ParticleBurst = ({ trigger, color = '#DE24F8' }: { trigger: number; color?: string }) => {
  const reduce = useReducedMotion();
  if (!trigger || reduce) {
    return null;
  }
  return (
    <View pointerEvents="none" style={styles.burst} key={trigger}>
      {Array.from({ length: 8 }).map((_, i) => (
        <BurstDot key={i} angle={(Math.PI * 2 * i) / 8} color={color} />
      ))}
    </View>
  );
};

const BurstDot = ({ angle, color }: { angle: number; color: string }) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withSequence(withTiming(1, { duration: 420, easing: Easing.out(Easing.quad) }));
  }, [t]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ translateX: Math.cos(angle) * 38 * t.value }, { translateY: Math.sin(angle) * 38 * t.value }, { scale: 1 - t.value * 0.5 }],
  }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
};

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  burst: { position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 },
  dot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, marginLeft: -3.5, marginTop: -3.5 },
});
