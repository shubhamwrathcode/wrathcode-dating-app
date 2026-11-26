import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BottomSheet, Button, GradientView, Icon, Input, ScalePressable, Text } from '@/components';
import { REPORT_REASONS } from '@/core/constants';
import { haptics } from '@/core/services/haptics';
import { useTheme } from '@/core/theme';
import { delay } from '@/core/utils';
import { ReportReason } from '@/data/models';
import { useChatStore } from '@/store/useChatStore';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { useSettingsStore } from '@/store/useSettingsStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  profileId: string;
  name: string;
  onDone?: (blocked: boolean) => void;
}

/** Report flow: reason → details (+ block) → submitted. Goes to the admin moderation queue. */
export const ReportSheet = ({ visible, onClose, profileId, name, onDone }: Props) => {
  const { colors } = useTheme();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [stage, setStage] = useState<'reason' | 'details' | 'sending' | 'done'>('reason');

  useEffect(() => {
    if (visible) {
      setReason(null);
      setDetails('');
      setAlsoBlock(true);
      setStage('reason');
    }
  }, [visible]);

  const submit = async () => {
    setStage('sending');
    await delay(900);
    useSettingsStore.getState().report(profileId);
    if (alsoBlock) {
      useSettingsStore.getState().block(profileId);
      useChatStore.getState().removeMatchByProfile(profileId);
      if (!useDiscoveryStore.getState().swipes.some(s => s.profileId === profileId)) {
        useDiscoveryStore.getState().recordSwipe(profileId, 'pass');
      }
    }
    haptics.success();
    setStage('done');
  };

  const finish = () => {
    onClose();
    onDone?.(alsoBlock);
  };

  const selected = REPORT_REASONS.find(r => r.id === reason);

  return (
    <BottomSheet
      visible={visible}
      onClose={stage === 'done' ? finish : onClose}
      title={stage === 'done' ? undefined : `Report ${name}`}
      subtitle={stage === 'reason' ? 'Your report is anonymous. We review every report within 24 hours.' : undefined}
      scroll
      footer={
        stage === 'details' || stage === 'sending' ? (
          <Button title="Submit report" variant="danger" onPress={submit} loading={stage === 'sending'} disabled={reason === 'other' && details.trim().length < 5} />
        ) : stage === 'done' ? (
          <Button title="Done" onPress={finish} />
        ) : undefined
      }>
      {stage === 'reason' ? (
        <View>
          {REPORT_REASONS.map(r => (
            <ScalePressable
              key={r.id}
              onPress={() => {
                setReason(r.id);
                setStage('details');
              }}
              style={[styles.reason, { borderBottomColor: colors.border }]}>
              <View style={styles.flex}>
                <Text variant="bodyMedium">{r.label}</Text>
                <Text variant="caption" muted>
                  {r.hint}
                </Text>
              </View>
              <Icon name="chevronRight" size={18} color={colors.textSecondary} />
            </ScalePressable>
          ))}
        </View>
      ) : stage === 'done' ? (
        <View style={styles.done}>
          <Animated.View entering={FadeIn.duration(250)}>
            <GradientView name="primary" style={styles.doneIcon}>
              <Icon name="shieldCheck" size={40} color="#fff" />
            </GradientView>
          </Animated.View>
          <Text variant="h3" center>
            Thanks for keeping DilSe safe
          </Text>
          <Text muted center>
            {alsoBlock ? `${name} has been blocked and won’t see you again. ` : ''}Our trust & safety team will review this report.
          </Text>
        </View>
      ) : (
        <View style={styles.gap}>
          <View style={[styles.selected, { backgroundColor: colors.primarySoft }]}>
            <Icon name="flag" size={18} color={colors.primary} />
            <Text variant="bodyMedium" color={colors.primary} style={styles.flex}>
              {selected?.label}
            </Text>
            <ScalePressable onPress={() => setStage('reason')}>
              <Text variant="captionMedium" color={colors.primary}>
                Change
              </Text>
            </ScalePressable>
          </View>
          <Input
            value={details}
            onChangeText={setDetails}
            placeholder={reason === 'other' ? 'Tell us what happened (required)' : 'Anything else we should know? (optional)'}
            multiline
            style={styles.multiline}
          />
          <View style={styles.blockRow}>
            <View style={styles.flex}>
              <Text variant="bodyMedium">Also block {name}</Text>
              <Text variant="caption" muted>
                They won’t be able to see or message you
              </Text>
            </View>
            <Switch value={alsoBlock} onValueChange={setAlsoBlock} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
          </View>
        </View>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  reason: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  flex: { flex: 1 },
  gap: { gap: 16 },
  selected: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  done: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  doneIcon: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});
