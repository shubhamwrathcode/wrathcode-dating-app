import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { GradientView, Icon, IconName, ParticleBurst, ScalePressable } from '@/components';
import { haptics } from '@/core/services/haptics';
import { useTheme } from '@/core/theme';
import { GradientName } from '@/core/theme/gradients';

interface ActionProps {
  icon: IconName;
  size: number;
  onPress: () => void;
  gradient?: GradientName;
  color?: string;
  label: string;
  burstColor?: string;
  pop?: boolean;
  iconSize?: number;
}

const ActionButton = ({ icon, size, onPress, gradient, color, label, burstColor, pop, iconSize }: ActionProps) => {
  const { colors, shadowSoft } = useTheme();
  const scale = useSharedValue(1);
  const [burst, setBurst] = useState(0);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handle = () => {
    if (pop) {
      // heart pop 1 → 1.1 → 1 (no bounce) + particle burst
      scale.value = withSequence(withTiming(1.1, { duration: 120 }), withTiming(1, { duration: 150 }));
      setBurst(b => b + 1);
      haptics.light();
    }
    onPress();
  };

  const inner = <Icon name={icon} size={iconSize ?? size * 0.44} color={gradient ? '#fff' : color} filled={icon !== 'x' && icon !== 'undo'} strokeWidth={icon === 'x' ? 3 : 1.75} />;

  return (
    <View>
      <Animated.View style={style}>
        <ScalePressable onPress={handle} scaleTo={0.9} accessibilityLabel={label} accessibilityRole="button" style={[shadowSoft, { borderRadius: size / 2 }]}>
          {gradient ? (
            <GradientView name={gradient} style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }]}>
              {inner}
            </GradientView>
          ) : (
            <View style={[styles.btn, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface, borderColor: colors.border }]}>
              {inner}
            </View>
          )}
        </ScalePressable>
      </Animated.View>
      {burstColor ? <ParticleBurst trigger={burst} color={burstColor} /> : null}
    </View>
  );
};

interface Props {
  onUndo: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  onLike: () => void;
  onBoost: () => void;
  boostActive: boolean;
}

export const ActionBar = ({ onUndo, onPass, onSuperLike, onLike, onBoost, boostActive }: Props) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <ActionButton icon="undo" size={42} color={colors.warning} label="Undo" onPress={onUndo} />
      <ActionButton icon="x" size={56} color={colors.pass} label="Pass" onPress={onPass} />
      <ActionButton icon="star" size={46} gradient="superlike" label="Super like" onPress={onSuperLike} burstColor="#3BA8FF" pop />
      <ActionButton icon="heart" size={60} gradient="primary" label="Like" onPress={onLike} burstColor="#DE24F8" pop />
      <ActionButton icon="bolt" size={42} gradient={boostActive ? 'gold' : undefined} color={colors.secondary} label="Boost" onPress={onBoost} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 12 },
  btn: { alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
});
