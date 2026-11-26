import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/core/theme';
import { Text } from './Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  score: number;
  size?: number;
  stroke?: number;
  delay?: number;
  light?: boolean;
}

/** Compatibility ring: gradient stroke fills 0 → score with a count-up label (800ms). */
export const MatchRing = ({ score, size = 64, stroke = 6, delay = 0, light }: Props) => {
  const { colors } = useTheme();
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = useSharedValue(0);
  const [display, setDisplay] = useState(reduce ? score : 0);

  useEffect(() => {
    if (reduce) {
      progress.value = score / 100;
      setDisplay(score);
      return;
    }
    progress.value = withDelay(delay, withTiming(score / 100, { duration: 800, easing: Easing.out(Easing.cubic) }));
    let raf = 0;
    const start = Date.now() + delay;
    const tick = () => {
      const t = Math.min(1, Math.max(0, (Date.now() - start) / 800));
      setDisplay(Math.round(score * (1 - Math.pow(1 - t, 3))));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, delay, reduce, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size }} accessibilityLabel={`${score}% compatible`}>
      <Svg width={size} height={size} style={styles.rotate}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#7C03B2" />
            <Stop offset="0.5" stopColor="#A218C2" />
            <Stop offset="1" stopColor="#DE24F8" />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={light ? 'rgba(255,255,255,0.25)' : colors.primarySoft} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text variant={size > 70 ? 'h3' : 'captionMedium'} color={light ? '#fff' : colors.textPrimary} weight="700">
          {display}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rotate: { transform: [{ rotate: '-90deg' }] },
  center: { alignItems: 'center', justifyContent: 'center' },
});
