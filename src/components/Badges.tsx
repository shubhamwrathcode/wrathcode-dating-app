import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { INTENTS } from '@/core/constants';
import { useTheme } from '@/core/theme';
import { Intent, PlanId } from '@/data/models';
import { GradientView } from './GradientView';
import { Icon } from './Icon';
import { Text } from './Text';

/** Blue verified tick (selfie + liveness verified). */
export const VerifiedTick = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Verified">
    <Path
      d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
      fill="#3BA8FF"
    />
    <Path d="m8.5 12 2.5 2.5 4.5-5" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const OnlineDot = ({ size = 12, border = '#fff' }: { size?: number; border?: string }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2, backgroundColor: colors.success, borderWidth: 2, borderColor: border,
      }}
    />
  );
};

/** Intent badge — mandatory on every profile. `glass` variant sits over photos. */
export const IntentBadge = ({ intent, glass }: { intent: Intent; glass?: boolean }) => {
  const { colors } = useTheme();
  const item = INTENTS.find(i => i.id === intent)!;
  if (glass) {
    return (
      <GradientView name="glass" style={[styles.badge, styles.glassBorder]}>
        <Text variant="micro">{item.emoji}</Text>
        <Text variant="micro" color="#fff">
          {item.label}
        </Text>
      </GradientView>
    );
  }
  return (
    <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
      <Text variant="micro">{item.emoji}</Text>
      <Text variant="micro" color={colors.primary}>
        {item.label}
      </Text>
    </View>
  );
};

export const GlassChip = ({ label, icon }: { label: string; icon?: 'mapPin' | 'briefcase' | 'mic' | 'ruler' | 'video' }) => (
  <GradientView name="glass" style={[styles.badge, styles.glassBorder]}>
    {icon ? <Icon name={icon} size={12} color="#fff" /> : null}
    <Text variant="micro" color="#fff">
      {label}
    </Text>
  </GradientView>
);

export const PlanBadge = ({ plan }: { plan: PlanId }) => {
  if (plan === 'free') {
    return null;
  }
  return (
    <GradientView name={plan === 'platinum' ? 'premium' : 'gold'} style={styles.badge}>
      <Icon name="crown" size={12} color={plan === 'platinum' ? '#fff' : '#3B2410'} />
      <Text variant="micro" color={plan === 'platinum' ? '#fff' : '#3B2410'}>
        {plan === 'platinum' ? 'Platinum' : 'Gold'}
      </Text>
    </GradientView>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start', overflow: 'hidden',
  },
  glassBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
});
