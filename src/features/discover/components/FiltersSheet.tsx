import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { BottomSheet, Button, Chip, Icon, ScalePressable, Text } from '@/components';
import { DEFAULT_FILTERS, INTENTS, LANGUAGES } from '@/core/constants';
import { useTheme } from '@/core/theme';
import { DiscoveryFilters } from '@/data/models';

const DISTANCES = [5, 10, 25, 50, 100];

const Stepper = ({ value, onChange, min, max, step = 1, suffix = '' }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.stepper, { borderColor: colors.border }]}>
      <ScalePressable onPress={() => onChange(Math.max(min, value - step))} style={styles.stepBtn} accessibilityLabel="Decrease">
        <Text variant="h3" color={colors.primary}>
          −
        </Text>
      </ScalePressable>
      <Text variant="title" style={styles.stepValue} center>
        {value}
        {suffix}
      </Text>
      <ScalePressable onPress={() => onChange(Math.min(max, value + step))} style={styles.stepBtn} accessibilityLabel="Increase">
        <Icon name="plus" size={18} color={colors.primary} />
      </ScalePressable>
    </View>
  );
};

const Label = ({ title, value }: { title: string; value?: string }) => (
  <View style={styles.labelRow}>
    <Text variant="title">{title}</Text>
    {value ? (
      <Text variant="captionMedium" muted>
        {value}
      </Text>
    ) : null}
  </View>
);

interface Props {
  visible: boolean;
  onClose: () => void;
  value: DiscoveryFilters;
  onApply: (f: DiscoveryFilters) => void;
  resultCount: (f: DiscoveryFilters) => number;
  travelLocked: boolean;
  onTravel: () => void;
}

export const FiltersSheet = ({ visible, onClose, value, onApply, resultCount, travelLocked, onTravel }: Props) => {
  const { colors } = useTheme();
  const [f, setF] = useState(value);

  useEffect(() => {
    if (visible) {
      setF(value);
    }
  }, [visible, value]);

  const set = (patch: Partial<DiscoveryFilters>) => setF(prev => ({ ...prev, ...patch }));
  const count = resultCount(f);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      scroll
      footer={
        <View style={styles.footer}>
          <Button title="Reset" variant="surface" size="md" onPress={() => setF(DEFAULT_FILTERS)} style={styles.reset} />
          <Button
            title={count ? `Show ${count} people` : 'No one matches'}
            size="md"
            disabled={!count}
            onPress={() => {
              onApply(f);
              onClose();
            }}
            style={styles.flex}
          />
        </View>
      }>
      <Label title="Age" value={`${f.ageMin} – ${f.ageMax}`} />
      <View style={styles.rangeRow}>
        <Stepper value={f.ageMin} min={18} max={f.ageMax} onChange={ageMin => set({ ageMin })} />
        <Text muted>to</Text>
        <Stepper value={f.ageMax} min={f.ageMin} max={60} onChange={ageMax => set({ ageMax })} />
      </View>

      <Label title="Maximum distance" value={`${f.maxDistanceKm} km`} />
      <View style={styles.wrap}>
        {DISTANCES.map(d => (
          <Chip key={d} size="sm" label={`${d} km`} selected={f.maxDistanceKm === d} onPress={() => set({ maxDistanceKm: d })} />
        ))}
      </View>

      <Label title="Looking for" value={f.intents.length ? undefined : 'Any'} />
      <View style={styles.wrap}>
        {INTENTS.map(i => (
          <Chip
            key={i.id}
            size="sm"
            emoji={i.emoji}
            label={i.label}
            selected={f.intents.includes(i.id)}
            onPress={() => set({ intents: f.intents.includes(i.id) ? f.intents.filter(x => x !== i.id) : [...f.intents, i.id] })}
          />
        ))}
      </View>

      <View style={[styles.toggleRow, { borderColor: colors.border }]}>
        <View style={styles.flex}>
          <Text variant="title">Verified profiles only</Text>
          <Text variant="caption" muted>
            Only show people with the blue tick
          </Text>
        </View>
        <Switch value={f.verifiedOnly} onValueChange={verifiedOnly => set({ verifiedOnly })} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
      </View>

      <Label title="Height" value={`${f.heightMin} – ${f.heightMax} cm`} />
      <View style={styles.rangeRow}>
        <Stepper value={f.heightMin} min={140} max={f.heightMax} step={5} onChange={heightMin => set({ heightMin })} />
        <Text muted>to</Text>
        <Stepper value={f.heightMax} min={f.heightMin} max={215} step={5} onChange={heightMax => set({ heightMax })} />
      </View>

      <Label title="Languages" value={f.languages.length ? undefined : 'Any'} />
      <View style={styles.wrap}>
        {LANGUAGES.map(l => (
          <Chip
            key={l}
            size="sm"
            label={l}
            selected={f.languages.includes(l)}
            onPress={() => set({ languages: f.languages.includes(l) ? f.languages.filter(x => x !== l) : [...f.languages, l] })}
          />
        ))}
      </View>

      <ScalePressable onPress={onTravel} style={[styles.toggleRow, { borderColor: colors.border }]}>
        <Icon name="globe" size={22} color={colors.secondary} />
        <View style={styles.flex}>
          <Text variant="title">Travel mode</Text>
          <Text variant="caption" muted>
            Swipe in another city before you land
          </Text>
        </View>
        {travelLocked ? <Icon name="crown" size={20} color={colors.gold} /> : <Icon name="chevronRight" size={18} color={colors.textSecondary} />}
      </ScalePressable>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, height: 52 },
  stepBtn: { width: 44, height: 52, alignItems: 'center', justifyContent: 'center' },
  stepValue: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth },
  footer: { flexDirection: 'row', gap: 12 },
  reset: { width: 110 },
  flex: { flex: 1 },
});
