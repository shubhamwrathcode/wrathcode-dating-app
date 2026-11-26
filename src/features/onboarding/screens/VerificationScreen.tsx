import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing, FadeIn, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { GradientView, Icon, SmartImage, Text } from '@/components';
import { haptics } from '@/core/services/haptics';
import { useTheme } from '@/core/theme';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingViewModel } from '../viewmodels/useOnboardingViewModel';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const STEPS = ['Look straight at the camera', 'Slowly turn your head left', 'Now turn right', 'Give us a smile 😊'];
type Phase = 'idle' | 'scanning' | 'done';

/** Animated check that draws itself (600ms). */
const DrawnTick = () => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [t]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: 40 * (1 - t.value) }));
  return (
    <Svg width={84} height={84} viewBox="0 0 48 48">
      <Circle cx={24} cy={24} r={22} fill="#3BA8FF" />
      <AnimatedPath d="M14 25 l7 7 l13 -14" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40 40" animatedProps={props} />
    </Svg>
  );
};

export const VerificationScreen = () => {
  const vm = useOnboardingViewModel('OnbVerify');
  const { colors } = useTheme();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(vm.draft.verified ? 'done' : 'idle');
  const [step, setStep] = useState(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (phase !== 'scanning') {
      return;
    }
    if (!reduce) {
      spin.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false);
    }
    // Stand-in for a liveness SDK / AWS Rekognition face-liveness session
    const timers = STEPS.map((_, i) => setTimeout(() => setStep(i), i * 900));
    const done = setTimeout(() => {
      setPhase('done');
      haptics.success();
    }, STEPS.length * 900 + 300);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [phase, reduce, spin]);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));

  return (
    <OnboardingLayout
      title={phase === 'done' ? 'You’re verified!' : 'Get your blue tick'}
      subtitle={
        phase === 'done'
          ? 'Your profile now shows the verified badge. Verified profiles get up to 40% more matches.'
          : 'A quick selfie check confirms you’re real. Your selfie is never shown on your profile.'
      }
      progress={vm.progress}
      ctaLabel={phase === 'idle' ? 'Start verification' : 'Continue'}
      canContinue={phase !== 'scanning'}
      onSkip={phase === 'done' ? undefined : () => vm.next({ verified: false })}
      onContinue={() => (phase === 'idle' ? setPhase('scanning') : vm.next({ verified: true }))}>
      <View style={styles.center}>
        <View style={styles.frame}>
          {phase === 'scanning' ? (
            <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
              <GradientView name="primary" style={styles.ring} />
            </Animated.View>
          ) : null}
          <View style={[styles.face, { backgroundColor: colors.primarySoft, borderColor: phase === 'done' ? '#3BA8FF' : colors.surface }]}>
            {vm.draft.photos?.[0] ? (
              <SmartImage uri={vm.draft.photos[0]} style={StyleSheet.absoluteFill} />
            ) : (
              <Icon name="scan" size={72} color={colors.primary} strokeWidth={1.2} />
            )}
          </View>
          {phase === 'done' ? (
            <Animated.View entering={FadeIn.duration(250)} style={styles.tick}>
              <DrawnTick />
            </Animated.View>
          ) : null}
        </View>
        {phase === 'scanning' ? (
          <Animated.View key={step} entering={FadeIn.duration(250)}>
            <Text variant="title" center>
              {STEPS[step]}
            </Text>
            <Text variant="caption" muted center style={styles.sub}>
              Step {step + 1} of {STEPS.length}
            </Text>
          </Animated.View>
        ) : phase === 'idle' ? (
          <View style={styles.tips}>
            {['Good lighting on your face', 'Remove sunglasses or masks', 'Takes about 5 seconds'].map(tip => (
              <View key={tip} style={styles.tipRow}>
                <Icon name="check" size={16} color={colors.success} strokeWidth={2.5} />
                <Text variant="caption">{tip}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 28 },
  frame: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  ring: { flex: 1, borderRadius: 120, opacity: 0.9 },
  face: { width: 224, height: 224, borderRadius: 112, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 6 },
  tick: { position: 'absolute', bottom: -6, right: 6 },
  sub: { marginTop: 4 },
  tips: { gap: 10, alignSelf: 'stretch' },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
