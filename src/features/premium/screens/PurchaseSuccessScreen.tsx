import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button, Confetti, GradientView, Icon, Screen, Shimmer, Text } from '@/components';
import { PLANS } from '@/core/constants';
import { RootScreenProps } from '@/navigation/types';

export const PurchaseSuccessScreen = ({ route, navigation }: RootScreenProps<'PurchaseSuccess'>) => {
  const plan = route.params.plan ?? 'gold';
  const isPlat = plan === 'platinum';
  const perks = [
    'Unlimited likes',
    'See who likes you',
    `${PLANS[plan].features.superLikesPerWeek} Super Likes every week`,
    'Undo your last swipe',
    `${PLANS[plan].features.boostsPerMonth} Boost${PLANS[plan].features.boostsPerMonth > 1 ? 's' : ''} a month`,
    ...(isPlat ? ['Incognito & travel mode', 'Message before matching'] : []),
  ];

  return (
    <Screen background={isPlat ? 'premium' : 'romance'}>
      <Confetti originY={200} />
      <View style={styles.body}>
        <Animated.View entering={FadeIn.duration(250)}>
          <GradientView name="gold" style={styles.crown}>
            <Icon name="crown" size={56} color="#3B2410" />
            <Shimmer duration={2400} intensity={0.7} />
          </GradientView>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(300).duration(500)}>
          <Text variant="romantic" color="#fff" center>
            Welcome to {PLANS[plan].name}
          </Text>
          <Text color="rgba(255,255,255,0.85)" center style={styles.sub}>
            Everything’s unlocked. Go find your person.
          </Text>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(500).duration(500)} style={styles.perks}>
          {perks.map(p => (
            <View key={p} style={styles.perk}>
              <Icon name="check" size={18} color="#F9D976" strokeWidth={2.5} />
              <Text variant="bodyMedium" color="#fff">
                {p}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
      <View style={styles.footer}>
        <Button title="See who likes you" variant="surface" icon="heart" onPress={() => navigation.navigate('Main', { screen: 'Likes' })} />
        <Button title="Back to Discover" variant="ghost" onPress={() => navigation.navigate('Main', { screen: 'Discover' })} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 20 },
  crown: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  sub: { marginTop: 8 },
  perks: { alignSelf: 'stretch', gap: 10, backgroundColor: 'rgba(255,255,255,0.12)', padding: 18, borderRadius: 24 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footer: { paddingHorizontal: 20, paddingVertical: 16, gap: 6 },
});
