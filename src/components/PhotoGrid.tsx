import React, { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn, runOnJS, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { PHOTOS_MAX } from '@/core/constants';
import { haptics } from '@/core/services/haptics';
import { mediaPicker } from '@/core/services/mediaPicker';
import { useTheme } from '@/core/theme';
import { gradients } from '@/core/theme/gradients';
import { BottomSheet } from './BottomSheet';
import { GradientView } from './GradientView';
import { Icon } from './Icon';
import { ScalePressable } from './ScalePressable';
import { SmartImage } from './SmartImage';
import { Text } from './Text';

const COLS = 3;
const GAP = 10;

/** Tile size from the live window width, so it stays correct after rotation / resize. */
const useTileSize = () => {
  const { width } = useWindowDimensions();
  const w = (width - 40 - GAP * (COLS - 1)) / COLS;
  return { w, h: w * 1.3 };
};

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  gallery: string[];
  /** false = tiles appear instantly with no zoom/press animation. */
  animated?: boolean;
}

const Tile = ({
  uri, index, count, onRemove, onMove, animated,
}: { uri: string; index: number; count: number; onRemove: () => void; onMove: (from: number, to: number) => void; animated: boolean }) => {
  const { colors } = useTheme();
  const { w: TILE_W, h: TILE_H } = useTileSize();
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lifted = useSharedValue(0);

  const startX = (index % COLS) * (TILE_W + GAP);
  const startY = Math.floor(index / COLS) * (TILE_H + GAP);

  const pan = Gesture.Pan()
    .activateAfterLongPress(220)
    .onStart(() => {
      lifted.value = withTiming(1, { duration: 150 });
      runOnJS(haptics.medium)();
    })
    .onUpdate(e => {
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd(() => {
      const col = Math.max(0, Math.min(COLS - 1, Math.round((startX + tx.value) / (TILE_W + GAP))));
      const row = Math.max(0, Math.round((startY + ty.value) / (TILE_H + GAP)));
      const target = Math.max(0, Math.min(count - 1, row * COLS + col));
      tx.value = 0;
      ty.value = 0;
      lifted.value = withTiming(0, { duration: 150 });
      if (target !== index) {
        runOnJS(onMove)(index, target);
      }
    })
    .onFinalize(() => {
      lifted.value = withTiming(0, { duration: 150 });
    });

  const style = useAnimatedStyle(() => ({
    zIndex: lifted.value > 0.01 ? 10 : 1,
    shadowOpacity: lifted.value * 0.3,
    elevation: lifted.value * 12,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: 1 + lifted.value * 0.07 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View entering={animated ? FadeIn.duration(200) : undefined} style={[styles.tile, { width: TILE_W, height: TILE_H }, styles.shadow, style]}>
        <SmartImage uri={uri} style={StyleSheet.absoluteFill} />
        {index === 0 ? (
          <GradientView name="primary" style={styles.mainTag}>
            <Text variant="micro" color="#fff">
              Main
            </Text>
          </GradientView>
        ) : null}
        <ScalePressable onPress={onRemove} hitSlop={8} style={[styles.remove, { backgroundColor: colors.surface }]} accessibilityLabel="Remove photo">
          <Icon name="x" size={14} color={colors.textPrimary} strokeWidth={2.5} />
        </ScalePressable>
      </Animated.View>
    </GestureDetector>
  );
};

/** Gradient "+" badge drawn fully in SVG with padding, so no rounded-clip edge cuts the circle. */
const PLUS_SIZE = 40;
const PlusBadge = () => {
  const g = gradients.primary;
  const cx = PLUS_SIZE / 2; // 20
  const cy = PLUS_SIZE / 2; // 20
  const r = 18; // radius 18 => diameter 36 with 2px padding inside 40x40 canvas
  return (
    <Svg width={PLUS_SIZE} height={PLUS_SIZE} viewBox={`0 0 ${PLUS_SIZE} ${PLUS_SIZE}`}>
      <Defs>
        <LinearGradient id="photoPlusGrad" x1="0" y1="0" x2="1" y2="1">
          {g.colors.map((c, i) => (
            <Stop key={c + i} offset={g.locations ? g.locations[i] : i / (g.colors.length - 1)} stopColor={c} />
          ))}
        </LinearGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill="url(#photoPlusGrad)" />
      <Path d={`M${cx} ${cy - 7}v14M${cx - 7} ${cy}h14`} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
};

/** 2–6 photo grid: long-press + drag to reorder, demo gallery picker. */
export const PhotoGrid = ({ photos, onChange, gallery, animated = true }: Props) => {
  const { colors } = useTheme();
  const { w: tileW, h: tileH } = useTileSize();
  const [picker, setPicker] = useState(false);

  const slotsLeft = PHOTOS_MAX - photos.length;

  const addUris = (uris: string[]) => {
    const fresh = uris.filter(u => !photos.includes(u)).slice(0, slotsLeft);
    if (fresh.length) {
      haptics.light();
      onChange([...photos, ...fresh]);
    }
  };

  /** Close the sheet first: iOS can't present the camera/library on top of an open Modal. */
  const fromSource = (source: 'camera' | 'gallery') => {
    setPicker(false);
    setTimeout(async () => {
      const uris = source === 'camera' ? await mediaPicker.takePhoto('front') : await mediaPicker.pickFromGallery(slotsLeft);
      addUris(uris);
    }, 350);
  };

  const move = (from: number, to: number) => {
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    haptics.light();
    onChange(next);
  };

  return (
    <View>
      <View style={styles.grid}>
        {Array.from({ length: PHOTOS_MAX }).map((_, i) => {
          const uri = photos[i];
          if (uri) {
            return (
              <Tile
                key={uri}
                uri={uri}
                index={i}
                count={photos.length}
                onRemove={() => onChange(photos.filter(p => p !== uri))}
                onMove={move}
                animated={animated}
              />
            );
          }
          return (
            <ScalePressable
              key={`empty_${i}`}
              onPress={() => setPicker(true)}
              haptic
              scaleTo={animated ? 0.96 : 1}
              accessibilityLabel="Add photo"
              style={[styles.tile, styles.empty, { width: tileW, height: tileH, borderColor: colors.primary + '55', backgroundColor: colors.primarySoft }]}>
              <PlusBadge />
            </ScalePressable>
          );
        })}
      </View>
      <Text variant="caption" muted style={styles.hint}>
        Long-press and drag to reorder. Your first photo is your main photo.
      </Text>

      <BottomSheet visible={picker} onClose={() => setPicker(false)} title="Add a photo" subtitle="Take a selfie or pick one from your gallery" scroll>
        <View style={styles.sources}>
          <ScalePressable
            onPress={() => fromSource('camera')}
            haptic
            accessibilityLabel="Take a photo with the camera"
            style={[styles.source, { backgroundColor: colors.primarySoft, borderColor: colors.primary + '33' }]}>
            <Icon name="camera" size={26} gradient="primary" />
            <Text variant="body" style={styles.sourceLabel}>
              Take a photo
            </Text>
          </ScalePressable>
          <ScalePressable
            onPress={() => fromSource('gallery')}
            haptic
            accessibilityLabel="Choose photos from the gallery"
            style={[styles.source, { backgroundColor: colors.primarySoft, borderColor: colors.primary + '33' }]}>
            <Icon name="image" size={26} gradient="primary" />
            <Text variant="body" style={styles.sourceLabel}>
              Choose from gallery
            </Text>
          </ScalePressable>
        </View>

        <Text variant="caption" muted style={styles.sampleTitle}>
          Or use a sample photo
        </Text>
        <View style={styles.galleryGrid}>
          {gallery.map(uri => {
            const used = photos.includes(uri);
            return (
              <ScalePressable
                key={uri}
                disabled={used || photos.length >= PHOTOS_MAX}
                onPress={() => {
                  onChange([...photos, uri]);
                  setPicker(false);
                }}
                style={[styles.galleryItem, { opacity: used ? 0.35 : 1 }]}>
                <SmartImage uri={uri} style={StyleSheet.absoluteFill} />
                {used ? (
                  <View style={styles.usedMark}>
                    <Icon name="check" size={20} color="#fff" strokeWidth={3} />
                  </View>
                ) : null}
              </ScalePressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: { borderRadius: 18, overflow: 'hidden' },
  shadow: { shadowColor: '#7C03B2', shadowOffset: { width: 0, height: 10 }, shadowRadius: 16 },
  empty: { borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  mainTag: { position: 'absolute', left: 8, bottom: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  remove: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  hint: { marginTop: 12 },
  sources: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  source: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderRadius: 18, borderWidth: 1 },
  sourceLabel: { marginTop: 8, fontWeight: '600' },
  sampleTitle: { marginBottom: 10 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  galleryItem: { width: '31.5%', aspectRatio: 0.8, borderRadius: 14, overflow: 'hidden' },
  usedMark: { ...(StyleSheet.absoluteFill as any), alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
});
