import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName, ScalePressable, Text } from '@/components';
import { TKey, useT } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { useChatStore } from '@/store/useChatStore';

const TABS: Record<string, { icon: IconName; label: TKey }> = {
  Discover: { icon: 'flame', label: 'tab.discover' },
  Picks: { icon: 'sparkles', label: 'tab.picks' },
  Likes: { icon: 'heart', label: 'tab.likes' },
  Chats: { icon: 'message', label: 'tab.chats' },
  Profile: { icon: 'user', label: 'tab.profile' },
};

const TabItem = ({ name, focused, onPress, badge }: { name: string; focused: boolean; onPress: () => void; badge?: number }) => {
  const { colors } = useTheme();
  const t = useT();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(withTiming(1.08, { duration: 100 }), withTiming(1, { duration: 120 }));
    }
  }, [focused, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const cfg = TABS[name];

  return (
    <ScalePressable
      onPress={onPress}
      haptic
      style={styles.item}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={t(cfg.label)}>
      <Animated.View style={style}>
        {focused ? (
          <Icon name={cfg.icon} size={26} gradient="primary" filled />
        ) : (
          <Icon name={cfg.icon} size={26} color={colors.textSecondary} />
        )}
        {badge ? (
          <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
            <Text variant="micro" color="#fff">
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        ) : null}
      </Animated.View>
      <Text variant="micro" color={focused ? colors.primary : colors.textSecondary}>
        {t(cfg.label)}
      </Text>
    </ScalePressable>
  );
};

export const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const unread = useChatStore(s => s.matches.reduce((n, m) => n + (m.unread > 0 ? 1 : 0), 0));

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          shadowOpacity: isDark ? 0 : 0.06,
        },
      ]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        return (
          <TabItem
            key={route.key}
            name={route.name}
            focused={focused}
            badge={route.name === 'Chats' ? unread : undefined}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#7C03B2',
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 12,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  badge: {
    position: 'absolute', top: -4, right: -10, minWidth: 18, height: 18, borderRadius: 9, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
});
