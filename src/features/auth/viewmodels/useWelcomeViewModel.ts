import { useCallback, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedRef, useSharedValue } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useSessionStore } from '@/store/useSessionStore';

export const SLIDE_WIDTH = Dimensions.get('window').width;

export const WELCOME_SLIDES = [
  { key: 'intent', title: 'Date with intention', body: 'Everyone on DilSe shows what they’re looking for — long-term, marriage or open to explore.' },
  { key: 'picks', title: 'Daily Picks, not endless swipes', body: '7 hand-picked profiles every morning, with a compatibility score and why you match.' },
  { key: 'safe', title: 'Real people. Real safety.', body: 'Selfie-verified profiles, anti-ghosting nudges and a safety centre for every date.' },
] as const;

export const useWelcomeViewModel = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setSeen = useSessionStore(s => s.setSeenWelcome);
  const scrollX = useSharedValue(0);
  const listRef = useAnimatedRef<Animated.ScrollView>();
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  const onScroll = useAnimatedScrollHandler(e => {
    scrollX.value = e.contentOffset.x;
  });

  const onMomentumEnd = useCallback((x: number) => {
    const i = Math.round(x / SLIDE_WIDTH);
    indexRef.current = i;
    setIndex(i);
  }, []);

  const start = useCallback(() => {
    setSeen();
    nav.navigate('Login');
  }, [nav, setSeen]);

  const next = useCallback(() => {
    if (indexRef.current >= WELCOME_SLIDES.length - 1) {
      start();
      return;
    }
    const i = indexRef.current + 1;
    listRef.current?.scrollTo({ x: i * SLIDE_WIDTH, animated: true });
    indexRef.current = i;
    setIndex(i);
  }, [listRef, start]);

  return { scrollX, listRef, onScroll, onMomentumEnd, index, next, start, isLast: index === WELCOME_SLIDES.length - 1 };
};
