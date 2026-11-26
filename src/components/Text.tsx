import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { fontForWeight, TypographyVariant, useTheme } from '@/core/theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  muted?: boolean;
  center?: boolean;
  /** Picks the matching Poppins file (Regular / Medium / Bold). */
  weight?: TextStyle['fontWeight'];
}

export const Text = ({ variant = 'body', color, muted, center, weight, style, ...rest }: TextProps) => {
  const { typography, colors } = useTheme();
  return (
    <RNText
      maxFontSizeMultiplier={1.3}
      {...rest}
      style={[
        typography[variant],
        { color: color ?? (muted ? colors.textSecondary : colors.textPrimary), includeFontPadding: false },
        center && { textAlign: 'center' },
        weight ? { fontFamily: fontForWeight(weight) } : null,
        style,
      ]}
    />
  );
};
