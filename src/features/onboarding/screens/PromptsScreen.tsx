import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheet, Button, Icon, Input, ScalePressable, Text } from '@/components';
import { PROMPT_QUESTIONS, PROMPTS_REQUIRED } from '@/core/constants';
import { useTheme } from '@/core/theme';
import { ProfilePrompt } from '@/data/models';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingViewModel } from '../viewmodels/useOnboardingViewModel';

const MAX_ANSWER = 150;

/** Reusable prompt editor (also used in Edit profile). */
export const PromptEditor = ({ prompts, onChange }: { prompts: ProfilePrompt[]; onChange: (p: ProfilePrompt[]) => void }) => {
  const { colors } = useTheme();
  const [slot, setSlot] = useState<number | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');

  const open = (i: number) => {
    setSlot(i);
    setQuestion(prompts[i]?.question ?? null);
    setAnswer(prompts[i]?.answer ?? '');
  };
  const close = () => {
    setSlot(null);
    setQuestion(null);
  };
  const save = () => {
    if (slot === null || !question || answer.trim().length < 3) {
      return;
    }
    const next = [...prompts];
    next[slot] = { question, answer: answer.trim() };
    onChange(next.filter(Boolean));
    close();
  };

  const used = prompts.map(p => p.question);

  return (
    <View style={styles.list}>
      {Array.from({ length: PROMPTS_REQUIRED }).map((_, i) => {
        const p = prompts[i];
        return (
          <ScalePressable
            key={i}
            onPress={() => open(Math.min(i, prompts.length))}
            haptic
            style={[
              styles.slot,
              { backgroundColor: colors.surface, borderColor: p ? colors.border : colors.primary + '66', borderStyle: p ? 'solid' : 'dashed' },
            ]}>
            {p ? (
              <View style={styles.flex}>
                <Text variant="captionMedium" color={colors.primary}>
                  {p.question}
                </Text>
                <Text variant="bodyMedium" style={styles.answer}>
                  {p.answer}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyRow}>
                <Icon name="plus" size={18} color={colors.primary} />
                <Text variant="bodyMedium" color={colors.primary}>
                  Select a prompt
                </Text>
              </View>
            )}
            {p ? <Icon name="edit" size={18} color={colors.textSecondary} /> : null}
          </ScalePressable>
        );
      })}

      <BottomSheet
        visible={slot !== null}
        onClose={close}
        title={question ? 'Write your answer' : 'Pick a prompt'}
        scroll
        footer={question ? <Button title="Save answer" onPress={save} disabled={answer.trim().length < 3} /> : undefined}>
        {question ? (
          <View style={styles.gap}>
            <Text variant="title" color={colors.primary}>
              {question}
            </Text>
            <Input
              value={answer}
              onChangeText={t => setAnswer(t.slice(0, MAX_ANSWER))}
              placeholder="Be specific — it makes for better conversations"
              multiline
              autoFocus
              style={styles.multiline}
              hint={`${answer.length}/${MAX_ANSWER}`}
            />
            <Button title="Choose a different prompt" variant="ghost" size="sm" onPress={() => setQuestion(null)} />
          </View>
        ) : (
          <View>
            {PROMPT_QUESTIONS.map(q => {
              const taken = used.includes(q) && prompts[slot ?? -1]?.question !== q;
              return (
                <ScalePressable
                  key={q}
                  disabled={taken}
                  onPress={() => setQuestion(q)}
                  style={[styles.qRow, { borderBottomColor: colors.border, opacity: taken ? 0.35 : 1 }]}>
                  <Text variant="bodyMedium">{q}</Text>
                  <Icon name="chevronRight" size={18} color={colors.textSecondary} />
                </ScalePressable>
              );
            })}
          </View>
        )}
      </BottomSheet>
    </View>
  );
};

export const PromptsScreen = () => {
  const vm = useOnboardingViewModel('OnbPrompts');
  const [prompts, setPrompts] = useState<ProfilePrompt[]>(vm.draft.prompts ?? []);

  return (
    <OnboardingLayout
      title="Show your personality"
      subtitle="Answer 3 prompts. They’re the #1 conversation starter on DilSe."
      progress={vm.progress}
      canContinue={prompts.length >= PROMPTS_REQUIRED}
      footerNote={`${prompts.length}/${PROMPTS_REQUIRED} answered`}
      onContinue={() => vm.next({ prompts })}>
      <PromptEditor prompts={prompts} onChange={setPrompts} />
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  list: { gap: 12 },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 20, borderWidth: 1.5, minHeight: 84 },
  flex: { flex: 1 },
  answer: { marginTop: 6 },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  gap: { gap: 16 },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  qRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
});
