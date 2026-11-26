import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { BottomSheet, Button, Chip, Input, ScalePressable, Text } from '@/components';
import { DATE_PLACES } from '@/core/constants';
import { useTheme } from '@/core/theme';
import { DateProposal, TrustedContact } from '@/data/models';

const TIMES = ['10:00 AM', '1:00 PM', '5:30 PM', '7:30 PM', '8:30 PM'];

interface Props {
  visible: boolean;
  onClose: () => void;
  partnerName: string;
  city: string;
  trustedContact: TrustedContact | null;
  onSend: (d: DateProposal) => void;
  onAddContact: () => void;
}

/** Date planner: pick a place, day and time; optionally share with a trusted contact. */
export const DatePlannerSheet = ({ visible, onClose, partnerName, city, trustedContact, onSend, onAddContact }: Props) => {
  const { colors } = useTheme();
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        d.setHours(12, 0, 0, 0);
        return d;
      }),
    [],
  );
  const places = DATE_PLACES.default;
  const [place, setPlace] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [day, setDay] = useState(days[2]);
  const [time, setTime] = useState(TIMES[3]);
  const [share, setShare] = useState(!!trustedContact);

  useEffect(() => {
    if (visible) {
      setPlace(null);
      setCustom('');
      setShare(!!trustedContact);
    }
  }, [visible, trustedContact]);

  const cityName = city.split(',').pop()?.trim() ?? city;
  const chosen = place !== null ? places[place] : null;
  const canSend = !!chosen || custom.trim().length > 2;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`Plan a date with ${partnerName}`}
      subtitle="Skip the endless texting — propose a real plan"
      scroll
      footer={
        <Button
          title="Send date plan"
          icon="calendar"
          disabled={!canSend}
          onPress={() => {
            onSend({
              place: chosen?.name ?? custom.trim(),
              area: chosen ? `${chosen.area}, ${cityName}` : cityName,
              dateISO: day.toISOString(),
              time,
              status: 'proposed',
              sharedWithContact: share && !!trustedContact,
            });
            onClose();
          }}
        />
      }>
      <Text variant="title" style={styles.label}>
        Where
      </Text>
      <View style={styles.places}>
        {places.map((p, i) => (
          <ScalePressable
            key={p.name}
            onPress={() => setPlace(i)}
            style={[styles.place, { borderColor: place === i ? colors.primary : colors.border, backgroundColor: place === i ? colors.primarySoft : colors.surface }]}>
            <Text variant="micro" muted>
              {p.kind}
            </Text>
            <Text variant="bodyMedium" numberOfLines={1}>
              {p.name}
            </Text>
          </ScalePressable>
        ))}
      </View>
      <Input value={custom} onChangeText={t => { setCustom(t); setPlace(null); }} placeholder="Or type a place…" containerStyle={styles.custom} />

      <Text variant="title" style={styles.label}>
        When
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
        {days.map(d => {
          const sel = d.toDateString() === day.toDateString();
          return (
            <ScalePressable
              key={d.toISOString()}
              onPress={() => setDay(d)}
              style={[styles.day, { borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primarySoft : colors.surface }]}>
              <Text variant="micro" color={sel ? colors.primary : colors.textSecondary}>
                {d.toLocaleDateString('en-IN', { weekday: 'short' })}
              </Text>
              <Text variant="h3" color={sel ? colors.primary : colors.textPrimary}>
                {d.getDate()}
              </Text>
            </ScalePressable>
          );
        })}
      </ScrollView>
      <View style={styles.times}>
        {TIMES.map(t => (
          <Chip key={t} size="sm" label={t} selected={time === t} onPress={() => setTime(t)} />
        ))}
      </View>

      <View style={[styles.share, { borderColor: colors.border }]}>
        <View style={styles.flex}>
          <Text variant="bodyMedium">Share with a trusted contact</Text>
          <Text variant="caption" muted>
            {trustedContact ? `${trustedContact.name} will get the date details` : 'Add a trusted contact in the Safety centre'}
          </Text>
        </View>
        {trustedContact ? (
          <Switch value={share} onValueChange={setShare} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
        ) : (
          <Button title="Add" size="sm" variant="outline" onPress={onAddContact} />
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  label: { marginTop: 8, marginBottom: 10 },
  places: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  place: { width: '48.5%', padding: 12, borderRadius: 16, borderWidth: 1.5, gap: 2 },
  custom: { marginTop: 10 },
  days: { gap: 8 },
  day: { width: 58, paddingVertical: 10, borderRadius: 16, borderWidth: 1.5, alignItems: 'center' },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  share: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  flex: { flex: 1 },
});
