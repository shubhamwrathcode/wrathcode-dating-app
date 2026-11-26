import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withTiming, FadeIn } from 'react-native-reanimated';
import {
  BottomSheet, Button, Chip, GradientView, Header, Icon, Input, Row, Screen, Section, SmartImage, Text,
} from '@/components';
import { useT } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { formatCountdown, formatPhone } from '@/core/utils';
import { CHECKIN_OPTIONS, useSafetyViewModel } from '../viewmodels/useSafetyViewModel';

const SOS_HOLD_MS = 2000;

/** Hold-to-trigger SOS: a ring fills over 2s so it can't fire by accident. */
const SosButton = ({ onTrigger }: { onTrigger: () => void }) => {
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }), -1, false);
  }, [pulse]);

  const gesture = Gesture.LongPress()
    .minDuration(SOS_HOLD_MS)
    .onBegin(() => {
      progress.value = withTiming(1, { duration: SOS_HOLD_MS, easing: Easing.linear });
    })
    .onStart(() => {
      runOnJS(onTrigger)();
    })
    .onFinalize(() => {
      progress.value = withTiming(0, { duration: 200 });
    });

  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scale: progress.value }] }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.4 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 0.35 }] }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.sosWrap} accessibilityRole="button" accessibilityLabel="Hold for SOS">
        <Animated.View style={[styles.sosPulse, pulseStyle]} />
        <View style={styles.sos}>
          <Animated.View style={[styles.sosFill, fillStyle]} />
          <Text variant="h2" color="#fff">
            SOS
          </Text>
          <Text variant="micro" color="rgba(255,255,255,0.9)">
            Hold 2s
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
};

export const SafetyCentreScreen = () => {
  const vm = useSafetyViewModel();
  const t = useT();
  const { colors } = useTheme();

  return (
    <Screen>
      <Header title={t('safety.title')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GradientView name="romance" style={styles.hero}>
          <Icon name="shieldCheck" size={36} color="#fff" />
          <View style={styles.flex}>
            <Text variant="h3" color="#fff">
              Your safety comes first
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.85)">
              Verified profiles, date check-ins and a 24/7 trust & safety team.
            </Text>
          </View>
        </GradientView>

        <Section title="Date check-in" footer="We’ll ask if you’re okay when the timer ends. If you don’t respond, your trusted contact gets your live location.">
          <View style={styles.pad}>
            {vm.sosSent ? (
              <Animated.View entering={FadeIn.duration(250)} style={styles.sosSent}>
                <Icon name="alert" size={32} color={colors.error} />
                <Text variant="h3" center>
                  Help is on the way
                </Text>
                <Text variant="caption" muted center>
                  {vm.trustedContact?.name ?? 'Your trusted contact'} got your live location and date details. Call 112 if you’re in immediate danger.
                </Text>
                <Button title="I’m okay now" size="md" variant="outline" onPress={vm.resetSos} />
              </Animated.View>
            ) : vm.checkInActive ? (
              <View style={styles.checkIn}>
                <Text variant="caption" muted>
                  Check-in in
                </Text>
                <Text variant="h1" color={colors.primary}>
                  {formatCountdown(vm.checkInRemaining)}
                </Text>
                <View style={styles.checkInBtns}>
                  <Button title="I’m safe" icon="check" size="md" onPress={vm.imSafe} style={styles.flex} />
                </View>
                <SosButton onTrigger={vm.triggerSos} />
              </View>
            ) : (
              <>
                <Text variant="bodyMedium">Going on a date? Start a check-in.</Text>
                <View style={styles.chips}>
                  {CHECKIN_OPTIONS.map(o => (
                    <Chip key={o.label} size="sm" icon="clock" label={o.label} onPress={() => vm.startCheckIn(o.ms)} />
                  ))}
                </View>
              </>
            )}
          </View>
        </Section>

        <Section title="Trusted contact">
          {vm.trustedContact ? (
            <Row
              icon="users"
              title={vm.trustedContact.name}
              subtitle={formatPhone(vm.trustedContact.phone)}
              onPress={() => vm.setContactOpen(true)}
              last
            />
          ) : (
            <Row icon="plus" title="Add a trusted contact" subtitle="Share date details and SOS alerts with someone you trust" onPress={() => vm.setContactOpen(true)} last />
          )}
        </Section>

        <Section title="Protection">
          <Row icon="verified" iconColor={colors.superlike} title="Verified profiles only" subtitle="Only see people with the blue tick" toggle={vm.verifiedOnly} onToggle={vm.setVerifiedOnly} />
          <Row icon="camera" title="Screenshot alerts" subtitle="Get notified when someone screenshots your chat" toggle={vm.screenshotAlerts} onToggle={vm.setScreenshotAlerts} />
          <Row icon="eyeOff" title="Incognito mode" subtitle="Only people you like can see you" locked={vm.incognitoLocked} toggle={vm.incognito} onToggle={vm.setIncognito} last />
        </Section>

        <Section title={`Blocked (${vm.blocked.length})`}>
          {vm.blocked.length ? (
            vm.blocked.map((p, i) => (
              <View key={p!.id} style={[styles.blockedRow, i < vm.blocked.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <SmartImage uri={p!.photos[0]} name={p!.name} style={styles.blockedAvatar} blurRadius={8} />
                <Text variant="bodyMedium" style={styles.flex}>
                  {p!.name}
                </Text>
                <Button title="Unblock" size="sm" variant="ghost" onPress={() => vm.unblock(p!.id)} />
              </View>
            ))
          ) : (
            <Row icon="ban" title="No one blocked" subtitle="Blocked people can’t see or message you" last />
          )}
        </Section>

        <Section title="Dating safety tips">
          {[
            'Meet in a public place for the first few dates',
            'Tell a friend where you’re going — use the date planner share',
            'Keep conversations in DilSe until you trust them',
            'Never send money or financial details to a match',
          ].map((tip, i, arr) => (
            <Row key={tip} icon="check" title={tip} last={i === arr.length - 1} />
          ))}
        </Section>
      </ScrollView>

      <BottomSheet
        visible={vm.contactOpen}
        onClose={() => vm.setContactOpen(false)}
        title="Trusted contact"
        subtitle="They’ll receive date details you choose to share and SOS alerts"
        footer={
          <View style={styles.sheetBtns}>
            <Button title="Save contact" disabled={!vm.contactValid} onPress={vm.saveContact} />
            {vm.trustedContact ? <Button title="Remove" variant="ghost" onPress={() => { vm.removeContact(); vm.setContactOpen(false); }} /> : null}
          </View>
        }>
        <View style={styles.sheetBtns}>
          <Input label="Name" value={vm.name} onChangeText={vm.setName} placeholder="e.g. Mom, Priya" autoCapitalize="words" />
          <Input label="Phone" value={vm.phone} onChangeText={vm.setPhone} placeholder="10-digit mobile" keyboardType="phone-pad" left={<Text variant="bodyMedium">+91</Text>} />
        </View>
      </BottomSheet>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 24, marginBottom: 24 },
  flex: { flex: 1 },
  pad: { padding: 16, gap: 12 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  checkIn: { alignItems: 'center', gap: 8 },
  checkInBtns: { flexDirection: 'row', gap: 12, alignSelf: 'stretch', marginVertical: 8 },
  sosWrap: { width: 132, height: 132, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  sosPulse: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#EF4444' },
  sos: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  sosFill: { position: 'absolute', width: 112, height: 112, borderRadius: 56, backgroundColor: '#B91C1C' },
  sosSent: { alignItems: 'center', gap: 10 },
  blockedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  blockedAvatar: { width: 40, height: 40, borderRadius: 20 },
  sheetBtns: { gap: 12 },
});
