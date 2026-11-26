import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GradientView, Icon, ScalePressable, Text } from '@/components';
import { INTENTS } from '@/core/constants';
import { useTheme } from '@/core/theme';
import { Intent } from '@/data/models';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingViewModel } from '../viewmodels/useOnboardingViewModel';

export const IntentScreen = () => {
  const vm = useOnboardingViewModel('OnbIntent');
  const { colors, shadowSoft } = useTheme();
  const [intent, setIntent] = useState<Intent | undefined>(vm.draft.intent);

  return (
    <OnboardingLayout
      title="What are you looking for?"
      subtitle="Your intent is shown on your profile, so everyone’s on the same page. No more guessing."
      progress={vm.progress}
      canContinue={!!intent}
      onContinue={() => vm.next({ intent })}>
      <View style={styles.list}>
        {INTENTS.map(item => {
          const selected = intent === item.id;
          const inner = (
            <View style={styles.row}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.flex}>
                <Text variant="title" color={selected ? '#fff' : colors.textPrimary}>
                  {item.label}
                </Text>
                <Text variant="caption" color={selected ? 'rgba(255,255,255,0.85)' : colors.textSecondary}>
                  {item.description}
                </Text>
              </View>
              <View style={[styles.radio, { borderColor: selected ? '#fff' : colors.border }]}>
                {selected ? <Icon name="check" size={14} color="#fff" strokeWidth={3} /> : null}
              </View>
            </View>
          );
          return (
            <Animated.View key={item.id} entering={FadeIn.duration(200)}>
              <ScalePressable
                haptic
                onPress={() => setIntent(item.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={selected ? shadowSoft : null}>
                {selected ? (
                  <GradientView name="primary" style={styles.card}>
                    {inner}
                  </GradientView>
                ) : (
                  <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>{inner}</View>
                )}
              </ScalePressable>
            </Animated.View>
          );
        })}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  list: { gap: 14 },
  card: { borderRadius: 22, padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emoji: { fontSize: 26 },
  flex: { flex: 1, gap: 2 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
