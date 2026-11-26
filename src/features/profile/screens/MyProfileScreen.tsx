import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  BoostAvatar, Button, GradientView, Icon, IconButton, IconName, IntentBadge, PlanBadge, ProgressBar, ScalePressable, Screen, Shimmer, Text, VerifiedTick,
} from '@/components';
import { useT } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { calcAge, formatCountdown } from '@/core/utils';
import { useMyProfileViewModel } from '../viewmodels/useProfileViewModels';

const QuickAction = ({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) => {
  const { colors } = useTheme();
  return (
    <ScalePressable onPress={onPress} haptic style={styles.quick} accessibilityLabel={label}>
      <View style={[styles.quickIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon name={icon} size={22} color={colors.primary} />
      </View>
      <Text variant="captionMedium">{label}</Text>
    </ScalePressable>
  );
};

export const MyProfileScreen = () => {
  const vm = useMyProfileViewModel();
  const t = useT();
  const { colors } = useTheme();
  const u = vm.user;

  return (
    <Screen edges={['top']}>
      <View style={styles.top}>
        <Text variant="h1">{t('profile.title')}</Text>
        <View style={styles.topRight}>
          <IconButton icon="shieldCheck" onPress={vm.safety} accessibilityLabel="Safety centre" />
          <IconButton icon="settings" onPress={vm.settings} accessibilityLabel="Settings" />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(350)} style={styles.hero}>
          <ScalePressable onPress={vm.edit}>
            <BoostAvatar uri={u.photos[0]} name={u.name} size={104} active={vm.boostActive} />
            <GradientView name="primary" style={styles.editBadge}>
              <Icon name="edit" size={14} color="#fff" />
            </GradientView>
          </ScalePressable>
          <View style={styles.nameRow}>
            <Text variant="h2">
              {u.name.split(' ')[0]}, {calcAge(u.dob)}
            </Text>
            {u.verified ? <VerifiedTick size={22} /> : null}
          </View>
          <View style={styles.badges}>
            <IntentBadge intent={u.intent} />
            <PlanBadge plan={vm.plan} />
          </View>
          {vm.boostActive ? (
            <Text variant="captionMedium" color={colors.warning}>
              ⚡ Boost active · {formatCountdown(vm.boostRemainingMs)}
            </Text>
          ) : null}
        </Animated.View>

        <View style={styles.quickRow}>
          <QuickAction icon="edit" label="Edit" onPress={vm.edit} />
          <QuickAction icon="eye" label="Preview" onPress={vm.preview} />
          <QuickAction icon="bell" label="Alerts" onPress={vm.notifications} />
          <QuickAction icon="settings" label="Settings" onPress={vm.settings} />
        </View>

        <Animated.View entering={FadeIn.delay(80).duration(350)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <Text variant="title">Profile strength</Text>
            <Text variant="title" color={colors.primary}>
              {vm.completeness.score}%
            </Text>
          </View>
          <View style={styles.mt12}>
            <ProgressBar progress={vm.completeness.score / 100} height={8} />
          </View>
          {vm.completeness.missing.slice(0, 3).map(item => (
            <ScalePressable key={item.key} onPress={vm.edit} style={styles.tip}>
              <View style={[styles.tipIcon, { backgroundColor: colors.primarySoft }]}>
                <Icon name="plus" size={14} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text variant="caption" style={styles.flex}>
                {item.tip}
              </Text>
              <Text variant="micro" color={colors.primary}>
                +{item.weight}%
              </Text>
            </ScalePressable>
          ))}
          {!vm.completeness.missing.length ? (
            <Text variant="caption" muted style={styles.mt12}>
              🎉 Your profile is complete. You’re in the top 10% of profiles.
            </Text>
          ) : null}
        </Animated.View>

        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="h2" color={colors.primary}>
              {vm.stats.matches}
            </Text>
            <Text variant="caption" muted>
              Matches
            </Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="h2" color={colors.superlike}>
              {vm.superLikesLeft}
            </Text>
            <Text variant="caption" muted>
              Super Likes
            </Text>
          </View>
          <ScalePressable onPress={vm.boost} style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="h2" color={colors.secondary}>
              {vm.boostsLeft}
            </Text>
            <Text variant="caption" muted>
              Boosts
            </Text>
          </ScalePressable>
        </View>

        {vm.plan !== 'platinum' ? (
          <ScalePressable onPress={vm.paywall}>
            <GradientView name="premium" style={styles.premium}>
              <Shimmer duration={3000} intensity={0.18} />
              <Icon name="crown" size={30} color="#F9D976" />
              <View style={styles.flex}>
                <Text variant="title" color="#fff">
                  {vm.plan === 'gold' ? 'Go Platinum' : 'Upgrade to DilSe Premium'}
                </Text>
                <Text variant="caption" color="rgba(255,255,255,0.8)">
                  See who likes you, unlimited likes, undo & more
                </Text>
              </View>
              <Icon name="chevronRight" size={20} color="#fff" />
            </GradientView>
          </ScalePressable>
        ) : null}

        <Button title="Boost my profile" icon="bolt" variant="outline" onPress={vm.boost} style={styles.mt16} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  topRight: { flexDirection: 'row', gap: 10 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 16 },
  hero: { alignItems: 'center', gap: 8 },
  editBadge: { position: 'absolute', right: 4, bottom: 4, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  badges: { flexDirection: 'row', gap: 8 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-around' },
  quick: { alignItems: 'center', gap: 6 },
  quickIcon: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  card: { borderRadius: 24, padding: 18, borderWidth: StyleSheet.hairlineWidth },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 4 },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  tipIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  premium: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 24, overflow: 'hidden' },
});
