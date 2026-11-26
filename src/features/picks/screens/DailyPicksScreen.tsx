import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  Button,
  EmptyState,
  GradientView,
  Icon,
  IntentBadge,
  MatchRing,
  ScalePressable,
  Screen,
  SmartImage,
  Text,
  VerifiedTick,
} from '@/components';
import { useT } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { calcAge, formatHoursMinutes } from '@/core/utils';
import { Pick, useDailyPicksViewModel } from '../viewmodels/usePicksViewModels';

const { width: W } = Dimensions.get('window');
const COL_W = (W - 20 * 2 - 12) / 2;

const PickCard = ({
  pick,
  onPress,
  acted,
  hero,
}: {
  pick: Pick;
  onPress: () => void;
  acted: boolean;
  hero?: boolean;
}) => {
  const { colors } = useTheme();
  const p = pick.profile;
  const width = hero ? W - 40 : COL_W;
  const height = hero ? width * 0.95 : COL_W * 1.5;
  return (
    <ScalePressable
      onPress={onPress}
      style={[styles.card, { width, height }]}
      accessibilityLabel={`${p.name}, ${pick.compat.score}% match`}
    >
      <SmartImage
        uri={p.photos[0]}
        name={p.name}
        blurRadius={pick.locked ? 24 : undefined}
        style={StyleSheet.absoluteFill}
      />
      <GradientView name="cardOverlay" style={StyleSheet.absoluteFill} />
      {pick.locked ? (
        <View style={[StyleSheet.absoluteFill, styles.lock]}>
          <GradientView name="gold" style={styles.lockBadge}>
            <Icon name="lock" size={20} color="#3B2410" />
          </GradientView>
          <Text variant="captionMedium" color="#fff" center>
            Unlock with Gold
          </Text>
        </View>
      ) : null}
      <View style={styles.ring}>
        <MatchRing
          score={pick.compat.score}
          size={hero ? 60 : 46}
          stroke={4}
          light
          delay={150}
        />
      </View>
      {hero ? (
        <GradientView name="primary" style={styles.topPick}>
          <Icon name="sparkles" size={12} color="#fff" />
          <Text variant="micro" color="#fff">
            Top pick
          </Text>
        </GradientView>
      ) : null}
      {acted ? (
        <View style={[styles.acted, { backgroundColor: colors.success }]}>
          <Icon name="check" size={12} color="#fff" strokeWidth={3} />
        </View>
      ) : null}
      <View style={styles.info}>
        {!pick.locked ? (
          <>
            <View style={styles.nameRow}>
              <Text
                variant={hero ? 'h3' : 'title'}
                color="#fff"
                numberOfLines={1}
                style={styles.shrink}
              >
                {p.name}, {calcAge(p.dob)}
              </Text>
              {p.verified ? <VerifiedTick size={hero ? 20 : 16} /> : null}
            </View>
            {hero ? <IntentBadge intent={p.intent} glass /> : null}
            <Text
              variant={hero ? 'caption' : 'micro'}
              color="rgba(255,255,255,0.9)"
              numberOfLines={2}
            >
              {hero
                ? `${pick.compat.reasons[0]?.label} · ${pick.compat.reasons[0]?.detail}`
                : pick.compat.reasons[0]?.label}
            </Text>
          </>
        ) : null}
      </View>
    </ScalePressable>
  );
};

export const DailyPicksScreen = () => {
  const vm = useDailyPicksViewModel();
  const t = useT();
  const { colors } = useTheme();
  const [hero, ...rest] = vm.picks;

  return (
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h1">{t('picks.title')}</Text>
          <Text muted>{t('picks.subtitle')}</Text>
          <View style={styles.metaRow}>
            <View
              style={[styles.pill, { backgroundColor: colors.primarySoft }]}
            >
              <Icon name="clock" size={14} color={colors.primary} />
              <Text variant="captionMedium" color={colors.primary}>
                New picks in {formatHoursMinutes(vm.refreshIn)}
              </Text>
            </View>
            {vm.priority ? (
              <GradientView name="premium" style={styles.pill}>
                <Icon name="crown" size={14} color="#fff" />
                <Text variant="captionMedium" color="#fff">
                  Priority picks
                </Text>
              </GradientView>
            ) : null}
          </View>
        </View>

        {!hero ? (
          <EmptyState
            icon="sparkles"
            title="No picks right now"
            body="Come back tomorrow for a fresh set."
          />
        ) : (
          // One simple fade for the whole list — no per-card stagger or bounce.
          <Animated.View entering={FadeIn.duration(250)}>
            <PickCard
              pick={hero}
              hero
              onPress={() => vm.open(hero)}
              acted={vm.isActed(hero.profile.id)}
            />
            <View style={styles.grid}>
              {rest.map(p => (
                <PickCard
                  key={p.profile.id}
                  pick={p}
                  onPress={() => vm.open(p)}
                  acted={vm.isActed(p.profile.id)}
                />
              ))}
            </View>
            {vm.plan === 'free' ? (
              <GradientView name="premium" style={styles.upsell}>
                <Icon name="crown" size={28} color="#F9D976" />
                <View style={styles.flex}>
                  <Text variant="title" color="#fff">
                    See all 7 picks every day
                  </Text>
                  <Text variant="caption" color="rgba(255,255,255,0.8)">
                    You’re seeing {vm.unlockedCount} of 7. Gold unlocks them
                    all.
                  </Text>
                </View>
                <Button
                  title="Upgrade"
                  variant="gold"
                  size="sm"
                  onPress={vm.upgrade}
                />
              </GradientView>
            ) : null}
          </Animated.View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { paddingTop: 8, paddingBottom: 16, gap: 4 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  card: { borderRadius: 24, overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  ring: { position: 'absolute', top: 10, right: 10 },
  topPick: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  acted: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { position: 'absolute', left: 12, right: 12, bottom: 12, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shrink: { flexShrink: 1 },
  lock: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  lockBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 24,
    marginTop: 20,
  },
  flex: { flex: 1 },
});
