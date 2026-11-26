import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme';
import { ToastKind, useToastStore } from '@/store/useToastStore';
import { GradientView } from './GradientView';
import { Icon, IconName } from './Icon';
import { SmartImage } from './SmartImage';
import { Text } from './Text';

const DURATION = 3200;

const ICONS: Record<ToastKind, IconName> = {
  success: 'check',
  error: 'alert',
  info: 'info',
  match: 'heart',
  message: 'message',
};

/** In-app banner for matches, messages and feedback. Tap to open, ✕ to dismiss, auto-hides after 3.2s. */
export const ToastHost = () => {
  const current = useToastStore(s => s.current);
  const hide = useToastStore(s => s.hide);
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (!current) {
      return;
    }
    const t = setTimeout(hide, DURATION);
    return () => clearTimeout(t);
  }, [current, hide]);

  if (!current) {
    return null;
  }

  const accent = current.kind === 'error' ? colors.error : current.kind === 'success' ? colors.success : colors.primary;
  const branded = current.kind === 'match' || current.kind === 'message';

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 10 }]}>
      <Animated.View key={current.id} entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
        <Pressable
          onPress={() => {
            current.onPress?.();
            hide();
          }}
          accessibilityRole="alert"
          style={[
            styles.toast,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? colors.border : accent + '26',
              shadowColor: isDark ? '#000' : accent,
            },
          ]}>
          {/* Coloured strip on the left tells the toast type at a glance */}
          <View style={[styles.strip, { backgroundColor: accent }]} />

          {current.image ? (
            <SmartImage uri={current.image} style={styles.badge} />
          ) : branded ? (
            <GradientView name="primary" style={[styles.badge, styles.center]}>
              <Icon name={ICONS[current.kind]} size={18} color="#fff" filled={current.kind === 'match'} />
            </GradientView>
          ) : (
            <View style={[styles.badge, styles.center, { backgroundColor: accent + '1F' }]}>
              <Icon name={ICONS[current.kind]} size={18} color={accent} strokeWidth={2.25} />
            </View>
          )}

          <View style={styles.textCol}>
            <Text variant="bodyMedium" numberOfLines={2} style={{ color: colors.textPrimary }}>
              {current.title}
            </Text>
            {current.body ? (
              <Text variant="caption" muted numberOfLines={2} style={styles.body}>
                {current.body}
              </Text>
            ) : null}
          </View>

          <Pressable onPress={hide} hitSlop={10} accessibilityLabel="Dismiss" style={styles.close}>
            <Icon name="x" size={16} color={colors.textSecondary} strokeWidth={2.25} />
          </Pressable>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, zIndex: 999 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 18 },
      default: { elevation: 6 },
    }),
  },
  // Own rounded corners so it also fits the card on iOS, where the card can't clip (it would cut the shadow).
  strip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  badge: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
  textCol: { flex: 1, justifyContent: 'center' },
  body: { marginTop: 2 },
  close: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
