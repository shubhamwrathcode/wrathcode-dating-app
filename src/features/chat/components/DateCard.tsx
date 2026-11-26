import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, GradientView, Icon, Text } from '@/components';
import { useTheme } from '@/core/theme';
import { DateProposal } from '@/data/models';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

/** In-chat date plan card (place, date, time, status). */
export const DateCard = ({ date, mine, partnerName, onAccept }: { date: DateProposal; mine: boolean; partnerName: string; onAccept?: () => void }) => {
  const { colors, shadowSoft } = useTheme();
  const accepted = date.status === 'accepted';
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadowSoft]}>
      <GradientView name={accepted ? 'gold' : 'romance'} style={styles.head}>
        <Icon name="calendar" size={18} color={accepted ? '#3B2410' : '#fff'} />
        <Text variant="captionMedium" color={accepted ? '#3B2410' : '#fff'}>
          {accepted ? 'Date confirmed 🎉' : mine ? 'You proposed a date' : `${partnerName} proposed a date`}
        </Text>
      </GradientView>
      <View style={styles.body}>
        <Text variant="title">{date.place}</Text>
        <View style={styles.row}>
          <Icon name="mapPin" size={14} color={colors.textSecondary} />
          <Text variant="caption" muted>
            {date.area}
          </Text>
        </View>
        <View style={styles.row}>
          <Icon name="clock" size={14} color={colors.textSecondary} />
          <Text variant="caption" muted>
            {fmtDate(date.dateISO)} · {date.time}
          </Text>
        </View>
        {date.sharedWithContact ? (
          <View style={[styles.shared, { backgroundColor: colors.success + '1A' }]}>
            <Icon name="shieldCheck" size={14} color={colors.success} />
            <Text variant="micro" color={colors.success}>
              Shared with your trusted contact
            </Text>
          </View>
        ) : null}
        {!mine && !accepted && onAccept ? <Button title="Accept" size="sm" onPress={onAccept} style={styles.btn} /> : null}
        {mine && !accepted ? (
          <Text variant="micro" muted style={styles.waiting}>
            Waiting for {partnerName} to confirm…
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { width: 250, borderRadius: 22, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  body: { padding: 14, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shared: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start', marginTop: 4 },
  btn: { marginTop: 6 },
  waiting: { marginTop: 4 },
});
