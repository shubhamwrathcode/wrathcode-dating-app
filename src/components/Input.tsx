import React, { forwardRef, useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputInstance, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '@/core/theme';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<TextInputInstance, InputProps>(
  ({ label, error, hint, left, right, containerStyle, style, onFocus, onBlur, ...rest }, ref) => {
    const { colors, typography } = useTheme();
    const [focused, setFocused] = useState(false);
    const borderColor = error ? colors.error : focused ? colors.primary : colors.border;

    return (
      <View style={containerStyle}>
        {label ? (
          <Text variant="captionMedium" muted style={styles.label}>
            {label}
          </Text>
        ) : null}
        <View style={[styles.box, { borderColor, backgroundColor: colors.surface }]}>
          {left}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.textSecondary}
            selectionColor={colors.primary}
            {...rest}
            onFocus={e => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={e => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[{ fontFamily: typography.body.fontFamily, fontSize: 14 }, styles.input, { color: colors.textPrimary, includeFontPadding: false }, style]}
          />
          {right}
        </View>
        {error ? (
          <Text variant="caption" color={colors.error} style={styles.below}>
            {error}
          </Text>
        ) : hint ? (
          <Text variant="caption" muted style={styles.below}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  label: { marginBottom: 8, marginLeft: 4 },
  box: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 16, minHeight: 52, gap: 10,
  },
  input: { flex: 1, paddingVertical: 14 },
  below: { marginTop: 6, marginLeft: 4 },
});
