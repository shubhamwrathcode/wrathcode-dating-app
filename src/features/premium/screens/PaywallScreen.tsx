import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, GradientView, Icon, IconButton, IconName, ScalePressable, Shimmer, Text } from '@/components';
import { PLAN_COMPARISON } from '@/core/constants';
import { spacing, useTheme } from '@/core/theme';
import { Plan, PlanId } from '@/data/models';
import { RootScreenProps } from '@/navigation/types';
import { usePaywallViewModel } from '../viewmodels/usePremiumViewModels';

const PERKS: Record<'gold' | 'platinum', { icon: IconName; label: string }[]> = {
  gold: [
    { icon: 'heart', label: 'Unlimited likes' },
    { icon: 'eye', label: 'See who likes you' },
    { icon: 'star', label: '5 Super Likes every week' },
    { icon: 'undo', label: 'Undo your last swipe' },
    { icon: 'bolt', label: '1 Boost every month' },
    { icon: 'sparkles', label: 'All 7 Daily Picks' },
  ],
  platinum: [
    { icon: 'heart', label: 'Everything in Gold' },
    { icon: 'star', label: '10 Super Likes every week' },
    { icon: 'bolt', label: '4 Boosts every month' },
    { icon: 'eyeOff', label: 'Incognito & travel mode' },
    { icon: 'message', label: 'Message before matching' },
    { icon: 'crown', label: 'Priority Daily Picks' },
  ],
};

/** Crown with a slow shimmer + gentle float. */
const ShimmerCrown = () => {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduce) {
      t.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
    }
  }, [t, reduce]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(t.value, [0, 1], [0, -5]) }, { rotate: `${interpolate(t.value, [0, 1], [-4, 4])}deg` }],
  }));
  return (
    <Animated.View style={style}>
      <GradientView name="gold" style={styles.crown}>
        <Icon name="crown" size={30} color="#3B2410" filled />
        <Shimmer duration={3000} intensity={0.7} />
      </GradientView>
    </Animated.View>
  );
};

/** Full-width plan option. Selected = gradient border, slight 1.02 lift and a moving sheen. */
const PlanOption = ({ plan, selected, current, onPress }: { plan: Plan; selected: boolean; current: boolean; onPress: () => void }) => {
  const { colors } = useTheme();
  const isPlat = plan.id === 'platinum';
  const scale = useSharedValue(selected ? 1.02 : 1);
  useEffect(() => {
    scale.value = withTiming(selected ? 1.02 : 1, { duration: 150 });
  }, [selected, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const accent = isPlat ? colors.secondary : '#E0A33B';

  const body = (
    <View style={[styles.optionInner, { backgroundColor: colors.surface }]}>
      {selected ? <Shimmer duration={3000} intensity={0.12} /> : null}
      <View style={[styles.radio, { borderColor: selected ? accent : colors.border }]}>
        {selected ? <View style={[styles.radioDot, { backgroundColor: accent }]} /> : null}
      </View>
      <View style={styles.flex}>
        <View style={styles.nameRow}>
          <Text variant="title">{plan.name}</Text>
          {isPlat ? (
            <GradientView name="premium" style={styles.tag}>
              <Text variant="micro" color="#fff">
                Most popular
              </Text>
            </GradientView>
          ) : null}
          {current ? (
            <View style={[styles.tag, { backgroundColor: colors.primarySoft }]}>
              <Text variant="micro" color={colors.primary}>
                Current
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="caption" muted numberOfLines={1}>
          {plan.tagline}
        </Text>
      </View>
      <View style={styles.price}>
        <Text variant="h3">₹{plan.priceMonthly}</Text>
        <Text variant="micro" muted>
          / month
        </Text>
      </View>
    </View>
  );

  return (
    <Animated.View style={style}>
      <ScalePressable onPress={onPress} scaleTo={0.98} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={`${plan.name} plan`}>
        {selected ? (
          <GradientView name={isPlat ? 'premium' : 'gold'} style={styles.optionBorder}>
            {body}
          </GradientView>
        ) : (
          <View style={[styles.optionBorder, { backgroundColor: colors.border }]}>{body}</View>
        )}
      </ScalePressable>
    </Animated.View>
  );
};

const Cell = ({ value, highlight }: { value: string | boolean; highlight: boolean }) => {
  const { colors } = useTheme();
  if (typeof value === 'boolean') {
    return value ? <Icon name="check" size={16} color={colors.success} strokeWidth={2.5} /> : <Icon name="x" size={14} color={colors.textSecondary} />;
  }
  return (
    <Text variant="micro" color={highlight ? colors.primary : colors.textPrimary} center numberOfLines={2}>
      {value}
    </Text>
  );
};

export const PaywallScreen = ({ route }: RootScreenProps<'Paywall'>) => {
  const vm = usePaywallViewModel(route.params?.reason);
  const { colors } = useTheme();
  const [compareOpen, setCompareOpen] = useState(false);
  const cols: PlanId[] = ['free', 'gold', 'platinum'];
  const selectedPlan = vm.plans.find(p => p.id === vm.selected)!;
  const perks = PERKS[vm.selected === 'platinum' ? 'platinum' : 'gold'];
  const isCurrent = vm.current === vm.selected;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <GradientView name="premium" style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.closeRow}>
              <IconButton icon="x" size={20} onPress={vm.close} bg="rgba(255,255,255,0.15)" color="#fff" accessibilityLabel="Close" />
              <Button title="Restore" variant="ghost" size="sm" onPress={vm.restore} loading={vm.restoring} />
            </View>
            <View style={styles.headerBody}>
              <ShimmerCrown />
              <Animated.View entering={FadeIn.delay(80).duration(350)} style={styles.headerText}>
                <Text variant="h2" color="#fff" center>
                  {vm.headline.title}
                </Text>
                <Text variant="body" color="rgba(255,255,255,0.85)" center>
                  {vm.headline.body}
                </Text>
              </Animated.View>
            </View>
          </SafeAreaView>
        </GradientView>

        <View style={styles.section}>
          <Text variant="captionMedium" muted style={styles.label}>
            CHOOSE YOUR PLAN
          </Text>
          <View style={styles.options}>
            {vm.plans.map(p => (
              <PlanOption key={p.id} plan={p} selected={vm.selected === p.id} current={vm.current === p.id} onPress={() => vm.select(p.id)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="captionMedium" muted style={styles.label}>
            {selectedPlan.name.toUpperCase()} INCLUDES
          </Text>
          <Animated.View key={vm.selected} entering={FadeIn.duration(250)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {perks.map((perk, i) => (
              <View key={perk.label} style={[styles.perk, i < perks.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <View style={[styles.perkIcon, { backgroundColor: colors.primarySoft }]}>
                  <Icon name={perk.icon} size={16} color={colors.primary} />
                </View>
                <Text variant="bodyMedium" style={styles.flex}>
                  {perk.label}
                </Text>
                <Icon name="check" size={16} color={colors.success} strokeWidth={2.5} />
              </View>
            ))}
          </Animated.View>
        </View>

        <View style={styles.section}>
          <ScalePressable onPress={() => setCompareOpen(o => !o)} style={styles.compareToggle} accessibilityRole="button">
            <Text variant="captionMedium" color={colors.primary}>
              {compareOpen ? 'Hide plan comparison' : 'Compare all plans'}
            </Text>
            <Icon name={compareOpen ? 'chevronDown' : 'chevronRight'} size={16} color={colors.primary} />
          </ScalePressable>
          {compareOpen ? (
            <Animated.View entering={FadeIn.duration(250)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.tr, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <Text variant="micro" muted style={styles.featureCol}>
                  Feature
                </Text>
                {cols.map(c => (
                  <Text key={c} variant="micro" color={vm.selected === c ? colors.primary : colors.textSecondary} center style={styles.valCol}>
                    {c === 'free' ? 'Free' : c === 'gold' ? 'Gold' : 'Platinum'}
                  </Text>
                ))}
              </View>
              {PLAN_COMPARISON.map((row, i) => (
                <View key={row.label} style={[styles.tr, i < PLAN_COMPARISON.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <Text variant="caption" style={styles.featureCol}>
                    {row.label}
                  </Text>
                  {cols.map(c => (
                    <View key={c} style={styles.valCol}>
                      <Cell value={row.values[c]} highlight={vm.selected === c} />
                    </View>
                  ))}
                </View>
              ))}
            </Animated.View>
          ) : null}
        </View>

        <Text variant="micro" muted center style={styles.legal}>
          Renews monthly, cancel anytime. Paid via Google Play / App Store, or Razorpay on web. Demo prices, set by the client.
        </Text>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.footerRow}>
          <View>
            <Text variant="caption" muted>
              {selectedPlan.name} · monthly
            </Text>
            <Text variant="h3">₹{selectedPlan.priceMonthly}/mo</Text>
          </View>
          <Button
            title={isCurrent ? 'Current plan' : 'Continue'}
            variant={vm.selected === 'platinum' ? 'premium' : 'gold'}
            iconRight={isCurrent ? undefined : 'chevronRight'}
            onPress={vm.purchase}
            loading={vm.purchasing}
            disabled={isCurrent}
            style={styles.cta}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.lg },
  header: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingBottom: spacing.lg },
  closeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.screen, paddingTop: spacing.xs },
  headerBody: { alignItems: 'center', paddingHorizontal: spacing.screen, gap: spacing.sm },
  headerText: { gap: spacing.xxs },
  crown: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: spacing.screen, marginTop: spacing.lg },
  label: { marginBottom: spacing.xs, marginLeft: spacing.xxs, letterSpacing: 0.6 },
  options: { gap: spacing.sm },
  optionBorder: { borderRadius: 20, padding: 1.5 },
  optionInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: 18.5, paddingHorizontal: spacing.md, paddingVertical: 14, overflow: 'hidden' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  price: { alignItems: 'flex-end' },
  card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  perk: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  perkIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  compareToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: spacing.xs, marginBottom: spacing.xs },
  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 10 },
  featureCol: { flex: 1.5 },
  valCol: { flex: 1, alignItems: 'center' },
  legal: { paddingHorizontal: spacing.screen, marginTop: spacing.lg },
  footer: { paddingHorizontal: spacing.screen, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingBottom: spacing.sm },
  cta: { flex: 1 },
});
