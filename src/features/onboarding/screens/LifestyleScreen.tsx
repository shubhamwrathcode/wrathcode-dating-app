import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Icon, Input, ScalePressable, Text } from '@/components';
import { EDUCATION_OPTIONS, LANGUAGES, RELIGION_OPTIONS, VALUES } from '@/core/constants';
import { useTheme } from '@/core/theme';
import { formatHeight } from '@/core/utils';
import { Frequency, Lifestyle } from '@/data/models';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingViewModel } from '../viewmodels/useOnboardingViewModel';

const FREQ: { id: Frequency; label: string }[] = [
  { id: 'never', label: 'Never' },
  { id: 'socially', label: 'Socially' },
  { id: 'often', label: 'Often' },
];

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.group}>
    <Text variant="title" style={styles.groupTitle}>
      {title}
    </Text>
    <View style={styles.wrap}>{children}</View>
  </View>
);

/** Reusable lifestyle form (also used in Edit profile). */
export const LifestyleForm = ({
  value, onChange, values, onValues,
}: { value: Lifestyle; onChange: (l: Lifestyle) => void; values: string[]; onValues: (v: string[]) => void }) => {
  const { colors } = useTheme();
  const height = value.heightCm ?? 168;
  const set = (patch: Partial<Lifestyle>) => onChange({ ...value, ...patch });
  const toggleLang = (l: string) =>
    set({ languages: value.languages.includes(l) ? value.languages.filter(x => x !== l) : [...value.languages, l] });

  return (
    <View>
      <Group title="Height">
        <View style={[styles.stepper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ScalePressable haptic onPress={() => set({ heightCm: Math.max(140, height - 1) })} style={[styles.stepBtn, { backgroundColor: colors.primarySoft }]}>
            <Text variant="h3" color={colors.primary}>−</Text>
          </ScalePressable>
          <Text variant="title" style={styles.flex} center>
            {formatHeight(height)}
          </Text>
          <ScalePressable haptic onPress={() => set({ heightCm: Math.min(215, height + 1) })} style={[styles.stepBtn, { backgroundColor: colors.primarySoft }]}>
            <Icon name="plus" size={18} color={colors.primary} />
          </ScalePressable>
        </View>
      </Group>
      <Group title="Work">
        <Input value={value.job ?? ''} onChangeText={job => set({ job })} placeholder="Job title" containerStyle={styles.full} />
        <Input value={value.company ?? ''} onChangeText={company => set({ company })} placeholder="Company (optional)" containerStyle={styles.full} />
      </Group>
      <Group title="Education">
        {EDUCATION_OPTIONS.map(e => (
          <Chip key={e} size="sm" label={e} selected={value.education === e} onPress={() => set({ education: e })} />
        ))}
      </Group>
      <Group title="Drinking">
        {FREQ.map(f => (
          <Chip key={f.id} size="sm" label={f.label} selected={value.drinking === f.id} onPress={() => set({ drinking: f.id })} />
        ))}
      </Group>
      <Group title="Smoking">
        {FREQ.map(f => (
          <Chip key={f.id} size="sm" label={f.label} selected={value.smoking === f.id} onPress={() => set({ smoking: f.id })} />
        ))}
      </Group>
      <Group title="Religion (optional)">
        {RELIGION_OPTIONS.map(r => (
          <Chip key={r} size="sm" label={r} selected={value.religion === r} onPress={() => set({ religion: r })} />
        ))}
      </Group>
      <Group title="Languages">
        {LANGUAGES.map(l => (
          <Chip key={l} size="sm" label={l} selected={value.languages.includes(l)} onPress={() => toggleLang(l)} />
        ))}
      </Group>
      <Group title="What you value most (pick 3)">
        {VALUES.map(v => (
          <Chip
            key={v}
            size="sm"
            label={v}
            selected={values.includes(v)}
            disabled={!values.includes(v) && values.length >= 3}
            onPress={() => onValues(values.includes(v) ? values.filter(x => x !== v) : [...values, v])}
          />
        ))}
      </Group>
    </View>
  );
};

export const LifestyleScreen = () => {
  const vm = useOnboardingViewModel('OnbLifestyle');
  const [lifestyle, setLifestyle] = useState<Lifestyle>(vm.draft.lifestyle ?? { languages: ['English', 'Hindi'] });
  const [values, setValues] = useState<string[]>(vm.draft.values ?? []);

  return (
    <OnboardingLayout
      title="Your lifestyle"
      subtitle="Optional, but it powers your compatibility score."
      progress={vm.progress}
      canContinue={lifestyle.languages.length > 0}
      onSkip={() => vm.next()}
      onContinue={() => vm.next({ lifestyle, values })}>
      <LifestyleForm value={lifestyle} onChange={setLifestyle} values={values} onValues={setValues} />
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: 24 },
  groupTitle: { marginBottom: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  full: { width: '100%' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 8, width: '100%' },
  stepBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});
