import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { haptics } from '@/core/services/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
  children?: React.ReactNode;
}

/** Pressable with a subtle press-in scale (no bounce) — the base of every tappable surface. */
export const ScalePressable = ({ style, scaleTo = 0.96, haptic, onPressIn, onPressOut, onPress, children, ...rest }: Props) => {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={e => {
        scale.value = withTiming(scaleTo, { duration: 100 });
        onPressIn?.(e);
      }}
      onPressOut={e => {
        scale.value = withTiming(1, { duration: 120 });
        onPressOut?.(e);
      }}
      onPress={e => {
        if (haptic) {
          haptics.selection();
        }
        onPress?.(e);
      }}
      style={[style, animated]}>
      {children}
    </AnimatedPressable>
  );
};
