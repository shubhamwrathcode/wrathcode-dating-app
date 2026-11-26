import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Icon, Input, Text } from '@/components';
import { INTEREST_OPTIONS, INTERESTS_MAX, INTERESTS_MIN } from '@/core/constants';
import { haptics } from '@/core/services/haptics';
import { useTheme } from '@/core/theme';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingViewModel } from '../viewmodels/useOnboardingViewModel';

export const InterestsScreen = () => {
  const vm = useOnboardingViewModel('OnbInterests');
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string[]>(vm.draft.interests ?? []);
  const [query, setQuery] = useState('');

  const options = useMemo(
    () => INTEREST_OPTIONS.filter(o => o.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(s => s !== item));
    } else if (selected.length < INTERESTS_MAX) {
      setSelected([...selected, item]);
    } else {
      haptics.warning();
    }
  };

  const valid = selected.length >= INTERESTS_MIN && selected.length <= INTERESTS_MAX;

  return (
    <OnboardingLayout
      title="What are you into?"
      subtitle={`Pick ${INTERESTS_MIN}–${INTERESTS_MAX}. We use these for Daily Picks and conversation starters.`}
      progress={vm.progress}
      canContinue={valid}
      footerNote={`${selected.length}/${INTERESTS_MAX} selected`}
      onContinue={() => vm.next({ interests: selected })}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search interests"
        left={<Icon name="search" size={18} color={colors.textSecondary} />}
        containerStyle={styles.search}
      />
      <View style={styles.wrap}>
        {options.map(o => (
          <Chip
            key={o}
            label={o}
            selected={selected.includes(o)}
            disabled={!selected.includes(o) && selected.length >= INTERESTS_MAX}
            onPress={() => toggle(o)}
          />
        ))}
        {!options.length ? <Text muted>No matches for “{query}”.</Text> : null}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  search: { marginBottom: 16 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
