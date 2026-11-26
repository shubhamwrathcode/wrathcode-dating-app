import { useCallback, useEffect, useRef, useState } from 'react';
import { haptics } from '@/core/services/haptics';
import { randomWaveform } from '@/core/utils';

/**
 * Simulated voice recorder with the same surface as a native recorder
 * (react-native-audio-recorder-player / expo-av): start → seconds tick → stop.
 */
export const useVoiceRecorder = (maxSec: number, onAutoStop?: (sec: number) => void) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStop = useRef(onAutoStop);
  autoStop.current = onAutoStop;

  const clear = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  const stop = useCallback(() => {
    clear();
    setRecording(false);
    const sec = Math.min(maxSec, (Date.now() - startedAt.current) / 1000);
    return { durationSec: Math.max(1, Math.round(sec)), waveform: randomWaveform() };
  }, [maxSec]);

  const start = useCallback(() => {
    clear();
    haptics.medium();
    startedAt.current = Date.now();
    setSeconds(0);
    setRecording(true);
    timer.current = setInterval(() => {
      const sec = (Date.now() - startedAt.current) / 1000;
      setSeconds(sec);
      if (sec >= maxSec) {
        clear();
        setRecording(false);
        autoStop.current?.(maxSec);
      }
    }, 100);
  }, [maxSec]);

  const cancel = useCallback(() => {
    clear();
    setRecording(false);
    setSeconds(0);
  }, []);

  useEffect(() => clear, []);

  return { recording, seconds, start, stop, cancel };
};

/** Simulated playback progress (0..1) for a clip of `durationSec`. */
export const usePlayback = (durationSec: number) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const raf = useRef(0);

  const toggle = useCallback(() => {
    if (playing) {
      cancelAnimationFrame(raf.current);
      setPlaying(false);
      return;
    }
    setPlaying(true);
    const startProgress = progress >= 1 ? 0 : progress;
    const startAt = Date.now() - startProgress * durationSec * 1000;
    const tick = () => {
      const p = Math.min(1, (Date.now() - startAt) / (durationSec * 1000));
      setProgress(p);
      if (p < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    raf.current = requestAnimationFrame(tick);
  }, [playing, progress, durationSec]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return { playing, progress, toggle };
};

/** Re-renders every `intervalMs` — for countdowns and "x min ago" labels. */
export const useNow = (intervalMs = 1000, enabled = true) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, enabled]);
  return now;
};

export { useAudioPlayer, useAudioRecorder } from './audio';
export type { RecordedClip } from './audio';
