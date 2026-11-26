import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/core/theme';
import { GradientName } from '@/core/theme/gradients';
import { GradientView } from './GradientView';
import { Icon, IconName } from './Icon';
import { ScalePressable } from './ScalePressable';
import { Text } from './Text';

type Variant = 'primary' | 'outline' | 'ghost' | 'premium' | 'gold' | 'surface' | 'danger';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'lg' | 'md' | 'sm';
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const HEIGHT = { lg: 52, md: 46, sm: 36 };
const GRADIENT_FOR: Partial<Record<Variant, GradientName>> = { primary: 'primary', premium: 'premium', gold: 'gold' };

export const Button = ({
  title, onPress, variant = 'primary', size = 'lg', icon, iconRight, loading, disabled, style, testID,
}: ButtonProps) => {
  const { colors, shadow, isDark } = useTheme();
  const gradient = GRADIENT_FOR[variant];
  const textColor =
    variant === 'outline' || variant === 'ghost'
      ? colors.primary
      : variant === 'surface'
      ? colors.textPrimary
      : variant === 'gold'
      ? '#3B2410'
      : '#FFFFFF';

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 20} color={textColor} /> : null}
          <Text variant={size === 'sm' ? 'captionMedium' : 'title'} color={textColor}>
            {title}
          </Text>
          {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 16 : 20} color={textColor} /> : null}
        </>
      )}
    </View>
  );

  const base: ViewStyle = { height: HEIGHT[size], borderRadius: 999, overflow: 'hidden' };
  const isDisabled = disabled || loading;

  return (
    <ScalePressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      haptic
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        gradient && !isDisabled && variant === 'primary' ? shadow : null,
        { borderRadius: 999, opacity: disabled ? 0.45 : 1 },
        style,
      ]}>
      {gradient ? (
        <GradientView name={gradient} style={[base, styles.center]}>
          {content}
        </GradientView>
      ) : (
        <View
          style={[
            base,
            styles.center,
            variant === 'outline' && { borderWidth: 1.5, borderColor: colors.primary },
            variant === 'surface' && { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
            variant === 'danger' && { backgroundColor: colors.error },
            variant === 'ghost' && { backgroundColor: isDark ? 'transparent' : 'transparent' },
          ]}>
          {content}
        </View>
      )}
    </ScalePressable>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
