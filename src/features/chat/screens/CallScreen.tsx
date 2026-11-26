import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing, FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView, Icon, IconName, ScalePressable, SmartImage, Text } from '@/components';
import { haptics } from '@/core/services/haptics';
import { formatDuration } from '@/core/utils';
import { profileRepository } from '@/data/repositories/profileRepository';
import { addSystemMessage } from '@/domain/chat';
import { RootScreenProps } from '@/navigation/types';
import { useChatStore } from '@/store/useChatStore';
import { useSessionStore } from '@/store/useSessionStore';

type Phase = 'calling' | 'ringing' | 'connected' | 'ended';

const Control = ({ icon, label, active, onPress, danger }: { icon: IconName; label: string; active?: boolean; onPress: () => void; danger?: boolean }) => (
  <View style={styles.control}>
    <ScalePressable onPress={onPress} haptic accessibilityLabel={label}>
      {danger ? (
        <View style={[styles.ctrlBtn, { backgroundColor: '#EF4444' }]}>
          <View style={styles.hangup}>
            <Icon name="phone" size={28} color="#fff" filled />
          </View>
        </View>
      ) : (
        <View style={[styles.ctrlBtn, { backgroundColor: active ? '#fff' : 'rgba(255,255,255,0.18)' }]}>
          <Icon name={icon} size={24} color={active ? '#1E1A2B' : '#fff'} />
        </View>
      )}
    </ScalePressable>
    <Text variant="micro" color="rgba(255,255,255,0.85)">
      {label}
    </Text>
  </View>
);

/**
 * Audio / video call UI. Signalling + media come from Agora / WebRTC in
 * production; here the state machine runs locally: calling → ringing → connected.
 */
export const CallScreen = ({ route, navigation }: RootScreenProps<'Call'>) => {
  const { matchId, video } = route.params;
  const user = useSessionStore(s => s.user)!;
  const match = useChatStore(s => s.matches.find(m => m.id === matchId));
  const partner = match ? profileRepository.getById(match.profileId) : undefined;
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('calling');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(video);
  const [camOn, setCamOn] = useState(video);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!reduce) {
      pulse.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }), -1, false);
    }
    const t1 = setTimeout(() => setPhase('ringing'), 900);
    const t2 = setTimeout(() => {
      setPhase('connected');
      haptics.success();
    }, 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pulse, reduce]);

  useEffect(() => {
    if (phase !== 'connected') {
      return;
    }
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const end = () => {
    setPhase('ended');
    haptics.warning();
    addSystemMessage(matchId, `${video ? '📹 Video' : '📞 Audio'} call · ${phase === 'connected' ? formatDuration(seconds) : 'not answered'}`);
    setTimeout(() => navigation.goBack(), 500);
  };

  const ringStyle = useAnimatedStyle(() => ({ opacity: 0.6 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 0.5 }] }));

  if (!partner) {
    return null;
  }

  const statusText =
    phase === 'calling' ? 'Calling…' : phase === 'ringing' ? 'Ringing…' : phase === 'ended' ? 'Call ended' : formatDuration(seconds);
  const showVideo = video && phase === 'connected';

  return (
    <View style={styles.flex}>
      {showVideo ? (
        <SmartImage uri={partner.photos[0]} name={partner.name} style={StyleSheet.absoluteFill} />
      ) : (
        <>
          <SmartImage uri={partner.photos[0]} name={partner.name} style={StyleSheet.absoluteFill} blurRadius={40} />
          <GradientView name="romance" style={[StyleSheet.absoluteFill, styles.tint]} />
        </>
      )}
      <GradientView name="cardOverlay" style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex}>
        <View style={styles.top}>
          <View style={styles.secure}>
            <Icon name="lock" size={12} color="rgba(255,255,255,0.85)" />
            <Text variant="micro" color="rgba(255,255,255,0.85)">
              End-to-end encrypted · your number stays private
            </Text>
          </View>
        </View>

        {!showVideo ? (
          <View style={styles.center}>
            <View style={styles.avatarWrap}>
              {phase !== 'connected' ? <Animated.View style={[styles.ring, ringStyle]} /> : null}
              <SmartImage uri={partner.photos[0]} name={partner.name} style={styles.avatar} />
            </View>
            <Text variant="h1" color="#fff">
              {partner.name}
            </Text>
            <Animated.View key={phase} entering={FadeIn}>
              <Text variant="bodyMedium" color="rgba(255,255,255,0.85)">
                {statusText}
              </Text>
            </Animated.View>
          </View>
        ) : (
          <View style={styles.videoTop}>
            <Text variant="title" color="#fff">
              {partner.name}
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.85)">
              {statusText}
            </Text>
          </View>
        )}

        {video && camOn ? (
          <View style={styles.selfView}>
            <SmartImage uri={user.photos[0]} name={user.name} style={StyleSheet.absoluteFill} />
          </View>
        ) : null}

        <View style={styles.controls}>
          <Control icon={muted ? 'micOff' : 'mic'} label={muted ? 'Unmute' : 'Mute'} active={muted} onPress={() => setMuted(m => !m)} />
          {video ? (
            <Control icon="video" label={camOn ? 'Camera off' : 'Camera on'} active={!camOn} onPress={() => setCamOn(c => !c)} />
          ) : null}
          <Control icon="volume" label="Speaker" active={speaker} onPress={() => setSpeaker(s => !s)} />
          {video ? <Control icon="refresh" label="Flip" onPress={() => haptics.light()} /> : null}
          <Control icon="phone" label="End" danger onPress={end} />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#120C18' },
  tint: { opacity: 0.75 },
  top: { alignItems: 'center', paddingTop: 8 },
  secure: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.25)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  avatarWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  ring: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.4)' },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#fff' },
  videoTop: { flex: 1, alignItems: 'center', paddingTop: 16 },
  selfView: { position: 'absolute', right: 16, top: 110, width: 110, height: 160, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 18, paddingBottom: 24, paddingHorizontal: 16, flexWrap: 'wrap' },
  control: { alignItems: 'center', gap: 6 },
  ctrlBtn: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  hangup: { transform: [{ rotate: '135deg' }] },
});
