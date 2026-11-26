import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Button, IconButton, ProgressBar, Screen, Text } from '@/components';
import { useT } from '@/core/i18n';

interface Props {
  title: string;
  subtitle?: string;
  progress: number;
  children: React.ReactNode;
  canContinue: boolean;
  onContinue: () => void;
  ctaLabel?: string;
  onSkip?: () => void;
  footerNote?: string;
  scroll?: boolean;
  loading?: boolean;
  back?: boolean;
  /** false = content appears instantly, no entering animation. */
  animate?: boolean;
  animated?: boolean;
}

/** Step chrome: gradient progress, parallax-in title, sticky continue button. */
export const OnboardingLayout = ({
  title, subtitle, progress, children, canContinue, onContinue, ctaLabel, onSkip, footerNote, scroll = true, loading, back = true, animate, animated = true,
}: Props) => {
  const shouldAnimate = animate !== undefined ? animate : animated;
  const nav = useNavigation();
  const t = useT();
  const Body = scroll ? ScrollView : View;
  const fade = shouldAnimate ? FadeIn.duration(200) : undefined;

  return (
    <Screen keyboard background="soft">
      <View style={styles.top}>
        {back && nav.canGoBack() ? (
          <IconButton icon="chevronLeft" onPress={() => nav.goBack()} accessibilityLabel="Back" />
        ) : (
          <View style={styles.spacer} />
        )}
        <View style={styles.progress}>
          <ProgressBar progress={progress} />
        </View>
        {onSkip ? (
          <Button title={t('common.skip')} variant="ghost" size="sm" onPress={onSkip} />
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
      <Body style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {shouldAnimate ? (
          <Animated.View entering={fade}>
            <Text variant="h1">{title}</Text>
            {subtitle ? (
              <Text muted style={styles.subtitle}>
                {subtitle}
              </Text>
            ) : null}
          </Animated.View>
        ) : (
          <View>
            <Text variant="h1">{title}</Text>
            {subtitle ? (
              <Text muted style={styles.subtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}
        {shouldAnimate ? (
          <Animated.View entering={fade} style={styles.children}>
            {children}
          </Animated.View>
        ) : (
          <View style={styles.children}>
            {children}
          </View>
        )}
      </Body>
      <View style={styles.footer}>
        {footerNote ? (
          <Text variant="caption" muted center style={styles.note}>
            {footerNote}
          </Text>
        ) : null}
        <Button title={ctaLabel ?? t('common.continue')} onPress={onContinue} disabled={!canContinue} loading={loading} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 8 },
  progress: { flex: 1 },
  spacer: { width: 44 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  subtitle: { marginTop: 8 },
  children: { marginTop: 24 },
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  note: { marginBottom: 10 },
});
