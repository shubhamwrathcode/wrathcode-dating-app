import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Input, Text } from '@/components';
import { MIN_AGE } from '@/core/constants';
import { useTheme } from '@/core/theme';
import { calcAge, maskDob, parseDob } from '@/core/utils';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingViewModel } from '../viewmodels/useOnboardingViewModel';

const toDisplay = (iso?: string) => {
  if (!iso) {
    return '';
  }
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export const NameDobScreen = () => {
  const vm = useOnboardingViewModel('OnbName');
  const { colors } = useTheme();
  const [name, setName] = useState(vm.draft.name ?? '');
  const [dob, setDob] = useState(toDisplay(vm.draft.dob));

  const parsed = useMemo(() => parseDob(dob), [dob]);
  const age = parsed ? calcAge(parsed) : null;
  const nameOk = /^[\p{L} .'-]{2,30}$/u.test(name.trim());
  const dobError =
    dob.length === 10 && !parsed
      ? 'Enter a valid date'
      : age !== null && age < MIN_AGE
      ? `You must be ${MIN_AGE}+ to join DilSe`
      : null;

  return (
    <OnboardingLayout
      title="Let’s start with the basics"
      subtitle="Your first name and birthday. Only your age is shown on your profile."
      progress={vm.progress}
      canContinue={nameOk && !!parsed && !dobError}
      onContinue={() => vm.next({ name: name.trim(), dob: parsed! })}>
      <View style={styles.gap}>
        <Input label="First name" value={name} onChangeText={setName} placeholder="e.g. Ananya" autoCapitalize="words" autoFocus maxLength={30} />
        <Input
          label="Date of birth"
          value={dob}
          onChangeText={v => setDob(maskDob(v))}
          placeholder="DD/MM/YYYY"
          keyboardType="number-pad"
          maxLength={10}
          error={dobError}
        />
        {age !== null && !dobError ? (
          <View style={[styles.ageCard, { backgroundColor: colors.primarySoft }]}>
            <Text variant="bodyMedium" color={colors.primary}>
              🎂 You’re {age}. This can’t be changed later.
            </Text>
          </View>
        ) : null}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  gap: { gap: 20 },
  ageCard: { padding: 14, borderRadius: 16 },
});
