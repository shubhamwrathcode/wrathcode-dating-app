import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button, Chip, GradientView, Icon, Text } from '@/components';
import { CITIES } from '@/core/constants';
import { useTheme } from '@/core/theme';
import { delay } from '@/core/utils';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingViewModel } from '../viewmodels/useOnboardingViewModel';

export const LocationScreen = () => {
  const vm = useOnboardingViewModel('OnbLocation');
  const { colors } = useTheme();
  const [city, setCity] = useState<string | undefined>(vm.draft.city);
  const [granted, setGranted] = useState(!!vm.draft.locationGranted);
  const [asking, setAsking] = useState(false);

  /** Stand-in for react-native-permissions + geolocation reverse-geocode. */
  const allow = async () => {
    setAsking(true);
    await delay(900);
    setGranted(true);
    setCity('C-Scheme, Jaipur');
    setAsking(false);
  };

  return (
    <OnboardingLayout
      title="Where are you?"
      subtitle="We use your location to show people nearby. Your exact location is never shared."
      progress={vm.progress}
      canContinue={!!city}
      onContinue={() => vm.next({ city, locationGranted: granted })}>
      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(250)}>
          <GradientView name="romance" style={styles.pin}>
            <Icon name="mapPin" size={56} color="#fff" strokeWidth={1.5} />
          </GradientView>
        </Animated.View>
        {granted && city ? (
          <View style={[styles.found, { backgroundColor: colors.primarySoft }]}>
            <Icon name="check" size={18} color={colors.primary} strokeWidth={2.5} />
            <Text variant="bodyMedium" color={colors.primary}>
              {city}
            </Text>
          </View>
        ) : (
          <Button title="Allow location access" icon="mapPin" onPress={allow} loading={asking} style={styles.allow} />
        )}
      </View>
      <Text variant="title" style={styles.or}>
        {granted ? 'Not right? Pick your city' : 'Or choose your city'}
      </Text>
      <View style={styles.wrap}>
        {CITIES.map(c => (
          <Chip
            key={c.city}
            label={c.city}
            selected={city?.endsWith(c.city)}
            onPress={() => setCity(`${c.areas[0]}, ${c.city}`)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 24, marginBottom: 32 },
  pin: { width: 128, height: 128, borderRadius: 64, alignItems: 'center', justifyContent: 'center' },
  allow: { alignSelf: 'stretch' },
  found: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  or: { marginBottom: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
