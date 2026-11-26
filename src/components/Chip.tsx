import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/core/theme';
import { GradientView } from './GradientView';
import { Icon, IconName } from './Icon';
import { ScalePressable } from './ScalePressable';
import { Text } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  emoji?: string;
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** Visual only, no press (used for display tags) */
  static?: boolean;
  highlight?: boolean;
}

export const Chip = ({ label, selected, onPress, icon, emoji, size = 'md', style, disabled, static: isStatic, highlight }: ChipProps) => {
  const { colors } = useTheme();
  const pop = useSharedValue(1);

  useEffect(() => {
    if (selected) {
      pop.value = withSequence(withTiming(1.04, { duration: 90 }), withTiming(1, { duration: 120 }));
    }
  }, [selected, pop]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const pad = size === 'sm' ? { paddingHorizontal: 12, height: 32 } : { paddingHorizontal: 14, height: 38 };
  const fg = selected ? '#fff' : highlight ? colors.primary : colors.textPrimary;

  const inner = (
    <>
      {emoji ? <Text variant={size === 'sm' ? 'caption' : 'body'}>{emoji}</Text> : null}
      {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} color={fg} /> : null}
      <Text variant={size === 'sm' ? 'captionMedium' : 'bodyMedium'} color={fg} style={size === 'sm' ? null : styles.md}>
        {label}
      </Text>
    </>
  );

  const container = [
    styles.chip,
    pad,
    {
      backgroundColor: highlight ? colors.primarySoft : colors.surface,
      borderColor: highlight ? colors.primarySoft : colors.border,
    },
  ];

  return (
    <Animated.View style={[animated, style]}>
      <ScalePressable
        onPress={onPress}
        disabled={disabled || isStatic}
        accessibilityRole={isStatic ? 'text' : 'button'}
        accessibilityState={{ selected }}
        style={{ opacity: disabled && !selected ? 0.4 : 1 }}>
        {selected ? (
          <GradientView name="primary" style={[styles.chip, pad, styles.noBorder]}>
            {inner}
          </GradientView>
        ) : (
          <Animated.View style={container}>{inner}</Animated.View>
        )}
      </ScalePressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, borderWidth: 1 },
  noBorder: { borderWidth: 0 },
  md: {},
});
