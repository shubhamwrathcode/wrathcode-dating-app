import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputInstance, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Button, Header, Screen, Text } from '@/components';
import { useT } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { formatPhone } from '@/core/utils';
import { RootScreenProps } from '@/navigation/types';
import { OTP_LENGTH, useOtpViewModel } from '../viewmodels/useOtpViewModel';

export const OtpScreen = ({ route }: RootScreenProps<'Otp'>) => {
  const { phone } = route.params;
  const { colors, typography } = useTheme();
  const t = useT();
  const inputRef = useRef<TextInputInstance>(null);
  const shake = useSharedValue(0);

  const onError = useCallback(() => {
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(0, { duration: 50 }),
    );
  }, [shake]);

  const vm = useOtpViewModel(phone, onError);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  return (
    <Screen keyboard background="soft">
      <Header />
      <View style={styles.body}>
        <Text variant="h1">{t('otp.title')}</Text>
        <Text muted style={styles.sub}>
          Sent to {formatPhone(phone)}. Demo code: <Text variant="bodyMedium" color={colors.primary}>123456</Text>
        </Text>

        <Pressable onPress={() => inputRef.current?.focus()} accessibilityLabel="OTP input">
          <Animated.View style={[styles.boxes, shakeStyle]}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => {
              const char = vm.code[i];
              const active = i === vm.code.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.box,
                    {
                      backgroundColor: colors.surface,
                      borderColor: vm.error ? colors.error : active || char ? colors.primary : colors.border,
                    },
                  ]}>
                  <Text style={typography.h2}>{char ?? ''}</Text>
                </View>
              );
            })}
          </Animated.View>
        </Pressable>
        <TextInput
          ref={inputRef}
          value={vm.code}
          onChangeText={vm.setCode}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          style={styles.hidden}
        />
        {vm.error ? (
          <Text variant="caption" color={colors.error}>
            {vm.error}
          </Text>
        ) : null}

        <Pressable onPress={vm.resend} disabled={vm.resendIn > 0}>
          <Text variant="captionMedium" color={vm.resendIn > 0 ? colors.textSecondary : colors.primary}>
            {vm.resendIn > 0 ? `Resend code in 0:${vm.resendIn.toString().padStart(2, '0')}` : 'Resend code'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Button
          title={t('otp.verify')}
          onPress={() => vm.verify(vm.code)}
          loading={vm.verifying}
          disabled={vm.code.length !== OTP_LENGTH}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 20, gap: 20 },
  sub: { marginTop: -8 },
  boxes: { flexDirection: 'row', justifyContent: 'space-between' },
  box: { width: 50, height: 60, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  hidden: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  footer: { paddingHorizontal: 20, paddingVertical: 16 },
});
