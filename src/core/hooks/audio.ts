import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { createSound } from 'react-native-nitro-sound';
import { haptics } from '@/core/services/haptics';

/** Android needs RECORD_AUDIO at runtime; iOS shows its own prompt (NSMicrophoneUsageDescription). */
const ensureMicPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }
  const perm = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  if (await PermissionsAndroid.check(perm)) {
    return true;
  }
  const res = await PermissionsAndroid.request(perm, {
    title: 'Microphone permission',
    message: 'Allow microphone access to record your voice intro.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  if (res === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }
  if (res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    Alert.alert('Microphone access needed', 'Allow microphone access in Settings to record a voice intro.', [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]);
  }
  return false;
};

/** dB metering (-160..0) → bar level (0.08..1). */
const levelFromDb = (db?: number) => (db === undefined ? 0.3 : Math.max(0.08, Math.min(1, (db + 55) / 55)));

/** Squash the raw level samples into `count` bars. */
const toBars = (levels: number[], count: number) => {
  if (!levels.length) {
    return Array.from({ length: count }, () => 0.15);
  }
  return Array.from({ length: count }, (_, i) => {
    const from = Math.floor((i * levels.length) / count);
    const to = Math.max(from + 1, Math.floor(((i + 1) * levels.length) / count));
    const slice = levels.slice(from, to);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
};

export interface RecordedClip {
  uri: string;
  durationSec: number;
  waveform: number[];
}

/** Real microphone recorder (react-native-nitro-sound): start → live levels → stop → file URI. */
export const useAudioRecorder = (maxSec: number, onAutoStop?: (clip: RecordedClip | null) => void) => {
  const sound = useRef(createSound()).current;
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>([]);
  const levelsRef = useRef<number[]>([]);
  const secondsRef = useRef(0);
  const active = useRef(false);
  const autoStop = useRef(onAutoStop);
  autoStop.current = onAutoStop;

  const finish = useCallback(async (): Promise<RecordedClip | null> => {
    if (!active.current) {
      return null;
    }
    active.current = false;
    sound.removeRecordBackListener();
    setRecording(false);
    try {
      const uri = await sound.stopRecorder();
      const durationSec = Math.max(1, Math.min(maxSec, Math.round(secondsRef.current)));
      return { uri, durationSec, waveform: toBars(levelsRef.current, 28) };
    } catch {
      Alert.alert('Recording failed', 'Please try again.');
      return null;
    }
  }, [sound, maxSec]);

  const start = useCallback(async () => {
    if (active.current || !(await ensureMicPermission())) {
      return false;
    }
    levelsRef.current = [];
    secondsRef.current = 0;
    setLevels([]);
    setSeconds(0);
    try {
      sound.setSubscriptionDuration(0.1);
      sound.addRecordBackListener(e => {
        const sec = e.currentPosition / 1000;
        secondsRef.current = sec;
        levelsRef.current.push(levelFromDb(e.currentMetering));
        setSeconds(sec);
        setLevels(levelsRef.current.slice(-32));
        if (sec >= maxSec) {
          finish().then(clip => autoStop.current?.(clip));
        }
      });
      await sound.startRecorder(undefined, undefined, true);
      active.current = true;
      haptics.medium();
      setRecording(true);
      return true;
    } catch {
      sound.removeRecordBackListener();
      Alert.alert('Could not start recording', 'Check that no other app is using the microphone.');
      return false;
    }
  }, [sound, maxSec, finish]);

  useEffect(
    () => () => {
      if (active.current) {
        active.current = false;
        sound.removeRecordBackListener();
        sound.stopRecorder().catch(() => undefined);
      }
    },
    [sound],
  );

  return { recording, seconds, levels, start, stop: finish };
};

/** Real audio playback of a local/remote file with 0..1 progress. */
export const useAudioPlayer = (uri?: string) => {
  const sound = useRef(createSound()).current;
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const state = useRef<'idle' | 'playing' | 'paused'>('idle');

  const reset = useCallback(() => {
    sound.removePlayBackListener();
    sound.removePlaybackEndListener();
    state.current = 'idle';
    setPlaying(false);
  }, [sound]);

  const stop = useCallback(async () => {
    if (state.current !== 'idle') {
      await sound.stopPlayer().catch(() => undefined);
    }
    reset();
    setProgress(0);
  }, [sound, reset]);

  const toggle = useCallback(async () => {
    if (!uri) {
      return;
    }
    try {
      if (state.current === 'playing') {
        await sound.pausePlayer();
        state.current = 'paused';
        setPlaying(false);
      } else if (state.current === 'paused') {
        await sound.resumePlayer();
        state.current = 'playing';
        setPlaying(true);
      } else {
        sound.setSubscriptionDuration(0.05);
        sound.addPlayBackListener(e => {
          if (e.duration > 0) {
            setProgress(Math.min(1, e.currentPosition / e.duration));
          }
        });
        sound.addPlaybackEndListener(() => {
          reset();
          setProgress(1);
        });
        setProgress(0);
        await sound.startPlayer(uri);
        state.current = 'playing';
        setPlaying(true);
      }
    } catch {
      reset();
      Alert.alert('Playback failed', 'This recording could not be played.');
    }
  }, [uri, sound, reset]);

  // New clip (or cleared) → stop whatever is playing.
  useEffect(() => {
    stop();
  }, [uri, stop]);

  useEffect(
    () => () => {
      sound.removePlayBackListener();
      sound.removePlaybackEndListener();
      sound.stopPlayer().catch(() => undefined);
    },
    [sound],
  );

  return { playing, progress, toggle, stop };
};
