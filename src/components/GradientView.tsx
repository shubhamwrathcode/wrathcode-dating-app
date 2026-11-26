import React, { useId, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { gradients, GradientName } from '@/core/theme/gradients';

interface StopDef {
  color: string;
  opacity: number;
  offset: number;
}

/** Splits rgba() so every SVG renderer gets a plain colour + stopOpacity. */
const parseColor = (c: string): { color: string; opacity: number } => {
  const m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(c);
  if (!m) {
    return { color: c, opacity: 1 };
  }
  return { color: `rgb(${m[1]},${m[2]},${m[3]})`, opacity: m[4] !== undefined ? Number(m[4]) : 1 };
};

/** CSS angle (0° = to top, 90° = to right) → objectBoundingBox vector. */
const angleToVector = (deg: number) => {
  const rad = (deg * Math.PI) / 180;
  const sx = Math.sin(rad) / 2;
  const sy = Math.cos(rad) / 2;
  return { x1: 0.5 - sx, y1: 0.5 + sy, x2: 0.5 + sx, y2: 0.5 - sy };
};

export const buildStops = (colors: string[], locations?: number[]): StopDef[] =>
  colors.map((c, i) => ({ ...parseColor(c), offset: locations?.[i] ?? i / Math.max(1, colors.length - 1) }));

interface GradientFillProps {
  colors: string[];
  locations?: number[];
  angle: number;
}

/**
 * Absolute-fill SVG gradient layer. Measures its box and draws in pixels:
 * percentage sizes on Svg are unreliable on Fabric and left gaps at the edges.
 */
export const GradientFill = ({ colors, locations, angle }: GradientFillProps) => {
  const rawId = useId();
  const id = `lg${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const v = angleToVector(angle);
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        if (Math.abs(width - size.w) > 0.5 || Math.abs(height - size.h) > 0.5) {
          setSize({ w: width, h: height });
        }
      }}>
      {size.w > 0 && size.h > 0 ? (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id={id} x1={v.x1} y1={v.y1} x2={v.x2} y2={v.y2}>
              {buildStops(colors, locations).map((s, i) => (
                <Stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={size.w} height={size.h} fill={`url(#${id})`} />
        </Svg>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[0] }]} />
      )}
    </View>
  );
};

interface Props {
  name: GradientName;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  angle?: number;
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
}

/** Design-token gradient. Only for primary actions and hero moments. */
export const GradientView = ({ name, style, children, angle, pointerEvents }: Props) => {
  const g = gradients[name];
  return (
    <View style={[styles.clip, style]} pointerEvents={pointerEvents}>
      <GradientFill colors={g.colors} locations={'locations' in g ? g.locations : undefined} angle={angle ?? g.angle} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({ clip: { overflow: 'hidden' } });
