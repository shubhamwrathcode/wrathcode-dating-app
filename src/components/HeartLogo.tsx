import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/**
 * DilSe brand mark — white heart, heartbeat line ("dil se" = from the heart) and a sparkle.
 * Same geometry as assets/brand/*.svg, the Android adaptive icon and the iOS launch image
 * (108-unit canvas, content in the centre ~60%), so the native splash hands over seamlessly.
 */
const HEART = 'M50 86 C22 66 6 50 6 31 C6 17 17 7 30 7 C39 7 46 12 50 19 C54 12 61 7 70 7 C83 7 94 17 94 31 C94 50 78 66 50 86 Z';
const PULSE = 'M17 44 H35 L41 31 L50 60 L58 36 L63 44 H83';
const SPARK = 'M77 26 C77.6 29.6 78.4 30.4 82 31 C78.4 31.6 77.6 32.4 77 36 C76.4 32.4 75.6 31.6 72 31 C75.6 30.4 76.4 29.6 77 26 Z';

interface Props {
  /** Canvas size; the heart is ~50% of it. */
  size?: number;
  /** true = draw the purple gradient tile behind the mark (app-icon look). */
  tile?: boolean;
  /** Kept for API compatibility: fires right away (the mark is static, no draw-in animation). */
  animate?: boolean;
  onDone?: () => void;
}

export const HeartLogo = ({ size = 120, tile = false, onDone }: Props) => {
  useEffect(() => {
    onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ width: size, height: size, borderRadius: tile ? size * 0.28 : 0, overflow: 'hidden' }}>
      <Svg width={size} height={size} viewBox="0 0 108 108">
        <Defs>
          <LinearGradient id="dsPulse" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#7C03B2" />
            <Stop offset="1" stopColor="#DE24F8" />
          </LinearGradient>
          <LinearGradient id="dsTile" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#320066" />
            <Stop offset="0.55" stopColor="#7C03B2" />
            <Stop offset="1" stopColor="#DE24F8" />
          </LinearGradient>
        </Defs>
        {tile ? <Rect width={108} height={108} fill="url(#dsTile)" /> : null}
        <G transform="translate(23 25.5) scale(0.62)">
          <Path d={HEART} fill="#FFFFFF" />
          <Path d={PULSE} fill="none" stroke="url(#dsPulse)" strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" />
        </G>
        <Path d={SPARK} fill="#FFFFFF" />
        <Circle cx={70.5} cy={23.5} r={1.3} fill="#FFFFFF" fillOpacity={0.8} />
      </Svg>
    </View>
  );
};
