import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/core/theme';
import { Icon, IconName } from './Icon';
import { ScalePressable } from './ScalePressable';
import { Text } from './Text';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  large?: boolean;
  light?: boolean;
}

export const IconButton = ({
  icon, onPress, color, size = 22, bg, filled, badge, accessibilityLabel,
}: {
  icon: IconName;
  onPress?: () => void;
  color?: string;
  size?: number;
  bg?: string;
  filled?: boolean;
  badge?: number;
  accessibilityLabel?: string;
}) => {
  const { colors } = useTheme();
  return (
    <ScalePressable
      onPress={onPress}
      haptic
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? icon}
      style={[styles.iconBtn, { backgroundColor: bg ?? colors.surface, borderColor: colors.border }]}>
      <Icon name={icon} size={size} color={color ?? colors.textPrimary} filled={filled} />
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text variant="micro" color="#fff">
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}
    </ScalePressable>
  );
};

export const Header = ({ title, subtitle, back = true, onBack, right, large, light }: HeaderProps) => {
  const nav = useNavigation();
  const { colors } = useTheme();
  const fg = light ? '#fff' : colors.textPrimary;

  return (
    <View style={[styles.wrap, large && styles.large]}>
      <View style={styles.side}>
        {back ? (
          <IconButton
            icon="chevronLeft"
            onPress={onBack ?? (() => nav.goBack())}
            color={fg}
            bg={light ? 'rgba(255,255,255,0.18)' : undefined}
            accessibilityLabel="Go back"
          />
        ) : null}
      </View>
      {large ? (
        <View style={styles.center} />
      ) : (
        <View style={styles.center}>
          {title ? (
            <Text variant="title" color={fg} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="micro" color={light ? 'rgba(255,255,255,0.8)' : colors.textSecondary}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
      <View style={[styles.side, styles.right]}>{right}</View>
      {large && title ? (
        <View style={styles.largeTitle}>
          <Text variant="h1" color={fg}>
            {title}
          </Text>
          {subtitle ? <Text muted>{subtitle}</Text> : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, minHeight: 56 },
  large: { flexWrap: 'wrap' },
  side: { minWidth: 40, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end', gap: 8 },
  center: { flex: 1, alignItems: 'center' },
  largeTitle: { width: '100%', marginTop: 12 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
});
