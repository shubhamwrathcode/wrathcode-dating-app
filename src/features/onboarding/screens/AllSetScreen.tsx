import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button, Confetti, FloatingHearts, Icon, IntentBadge, Screen, SmartImage, Text, VerifiedTick } from '@/components';
import { haptics } from '@/core/services/haptics';
import { finishOnboarding } from '@/domain/session';
import { useSessionStore } from '@/store/useSessionStore';

export const AllSetScreen = () => {
  const draft = useSessionStore(s => s.draft);

  useEffect(() => {
    haptics.success();
  }, []);

  const checks = [
    { label: `${draft.photos?.length ?? 0} photos added`, ok: (draft.photos?.length ?? 0) >= 2 },
    { label: `${draft.interests?.length ?? 0} interests`, ok: (draft.interests?.length ?? 0) >= 5 },
    { label: '3 prompts answered', ok: (draft.prompts?.length ?? 0) >= 3 },
    { label: draft.voiceIntroSec ? 'Voice intro recorded' : 'Voice intro (add later)', ok: !!draft.voiceIntroSec },
  ];

  return (
    <Screen background="romance">
      <FloatingHearts count={10} />
      <Confetti />
      <View style={styles.body}>
        <Animated.View entering={FadeIn.duration(250)} style={styles.avatarWrap}>
          <SmartImage uri={draft.photos?.[0]} name={draft.name} style={styles.avatar} />
          {draft.verified ? (
            <View style={styles.tick}>
              <VerifiedTick size={34} />
            </View>
          ) : null}
        </Animated.View>
        <Animated.View entering={FadeIn.delay(150).duration(250)} style={styles.texts}>
          <Text variant="romantic" color="#fff" center>
            You’re all set, {draft.name}
          </Text>
          <Text color="rgba(255,255,255,0.85)" center>
            Your profile is live. Your first Daily Picks are waiting.
          </Text>
          {draft.intent ? (
            <View style={styles.badge}>
              <IntentBadge intent={draft.intent} glass />
            </View>
          ) : null}
        </Animated.View>
        <Animated.View entering={FadeIn.delay(250).duration(250)} style={styles.checks}>
          {checks.map(c => (
            <View key={c.label} style={styles.checkRow}>
              <Icon name={c.ok ? 'check' : 'plus'} size={16} color="#fff" strokeWidth={2.5} />
              <Text variant="bodyMedium" color={c.ok ? '#fff' : 'rgba(255,255,255,0.65)'}>
                {c.label}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
      <View style={styles.footer}>
        <Button title="Start exploring" variant="surface" iconRight="chevronRight" onPress={finishOnboarding} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  avatarWrap: { marginBottom: 24 },
  avatar: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: '#fff' },
  tick: { position: 'absolute', right: 4, bottom: 4 },
  texts: { alignItems: 'center', gap: 10 },
  badge: { marginTop: 8 },
  checks: { marginTop: 28, gap: 10, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.14)', padding: 18, borderRadius: 22 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footer: { paddingHorizontal: 20, paddingVertical: 16 },
});
