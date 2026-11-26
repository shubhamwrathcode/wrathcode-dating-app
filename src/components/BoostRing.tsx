import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { GradientView } from './GradientView';
import { SmartImage } from './SmartImage';

/** Avatar with an optional pulsing gradient ring (1.5s loop) while a boost is active. */
export const BoostAvatar = ({ uri, name, size = 110, active }: { uri?: string; name?: string; size?: number; active?: boolean }) => {
  const reduce = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active && !reduce) {
      pulse.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }), -1, false);
    } else {
      pulse.value = 0;
    }
  }, [active, reduce, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.7 * (1 - pulse.value) : 0,
    transform: [{ scale: 1 + pulse.value * 0.28 }],
  }));

  const ring = size + 10;
  return (
    <View style={{ width: ring, height: ring, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
        <GradientView name="gold" style={{ flex: 1, borderRadius: ring / 2 }} />
      </Animated.View>
      <GradientView name={active ? 'gold' : 'primary'} style={{ width: ring, height: ring, borderRadius: ring / 2, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: '#fff', overflow: 'hidden' }}>
          <SmartImage uri={uri} name={name} style={StyleSheet.absoluteFill} />
        </View>
      </GradientView>
    </View>
  );
};
