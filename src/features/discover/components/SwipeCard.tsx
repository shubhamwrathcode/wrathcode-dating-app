import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, Extrapolation, interpolate, runOnJS, SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GlassChip, GradientView, Icon, IntentBadge, OnlineDot, SmartImage, Text, VerifiedTick } from '@/components';
import { calcAge } from '@/core/utils';
import { Profile, SwipeAction } from '@/data/models';

const { width: W, height: H } = Dimensions.get('window');
const SWIPE_X = W * 0.28;
const SWIPE_UP = H * 0.16;

export interface SwipeCardHandle {
  flyOut: (action: SwipeAction) => void;
  reset: () => void;
}

interface Props {
  profile: Profile;
  isTop: boolean;
  /** 0..1 drag progress of the top card, drives the scale of the card underneath. */
  topDrag: SharedValue<number>;
  depth: number;
  showDistance: boolean;
  compatibility?: number;
  onRelease: (action: SwipeAction) => void;
  onCommitted: (action: SwipeAction) => void;
  onOpen: () => void;
}

const Stamp = ({ label, color, style }: { label: string; color: string; style: object }) => (
  <Animated.View style={[styles.stamp, { borderColor: color }, style]}>
    <Text variant="h3" color={color} weight="700" style={styles.stampText}>
      {label}
    </Text>
  </Animated.View>
);

/**
 * Swipe card: follows the finger, rotates up to 12°, LIKE / NOPE / SUPER
 * stamps fade in by drag distance, springs back or flies out in 250ms.
 */
export const SwipeCard = forwardRef<SwipeCardHandle, Props>(
  ({ profile, isTop, topDrag, depth, showDistance, compatibility, onRelease, onCommitted, onOpen }, ref) => {
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const [photoIndex, setPhotoIndex] = useState(0);

    const commit = (action: SwipeAction) => onCommitted(action);

    const flyOut = (action: SwipeAction) => {
      const cfg = { duration: 250, easing: Easing.out(Easing.quad) };
      topDrag.value = withTiming(1, cfg);
      if (action === 'superlike') {
        ty.value = withTiming(-H * 1.1, cfg, done => done && runOnJS(commit)(action));
      } else {
        const dir = action === 'like' ? 1 : -1;
        tx.value = withTiming(dir * W * 1.5, cfg, done => done && runOnJS(commit)(action));
        ty.value = withTiming(ty.value + 40, cfg);
      }
    };

    const reset = () => {
      tx.value = withTiming(0, { duration: 200 });
      ty.value = withTiming(0, { duration: 200 });
      topDrag.value = withTiming(0, { duration: 200 });
    };

    useImperativeHandle(ref, () => ({ flyOut, reset }));

    const pan = Gesture.Pan()
      .enabled(isTop)
      .onUpdate(e => {
        tx.value = e.translationX;
        ty.value = e.translationY;
        topDrag.value = Math.min(1, Math.max(Math.abs(e.translationX) / SWIPE_X, -e.translationY / SWIPE_UP, 0));
      })
      .onEnd(e => {
        const right = tx.value > SWIPE_X || e.velocityX > 900;
        const left = tx.value < -SWIPE_X || e.velocityX < -900;
        const up = ty.value < -SWIPE_UP && Math.abs(tx.value) < SWIPE_X;
        if (up) {
          runOnJS(onRelease)('superlike');
        } else if (right) {
          runOnJS(onRelease)('like');
        } else if (left) {
          runOnJS(onRelease)('pass');
        } else {
          tx.value = withTiming(0, { duration: 200 });
          ty.value = withTiming(0, { duration: 200 });
          topDrag.value = withTiming(0, { duration: 200 });
        }
      });

    const nextPhoto = (x: number) => {
      if (x < W * 0.3) {
        setPhotoIndex(i => Math.max(0, i - 1));
      } else {
        setPhotoIndex(i => Math.min(profile.photos.length - 1, i + 1));
      }
    };

    const tap = Gesture.Tap()
      .enabled(isTop)
      .maxDuration(250)
      .onEnd((e, success) => {
        if (!success) {
          return;
        }
        // bottom info area opens the full profile, the photo area flips photos
        if (e.y > H * 0.42) {
          runOnJS(onOpen)();
        } else {
          runOnJS(nextPhoto)(e.x);
        }
      });

    const gesture = Gesture.Exclusive(pan, tap);

    const cardStyle = useAnimatedStyle(() => {
      if (isTop) {
        return {
          transform: [
            { translateX: tx.value },
            { translateY: ty.value },
            { rotate: `${interpolate(tx.value, [-W, 0, W], [-12, 0, 12], Extrapolation.CLAMP)}deg` },
          ],
        };
      }
      // card underneath scales 0.95 → 1 as the top card leaves
      const base = depth === 1 ? 0.95 + 0.05 * topDrag.value : 0.9;
      return { transform: [{ scale: base }, { translateY: depth === 1 ? 10 * (1 - topDrag.value) : 20 }] };
    });

    const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(tx.value, [20, SWIPE_X], [0, 1], Extrapolation.CLAMP) }));
    const nopeStyle = useAnimatedStyle(() => ({ opacity: interpolate(tx.value, [-SWIPE_X, -20], [1, 0], Extrapolation.CLAMP) }));
    const superStyle = useAnimatedStyle(() => ({ opacity: interpolate(ty.value, [-SWIPE_UP, -20], [1, 0], Extrapolation.CLAMP) }));

    const age = calcAge(profile.dob);

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, cardStyle]} pointerEvents={isTop ? 'auto' : 'none'}>
          <SmartImage uri={profile.photos[photoIndex]} name={profile.name} style={StyleSheet.absoluteFill} />
          <GradientView name="cardOverlay" style={StyleSheet.absoluteFill} pointerEvents="none" />

          <View style={styles.indicators} pointerEvents="none">
            {profile.photos.map((p, i) => (
              <View key={p + i} style={[styles.indicator, { backgroundColor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.4)' }]} />
            ))}
          </View>

          {compatibility ? (
            <View style={styles.compat} pointerEvents="none">
              <GradientView name="glass" style={styles.compatInner}>
                <Icon name="sparkles" size={14} color="#fff" />
                <Text variant="captionMedium" color="#fff">
                  {compatibility}% match
                </Text>
              </GradientView>
            </View>
          ) : null}

          <Stamp label="LIKE" color="#22C55E" style={[styles.stampLike, likeStyle]} />
          <Stamp label="NOPE" color="#DE24F8" style={[styles.stampNope, nopeStyle]} />
          <Stamp label="SUPER LIKE" color="#3BA8FF" style={[styles.stampSuper, superStyle]} />

          <View style={styles.info} pointerEvents="none">
            <IntentBadge intent={profile.intent} glass />
            <View style={styles.nameRow}>
              <Text variant="h2" color="#fff" numberOfLines={1} style={styles.name}>
                {profile.name}, {age}
              </Text>
              {profile.verified ? <VerifiedTick size={24} /> : null}
              {profile.online ? <OnlineDot size={12} border="transparent" /> : null}
            </View>
            <View style={styles.chips}>
              {showDistance ? <GlassChip icon="mapPin" label={`${profile.distanceKm} km away`} /> : null}
              {profile.lifestyle.job ? <GlassChip icon="briefcase" label={profile.lifestyle.job} /> : null}
              {profile.voiceIntroSec ? <GlassChip icon="mic" label="Voice intro" /> : null}
            </View>
            <Text variant="body" color="rgba(255,255,255,0.88)" numberOfLines={2} style={styles.bio}>
              {profile.bio}
            </Text>
          </View>
          {profile.superLikedMe ? (
            <View style={styles.superTag} pointerEvents="none">
              <GradientView name="superlike" style={styles.superTagInner}>
                <Icon name="star" size={14} color="#fff" filled />
                <Text variant="micro" color="#fff">
                  Super liked you
                </Text>
              </GradientView>
            </View>
          ) : null}
        </Animated.View>
      </GestureDetector>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    ...(StyleSheet.absoluteFill as any),
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#2A1B33',
  },
  indicators: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', gap: 4 },
  indicator: { flex: 1, height: 3.5, borderRadius: 2 },
  compat: { position: 'absolute', top: 28, right: 14 },
  compatInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  superTag: { position: 'absolute', top: 28, left: 14 },
  superTagInner: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  info: { position: 'absolute', left: 18, right: 18, bottom: 20, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bio: { marginTop: 2 },
  stamp: { position: 'absolute', borderWidth: 4, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  stampText: { letterSpacing: 2 },
  stampLike: { top: 56, left: 24, transform: [{ rotate: '-14deg' }] },
  stampNope: { top: 56, right: 24, transform: [{ rotate: '14deg' }] },
  stampSuper: { bottom: 200, alignSelf: 'center', left: W * 0.2, transform: [{ rotate: '-6deg' }] },
});
