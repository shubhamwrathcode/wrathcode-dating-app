import React, { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme';
import { Text } from './Text';

const SCREEN_H = Dimensions.get('window').height;
/** Smooth, non-bouncy open/settle animation (no spring overshoot). */
const OPEN = { duration: 240, easing: Easing.out(Easing.cubic) };

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  scroll?: boolean;
  maxHeight?: number;
  footer?: React.ReactNode;
}

/**
 * Keyboard height while the sheet is open. A Modal is its own window, so the
 * activity's adjustResize / KeyboardAvoidingView don't reliably lift it
 * (especially on Android edge-to-edge) — we lift the sheet ourselves.
 */
const useKeyboardHeight = (active: boolean) => {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!active) {
      setHeight(0);
      return;
    }
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, e => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvt, () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [active]);
  return height;
};

/** Animated bottom sheet (24px top radius) with drag-to-dismiss. */
export const BottomSheet = ({ visible, onClose, title, subtitle, children, scroll, maxHeight = 0.88, footer }: Props) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(SCREEN_H);
  const backdrop = useSharedValue(0);
  const keyboard = useKeyboardHeight(mounted);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withTiming(0, OPEN);
      backdrop.value = withTiming(1, { duration: 250 });
    } else if (mounted) {
      backdrop.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_H, { duration: 220, easing: Easing.in(Easing.cubic) }, done => {
        if (done) {
          runOnJS(setMounted)(false);
        }
      });
    }
  }, [visible, mounted, translateY, backdrop]);

  const pan = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate(e => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd(e => {
      if (e.translationY > 120 || e.velocityY > 900) {
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, OPEN);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  if (!mounted) {
    return null;
  }

  const Body = scroll ? ScrollView : View;

  return (
    <Modal transparent visible statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.flex}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, backdropStyle]}>
          <Pressable style={styles.flex} onPress={onClose} accessibilityLabel="Close sheet" />
        </Animated.View>
        <View style={styles.end} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                // Sit right on top of the keyboard and shrink so the header, input and footer stay visible.
                marginBottom: keyboard,
                maxHeight: keyboard
                  ? Math.min(SCREEN_H * maxHeight, SCREEN_H - keyboard - insets.top - 12)
                  : SCREEN_H * maxHeight,
                paddingBottom: keyboard ? 12 : insets.bottom + 16,
              },
              sheetStyle,
            ]}>
            <GestureDetector gesture={pan}>
              <View style={styles.handleArea}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
                {title ? (
                  <Text variant="h3" center>
                    {title}
                  </Text>
                ) : null}
                {subtitle ? (
                  <Text variant="caption" muted center style={styles.subtitle}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </GestureDetector>
            <Body
              style={scroll ? styles.scroll : undefined}
              contentContainerStyle={scroll ? styles.scrollContent : undefined}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {children}
            </Body>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  end: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20 },
  handleArea: { paddingTop: 10, paddingBottom: 12 },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 14 },
  subtitle: { marginTop: 4 },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingBottom: 12 },
  footer: { paddingTop: 12 },
});
