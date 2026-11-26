import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Confetti, FloatingHearts, GradientView, Icon, ScalePressable, SmartImage, Text } from '@/components';
import { useT } from '@/core/i18n';
import { generateIcebreakers } from '@/core/services/icebreakers';
import { haptics } from '@/core/services/haptics';
import { profileRepository } from '@/data/repositories/profileRepository';
import { sendMessage } from '@/domain/chat';
import { RootScreenProps, RootStackParamList } from '@/navigation/types';
import { useChatStore } from '@/store/useChatStore';
import { useSessionStore } from '@/store/useSessionStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const PHOTO = W * 0.42;

/** "It's a Match": photos slide in and overlap, heart pops, hearts float, confetti, success haptic. */
export const MatchScreen = ({ route }: RootScreenProps<'Match'>) => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const t = useT();
  const reduce = useReducedMotion();
  const user = useSessionStore(s => s.user)!;
  const match = useChatStore(s => s.matches.find(m => m.id === route.params.matchId));
  const partner = match ? profileRepository.getById(match.profileId) : undefined;
  const icebreakers = useMemo(() => (partner ? generateIcebreakers(user, partner, 2) : []), [user, partner]);

  const left = useSharedValue(reduce ? 0 : -W);
  const right = useSharedValue(reduce ? 0 : W);
  const heart = useSharedValue(reduce ? 1 : 0);

  useEffect(() => {
    haptics.success();
    const smooth = { duration: 400, easing: Easing.out(Easing.cubic) };
    left.value = withTiming(0, smooth);
    right.value = withTiming(0, smooth);
    heart.value = withDelay(400, withTiming(1, { duration: 250 }));
    if (!reduce) {
      const t2 = setTimeout(() => haptics.light(), 700);
      return () => clearTimeout(t2);
    }
  }, [left, right, heart, reduce]);

  const leftStyle = useAnimatedStyle(() => ({ transform: [{ translateX: left.value + 26 }, { rotate: '-8deg' }] }));
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ translateX: right.value - 26 }, { rotate: '8deg' }] }));
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.value }], opacity: Math.min(1, heart.value) }));

  if (!partner || !match) {
    return null;
  }

  const openChat = () => nav.replace('ChatRoom', { matchId: match.id });
  const quickSend = (text: string) => {
    sendMessage(match.id, { type: 'text', text });
    openChat();
  };

  return (
    <View style={styles.flex}>
      <GradientView name="romance" style={StyleSheet.absoluteFill} />
      <FloatingHearts count={14} />
      <Confetti originY={260} />
      <SafeAreaView style={styles.flex}>
        <Animated.View entering={FadeIn.delay(200)} style={styles.close}>
          <ScalePressable onPress={() => nav.goBack()} hitSlop={12} accessibilityLabel="Close">
            <Icon name="x" size={26} color="#fff" />
          </ScalePressable>
        </Animated.View>

        <View style={styles.photos}>
          <Animated.View style={[styles.photo, leftStyle]}>
            <SmartImage uri={user.photos[0]} name={user.name} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={[styles.photo, rightStyle]}>
            <SmartImage uri={partner.photos[0]} name={partner.name} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={[styles.heart, heartStyle]}>
            <GradientView name="primary" style={styles.heartInner}>
              <Icon name="heart" size={30} color="#fff" filled />
            </GradientView>
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.delay(700).duration(600)} style={styles.texts}>
          <Text variant="romantic" color="#fff" center style={styles.title}>
            {t('match.title')}
          </Text>
          <Text color="rgba(255,255,255,0.9)" center>
            {match.viaSuperLike ? `Your Super Like worked! ` : ''}You and {partner.name} liked each other.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(1000).duration(500)} style={styles.bottom}>
          <Text variant="captionMedium" color="rgba(255,255,255,0.8)">
            ✨ Break the ice
          </Text>
          {icebreakers.map(ib => (
            <ScalePressable key={ib} onPress={() => quickSend(ib)} style={styles.ice}>
              <Text variant="bodyMedium" color="#fff" style={styles.flexText}>
                {ib}
              </Text>
              <Icon name="send" size={18} color="#fff" />
            </ScalePressable>
          ))}
          <Button title={t('match.send')} variant="surface" icon="message" onPress={openChat} style={styles.cta} />
          <Button title={t('match.keep')} variant="ghost" onPress={() => nav.goBack()} />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexText: { flex: 1 },
  close: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  photos: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, height: PHOTO * 1.3 },
  photo: { width: PHOTO, height: PHOTO * 1.3, borderRadius: 28, overflow: 'hidden', borderWidth: 4, borderColor: '#fff' },
  heart: { position: 'absolute', alignSelf: 'center', bottom: -24 },
  heartInner: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' },
  texts: { marginTop: 44, paddingHorizontal: 20, gap: 6 },
  title: { fontSize: 36, lineHeight: 46 },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  ice: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  cta: { marginTop: 6 },
});
