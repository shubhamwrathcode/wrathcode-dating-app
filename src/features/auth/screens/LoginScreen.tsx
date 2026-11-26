import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button, Chip, Header, Input, Screen, Text } from '@/components';
import { useT } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

export const LoginScreen = () => {
  const vm = useLoginViewModel();
  const t = useT();
  const { colors } = useTheme();

  return (
    <Screen keyboard scroll background="soft">
      <Header />
      <View style={styles.body}>
        <Animated.View entering={FadeIn.duration(350)}>
          <Text variant="h1">{t('login.title')}</Text>
          <Text muted style={styles.sub}>
            {t('login.subtitle')}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(80).duration(350)}>
          <Input
            value={vm.phone}
            onChangeText={vm.setPhone}
            keyboardType="phone-pad"
            placeholder="98765 43210"
            autoFocus
            maxLength={10}
            error={vm.error}
            textContentType="telephoneNumber"
            autoComplete="tel"
            left={
              <View style={[styles.cc, { borderRightColor: colors.border }]}>
                <Text variant="bodyMedium">🇮🇳 +91</Text>
              </View>
            }
            onSubmitEditing={vm.sendCode}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(140).duration(350)} style={styles.demo}>
          <Text variant="caption" muted>
            Demo logins (OTP 123456):
          </Text>
          <View style={styles.demoRow}>
            <Chip size="sm" label="Aarav · 99999 00001" onPress={() => vm.fillDemo('9999900001')} />
            <Chip size="sm" label="Sara · 99999 00002" onPress={() => vm.fillDemo('9999900002')} />
          </View>
        </Animated.View>

        <Button title={t('login.sendCode')} onPress={vm.sendCode} loading={vm.loading === 'otp'} disabled={!vm.isValid} style={styles.cta} />

        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text variant="caption" muted>
            or continue with
          </Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.socials}>
          <Button title="Google" icon="google" variant="surface" onPress={() => vm.social('google')} loading={vm.loading === 'google'} style={styles.flex} />
          <Button title="Apple" icon="apple" variant="surface" onPress={() => vm.social('apple')} loading={vm.loading === 'apple'} style={styles.flex} />
        </View>

        <Text variant="micro" muted center style={styles.terms}>
          By continuing you agree to our Terms and Privacy Policy. You must be 18+ to use DilSe.
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 20 },
  sub: { marginTop: 8 },
  cc: { paddingRight: 10, borderRightWidth: 1, marginRight: 2 },
  demo: { gap: 8 },
  demoRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  cta: { marginTop: 4 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  socials: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  terms: { marginTop: 8 },
});
