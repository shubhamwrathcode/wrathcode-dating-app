import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { OnboardingDraft, useSessionStore } from '@/store/useSessionStore';

export const ONBOARDING_STEPS = [
  'OnbName', 'OnbGender', 'OnbIntent', 'OnbPhotos', 'OnbInterests', 'OnbPrompts',
  'OnbLifestyle', 'OnbVoice', 'OnbLocation', 'OnbVerify', 'OnbAllSet',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** Shared state + step navigation for the onboarding flow. */
export const useOnboardingViewModel = (step: OnboardingStep) => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const draft = useSessionStore(s => s.draft);
  const updateDraft = useSessionStore(s => s.updateDraft);

  const index = ONBOARDING_STEPS.indexOf(step);
  const progress = (index + 1) / ONBOARDING_STEPS.length;

  const next = useCallback(
    (patch?: OnboardingDraft) => {
      if (patch) {
        updateDraft(patch);
      }
      const nextStep = ONBOARDING_STEPS[index + 1];
      if (nextStep) {
        nav.navigate(nextStep);
      }
    },
    [index, nav, updateDraft],
  );

  return { draft, update: updateDraft, next, progress, stepNumber: index + 1, total: ONBOARDING_STEPS.length };
};
