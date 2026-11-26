import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text } from '@/components';
import { Gender, InterestedIn } from '@/data/models';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingViewModel } from '../viewmodels/useOnboardingViewModel';

const GENDERS: { id: Gender; label: string; emoji: string }[] = [
  { id: 'woman', label: 'Woman', emoji: '👩' },
  { id: 'man', label: 'Man', emoji: '👨' },
  { id: 'nonbinary', label: 'Non-binary', emoji: '🧑' },
];

const PREFS: { id: InterestedIn; label: string }[] = [
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'everyone', label: 'Everyone' },
];

export const GenderScreen = () => {
  const vm = useOnboardingViewModel('OnbGender');
  const [gender, setGender] = useState<Gender | undefined>(vm.draft.gender);
  const [pref, setPref] = useState<InterestedIn | undefined>(vm.draft.interestedIn);

  return (
    <OnboardingLayout
      title="Tell us about you"
      subtitle="This helps us show you the right people."
      progress={vm.progress}
      canContinue={!!gender && !!pref}
      onContinue={() => vm.next({ gender, interestedIn: pref })}>
      <Text variant="title" style={styles.label}>
        I am a
      </Text>
      <View style={styles.row}>
        {GENDERS.map(g => (
          <Chip key={g.id} label={g.label} emoji={g.emoji} selected={gender === g.id} onPress={() => setGender(g.id)} />
        ))}
      </View>
      <Text variant="title" style={[styles.label, styles.top]}>
        Show me
      </Text>
      <View style={styles.row}>
        {PREFS.map(p => (
          <Chip key={p.id} label={p.label} selected={pref === p.id} onPress={() => setPref(p.id)} />
        ))}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  label: { marginBottom: 12 },
  top: { marginTop: 32 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
