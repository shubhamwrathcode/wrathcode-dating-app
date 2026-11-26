import React, { useEffect } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { HeartLogo, Text } from '@/components';
import { APP_NAME } from '@/core/constants';

interface Props {
  ready: boolean;
  onFinish: () => void;
}

/** Same size + position as the native launch screens (Android splash / iOS LaunchScreen), so the hand-off is invisible. */
const LOGO = 288;
/** Distance from screen centre to just below the heart (heart bottom ≈ 0.23 × LOGO below centre). */
const TEXT_OFFSET = LOGO * 0.26;

/**
 * In-app splash: picks up exactly where the native launch screen leaves off
 * (brand purple + centred DilSe mark), softly blends into the brand gradient,
 * shows the name + tagline, then fades out once stores are hydrated.
 */
export const SplashScreen = ({ ready, onFinish }: Props) => {
  const { width, height } = useWindowDimensions();
  // Android's native launch window already shows the gradient; iOS LaunchScreen is solid purple, so blend it in there.
  const gradient = useSharedValue(Platform.OS === 'android' ? 1 : 0);
  const fade = useSharedValue(1);

  useEffect(() => {
    gradient.value = withTiming(1, { duration: 400 });
  }, [gradient]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const t = setTimeout(() => {
      fade.value = withTiming(0, { duration: 300 }, done => {
        if (done) {
          runOnJS(onFinish)();
        }
      });
    }, 900);
    return () => clearTimeout(t);
  }, [ready, fade, onFinish]);

  const gradientStyle = useAnimatedStyle(() => ({ opacity: gradient.value }));
  const rootStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, rootStyle]}>
      <Animated.View style={[StyleSheet.absoluteFill, gradientStyle]}>
        {/* Drawn at the known screen size (no measure pass), so the very first frame already has the gradient. */}
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="splashBg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#320066" />
              <Stop offset="0.5" stopColor="#7C03B2" />
              <Stop offset="1" stopColor="#DE24F8" />
            </LinearGradient>
          </Defs>
          <Rect width={width} height={height} fill="url(#splashBg)" />
        </Svg>
      </Animated.View>

      <View style={styles.center} pointerEvents="none">
        <HeartLogo size={LOGO} />
      </View>

      <Animated.View entering={FadeIn.delay(150).duration(300)} style={styles.texts} pointerEvents="none">
        <Text variant="h1" color="#fff" center style={styles.brand}>
          {APP_NAME}
        </Text>
        <Text variant="romantic" color="rgba(255,255,255,0.9)" center style={styles.tagline}>
          Date with intention
        </Text>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.footer}>
        <Text variant="micro" color="rgba(255,255,255,0.7)" center>
          by Wrathcode Technology
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { zIndex: 100, backgroundColor: '#320066' },
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  texts: { position: 'absolute', left: 0, right: 0, top: '50%', marginTop: TEXT_OFFSET },
  brand: { letterSpacing: 1 },
  tagline: { fontSize: 20, lineHeight: 28, marginTop: 2 },
  footer: { position: 'absolute', bottom: 48, left: 0, right: 0 },
});
