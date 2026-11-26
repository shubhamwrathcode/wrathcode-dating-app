import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GradientView, Icon, ScalePressable, Text, Waveform } from '@/components';
import { RecordedClip, useAudioPlayer, useAudioRecorder } from '@/core/hooks';
import { useTheme } from '@/core/theme';
import { formatDuration } from '@/core/utils';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingViewModel } from '../viewmodels/useOnboardingViewModel';

const MAX = 15;

export const VoiceIntroScreen = () => {
  const vm = useOnboardingViewModel('OnbVoice');
  const { colors, shadow } = useTheme();
  const [clip, setClip] = useState<RecordedClip | null>(
    vm.draft.voiceIntroSec && vm.draft.voiceIntroUri
      ? { uri: vm.draft.voiceIntroUri, durationSec: vm.draft.voiceIntroSec, waveform: [] }
      : null,
  );
  const recorder = useAudioRecorder(MAX, auto => auto && setClip(auto));
  const playback = useAudioPlayer(clip?.uri);

  const onMic = async () => {
    if (recorder.recording) {
      const done = await recorder.stop();
      if (done) {
        setClip(done);
      }
    } else {
      await playback.stop();
      setClip(null);
      await recorder.start();
    }
  };

  return (
    <OnboardingLayout
      title="Record a voice intro"
      subtitle="15 seconds to say hi. Profiles with a voice intro get 2× more conversations."
      progress={vm.progress}
      canContinue={!!clip && !recorder.recording}
      onSkip={() => vm.next()}
      onContinue={() => vm.next({ voiceIntroSec: clip?.durationSec, voiceIntroUri: clip?.uri })}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text variant="captionMedium" color={colors.primary}>
          Try saying…
        </Text>
        <Text variant="title" style={styles.prompt}>
          “Hi! I’m {vm.draft.name ?? 'here'}, and my perfect weekend looks like…”
        </Text>
        <View style={styles.wave}>
          {recorder.recording ? (
            <Waveform bars={[...Array(Math.max(0, 32 - recorder.levels.length)).fill(0.08), ...recorder.levels]} progress={1} color={colors.border} activeColor={colors.primary} height={44} count={32} />
          ) : clip ? (
            <Waveform bars={clip.waveform.length ? clip.waveform : undefined} progress={playback.progress} color={colors.border} activeColor={colors.primary} height={44} count={32} />
          ) : (
            <Text muted>Tap the mic to start recording</Text>
          )}
        </View>
        <Text variant="h2" center>
          {formatDuration(recorder.recording ? recorder.seconds : clip?.durationSec ?? 0)} <Text muted>/ 0:{MAX}</Text>
        </Text>
      </View>

      <View style={styles.controls}>
        {clip && !recorder.recording ? (
          <ScalePressable onPress={playback.toggle} style={[styles.small, { backgroundColor: colors.primarySoft }]} accessibilityLabel="Play">
            <Icon name={playback.playing ? 'pause' : 'play'} size={22} color={colors.primary} filled />
          </ScalePressable>
        ) : (
          <View style={styles.small} />
        )}
        <ScalePressable onPress={onMic} haptic style={shadow} accessibilityLabel={recorder.recording ? 'Stop recording' : 'Record'}>
          <GradientView name="primary" style={styles.mic}>
            <Icon name={recorder.recording ? 'pause' : 'mic'} size={34} color="#fff" filled={recorder.recording} />
          </GradientView>
        </ScalePressable>
        {clip && !recorder.recording ? (
          <ScalePressable onPress={() => setClip(null)} style={[styles.small, { backgroundColor: colors.primarySoft }]} accessibilityLabel="Delete">
            <Icon name="trash" size={22} color={colors.primary} />
          </ScalePressable>
        ) : (
          <View style={styles.small} />
        )}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 20, gap: 16 },
  prompt: { lineHeight: 24 },
  wave: { height: 60, alignItems: 'center', justifyContent: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 32 },
  mic: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  small: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
