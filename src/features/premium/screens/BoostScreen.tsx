import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BoostAvatar, Button, GradientView, Header, Icon, ProgressBar, ScalePressable, Screen, Text } from '@/components';
import { useTheme } from '@/core/theme';
import { formatCountdown } from '@/core/utils';
import { useSessionStore } from '@/store/useSessionStore';
import { useBoostViewModel } from '../viewmodels/usePremiumViewModels';

export const BoostScreen = () => {
  const vm = useBoostViewModel();
  const user = useSessionStore(s => s.user)!;
  const { colors } = useTheme();

  return (
    <Screen>
      <Header title="Boost" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {/* pulsing gradient ring while the boost is live */}
          <BoostAvatar uri={user.photos[0]} name={user.name} size={150} active={vm.active} />
          {vm.active ? (
            <Animated.View entering={FadeIn} style={styles.center}>
              <Text variant="h1" color={colors.warning}>
                {formatCountdown(vm.remaining)}
              </Text>
              <Text muted center>
                You’re one of the top profiles in your area
              </Text>
              <View style={styles.progress}>
                <ProgressBar progress={vm.progress} />
              </View>
            </Animated.View>
          ) : (
            <View style={styles.center}>
              <Text variant="h2" center>
                Be seen by 10× more people
              </Text>
              <Text muted center>
                Boost puts your profile at the top of Discover for 30 minutes.
              </Text>
            </View>
          )}
        </View>

        {!vm.active ? (
          vm.boostsLeft > 0 ? (
            <Button title={`Activate boost · ${vm.boostsLeft} left`} variant="gold" icon="bolt" onPress={vm.activate} />
          ) : (
            <Button title="Get boosts with Premium" variant="premium" icon="crown" onPress={vm.paywall} />
          )
        ) : null}

        <Text variant="h3" style={styles.sectionTitle}>
          Top up
        </Text>
        <View style={styles.grid}>
          {vm.consumables.map(([id, item]) => (
            <Animated.View key={id} entering={FadeIn.duration(250)} style={styles.cell}>
              <ScalePressable
                disabled={!!vm.buying}
                onPress={() => vm.buy(id)}
                style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <GradientView name={item.kind === 'boost' ? 'gold' : 'superlike'} style={styles.itemIcon}>
                  <Icon name={item.kind === 'boost' ? 'bolt' : 'star'} size={22} color={item.kind === 'boost' ? '#3B2410' : '#fff'} filled />
                </GradientView>
                <Text variant="title">{item.title}</Text>
                <Text variant="captionMedium" color={colors.primary}>
                  {vm.buying === id ? 'Processing…' : `₹${item.price}`}
                </Text>
              </ScalePressable>
            </Animated.View>
          ))}
        </View>
        <Text variant="caption" muted center>
          You have {vm.superLikesLeft} Super Likes and {vm.boostsLeft} Boosts available.
        </Text>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48, gap: 16 },
  hero: { alignItems: 'center', gap: 20, marginBottom: 8 },
  center: { alignItems: 'center', gap: 6 },
  progress: { width: 200, marginTop: 10 },
  sectionTitle: { marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '47.5%' },
  item: { alignItems: 'center', gap: 6, padding: 18, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth },
  itemIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
});
