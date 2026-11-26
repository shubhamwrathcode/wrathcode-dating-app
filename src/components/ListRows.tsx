import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useTheme } from '@/core/theme';
import { Icon, IconName } from './Icon';
import { ScalePressable } from './ScalePressable';
import { Text } from './Text';

export const Section = ({ title, children, footer }: { title?: string; children: React.ReactNode; footer?: string }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      {title ? (
        <Text variant="captionMedium" muted style={styles.sectionTitle}>
          {title.toUpperCase()}
        </Text>
      ) : null}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>
      {footer ? (
        <Text variant="caption" muted style={styles.footer}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
};

interface RowProps {
  icon?: IconName;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  onToggle?: (v: boolean) => void;
  danger?: boolean;
  right?: React.ReactNode;
  last?: boolean;
  locked?: boolean;
}

export const Row = ({ icon, iconColor, title, subtitle, value, onPress, toggle, onToggle, danger, right, last, locked }: RowProps) => {
  const { colors } = useTheme();
  const fg = danger ? colors.error : colors.textPrimary;
  const isToggle = typeof toggle === 'boolean';

  return (
    <ScalePressable
      scaleTo={0.99}
      onPress={isToggle ? () => onToggle?.(!toggle) : onPress}
      disabled={!onPress && !isToggle}
      accessibilityRole={isToggle ? 'switch' : 'button'}
      accessibilityState={isToggle ? { checked: toggle } : undefined}
      style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: danger ? colors.error + '1A' : colors.primarySoft }]}>
          <Icon name={icon} size={18} color={danger ? colors.error : iconColor ?? colors.primary} />
        </View>
      ) : null}
      <View style={styles.texts}>
        <Text variant="bodyMedium" color={fg}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" muted>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="caption" muted>
          {value}
        </Text>
      ) : null}
      {locked ? <Icon name="crown" size={18} color={colors.gold} /> : null}
      {right}
      {isToggle ? (
        <Switch
          value={toggle}
          onValueChange={onToggle}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#fff"
          ios_backgroundColor={colors.border}
        />
      ) : onPress ? (
        <Icon name="chevronRight" size={18} color={colors.textSecondary} />
      ) : null}
    </ScalePressable>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: { marginLeft: 8, marginBottom: 8, letterSpacing: 0.6 },
  card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  footer: { marginTop: 8, marginHorizontal: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, minHeight: 56 },
  iconWrap: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
});
