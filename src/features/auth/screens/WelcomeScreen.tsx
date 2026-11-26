import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import {
  Button, GradientView, Icon, IntentBadge, MatchRing, Screen, SmartImage, Text, VerifiedTick,
} from '@/components';
import { useT } from '@/core/i18n';
import { MEN_PHOTOS, WOMEN_PHOTOS } from '@/data/mock/photos';
import { SLIDE_WIDTH, useWelcomeViewModel, WELCOME_SLIDES } from '../viewmodels/useWelcomeViewModel';

const Illustration = ({ kind }: { kind: (typeof WELCOME_SLIDES)[number]['key'] }) => {
  if (kind === 'intent') {
    return (
      <View style={styles.illus}>
        <View style={[styles.photoCard, styles.cardBack]}>
          <SmartImage uri={MEN_PHOTOS[1]} style={StyleSheet.absoluteFill} />
        </View>
        <View style={[styles.photoCard, styles.cardFront]}>
          <SmartImage uri={WOMEN_PHOTOS[4]} style={StyleSheet.absoluteFill} />
          <GradientView name="cardOverlay" style={StyleSheet.absoluteFill} />
          <View style={styles.cardInfo}>
            <IntentBadge intent="long_term" glass />
          </View>
        </View>
        <View style={styles.floatingBadge}>
          <IntentBadge intent="marriage" />
        </View>
      </View>
    );
  }
  if (kind === 'picks') {
    return (
      <View style={styles.illus}>
        <View style={[styles.photoCard, styles.cardFront]}>
          <SmartImage uri={WOMEN_PHOTOS[9]} style={StyleSheet.absoluteFill} />
          <GradientView name="cardOverlay" style={StyleSheet.absoluteFill} />
          <View style={styles.ringSpot}>
            <MatchRing score={92} size={74} light delay={300} />
          </View>
        </View>
        <GradientView name="gold" style={styles.sparkle}>
          <Icon name="sparkles" size={26} color="#3B2410" />
        </GradientView>
      </View>
    );
  }
  return (
    <View style={styles.illus}>
      <GradientView name="romance" style={styles.shield}>
        <Icon name="shieldCheck" size={84} color="#fff" strokeWidth={1.4} />
      </GradientView>
      <View style={styles.tick}>
        <VerifiedTick size={44} />
      </View>
    </View>
  );
};

const Slide = ({ index, scrollX, item }: { index: number; scrollX: SharedValue<number>; item: (typeof WELCOME_SLIDES)[number] }) => {
  const range = [(index - 1) * SLIDE_WIDTH, index * SLIDE_WIDTH, (index + 1) * SLIDE_WIDTH];
  // Parallax: illustration moves at 40% speed of the text
  const illusStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scrollX.value, range, [SLIDE_WIDTH * 0.6, 0, -SLIDE_WIDTH * 0.6], Extrapolation.CLAMP) * 0.4 },
      { scale: interpolate(scrollX.value, range, [0.85, 1, 0.85], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(scrollX.value, range, [0, 1, 0], Extrapolation.CLAMP),
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollX.value, range, [24, 0, 24], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={{ width: SLIDE_WIDTH }}>
      <Animated.View style={[styles.illusWrap, illusStyle]}>
        <Illustration kind={item.key} />
      </Animated.View>
      <Animated.View style={[styles.textWrap, textStyle]}>
        <Text variant="h1" center>
          {item.title}
        </Text>
        <Text muted center style={styles.body}>
          {item.body}
        </Text>
      </Animated.View>
    </View>
  );
};

const Dot = ({ i, scrollX }: { i: number; scrollX: SharedValue<number> }) => {
  const style = useAnimatedStyle(() => {
    const p = interpolate(scrollX.value / SLIDE_WIDTH, [i - 1, i, i + 1], [0, 1, 0], Extrapolation.CLAMP);
    return { width: 8 + p * 18, opacity: 0.35 + p * 0.65 };
  });
  return (
    <Animated.View style={[styles.dot, style]}>
      <GradientView name="primary" style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
};

export const WelcomeScreen = () => {
  const vm = useWelcomeViewModel();
  const t = useT();

  return (
    <Screen background="soft">
      <Animated.ScrollView
        ref={vm.listRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={vm.onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={e => vm.onMomentumEnd(e.nativeEvent.contentOffset.x)}>
        {WELCOME_SLIDES.map((s, i) => (
          <Slide key={s.key} index={i} item={s} scrollX={vm.scrollX} />
        ))}
      </Animated.ScrollView>
      <View style={styles.dots}>
        {WELCOME_SLIDES.map((s, i) => (
          <Dot key={s.key} i={i} scrollX={vm.scrollX} />
        ))}
      </View>
      <View style={styles.actions}>
        <Button title={vm.isLast ? t('welcome.cta') : 'Next'} onPress={vm.next} iconRight="chevronRight" />
        <Button title={t('welcome.login')} variant="ghost" onPress={vm.start} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  illusWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  illus: { width: 280, height: 340, alignItems: 'center', justifyContent: 'center' },
  photoCard: { position: 'absolute', width: 210, height: 290, borderRadius: 28, overflow: 'hidden', borderWidth: 4, borderColor: '#fff' },
  cardBack: { transform: [{ rotate: '-10deg' }, { translateX: -40 }], opacity: 0.85 },
  cardFront: { transform: [{ rotate: '6deg' }, { translateX: 20 }] },
  cardInfo: { position: 'absolute', bottom: 16, left: 16 },
  floatingBadge: { position: 'absolute', top: 18, left: 0 },
  ringSpot: { position: 'absolute', bottom: 16, right: 16 },
  sparkle: { position: 'absolute', top: 10, left: 20, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  shield: { width: 200, height: 200, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  tick: { position: 'absolute', right: 50, bottom: 70 },
  textWrap: { paddingHorizontal: 28, paddingBottom: 12 },
  body: { marginTop: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 20 },
  dot: { height: 8, borderRadius: 4, overflow: 'hidden' },
  actions: { paddingHorizontal: 20, gap: 6, paddingBottom: 8 },
});
