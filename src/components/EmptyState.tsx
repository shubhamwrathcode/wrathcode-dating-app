import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/core/theme';
import { Button } from './Button';
import { GradientView } from './GradientView';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

interface Props {
  icon: IconName;
  title: string;
  body?: string;
  cta?: string;
  onPress?: () => void;
}

/** Gently floating illustration (3s ease-in-out loop) for empty states. */
export const EmptyState = ({ icon, title, body, cta, onPress }: Props) => {
  const { colors } = useTheme();
  const reduce = useReducedMotion();
  const float = useSharedValue(0);

  useEffect(() => {
    if (!reduce) {
      float.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
    }
  }, [float, reduce]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -10 * float.value }, { rotate: `${-4 + 8 * float.value}deg` }],
  }));

  return (
    <View style={styles.wrap}>
      <View style={[styles.halo, { backgroundColor: colors.primarySoft }]}>
        <Animated.View style={style}>
          <GradientView name="primary" style={styles.bubble}>
            <Icon name={icon} size={40} color="#fff" filled />
          </GradientView>
        </Animated.View>
      </View>
      <Text variant="h3" center style={styles.title}>
        {title}
      </Text>
      {body ? (
        <Text muted center style={styles.body}>
          {body}
        </Text>
      ) : null}
      {cta && onPress ? <Button title={cta} onPress={onPress} size="md" style={styles.cta} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  halo: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  bubble: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  title: { marginBottom: 8 },
  body: { maxWidth: 300 },
  cta: { marginTop: 24, minWidth: 200 },
});
