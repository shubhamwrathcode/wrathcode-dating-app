import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  Chip, GlassChip, GradientView, Icon, IconName, IntentBadge, MatchRing, OnlineDot, ScalePressable, SmartImage, Text, VerifiedTick, Waveform,
} from '@/components';
import { usePlayback } from '@/core/hooks';
import { useTheme } from '@/core/theme';
import { calcAge, formatDuration, formatHeight } from '@/core/utils';
import { CompatibilityResult, Profile } from '@/data/models';

const { width: W } = Dimensions.get('window');
const PHOTO_H = W * 1.25;

const PhotoCarousel = ({ photos, name, blur }: { photos: string[]; name: string; blur?: number }) => {
  const [index, setIndex] = useState(0);
  return (
    <View style={{ width: W, height: PHOTO_H }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / W))}>
        {photos.map((p, i) => (
          <SmartImage key={p + i} uri={p} name={name} blurRadius={blur} style={{ width: W, height: PHOTO_H }} />
        ))}
      </ScrollView>
      <GradientView name="cardOverlay" style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={styles.indicators} pointerEvents="none">
        {photos.map((p, i) => (
          <View key={p + i} style={[styles.indicator, { backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.4)' }]} />
        ))}
      </View>
    </View>
  );
};

const VoiceIntro = ({ seconds }: { seconds: number }) => {
  const { colors } = useTheme();
  const playback = usePlayback(seconds);
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.voiceRow}>
        <ScalePressable onPress={playback.toggle} accessibilityLabel="Play voice intro">
          <GradientView name="primary" style={styles.play}>
            <Icon name={playback.playing ? 'pause' : 'play'} size={18} color="#fff" filled />
          </GradientView>
        </ScalePressable>
        <View style={styles.flex}>
          <Text variant="captionMedium" muted>
            Voice intro
          </Text>
          <Waveform progress={playback.progress} color={colors.border} activeColor={colors.primary} height={26} count={34} />
        </View>
        <Text variant="captionMedium" muted>
          {formatDuration(seconds)}
        </Text>
      </View>
    </View>
  );
};

const InfoRow = ({ icon, label }: { icon: IconName; label: string }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={18} color={colors.primary} />
      <Text variant="bodyMedium">{label}</Text>
    </View>
  );
};

interface Props {
  profile: Profile;
  compatibility?: CompatibilityResult;
  showDistance?: boolean;
  /** Blur photos (slow reveal) */
  blur?: number;
  footerSpace?: number;
  header?: React.ReactNode;
}

/** Full profile: carousel, intent, verified, prompts, interests, lifestyle and "why you match". */
export const ProfileView = ({ profile, compatibility, showDistance = true, blur, footerSpace = 120, header }: Props) => {
  const { colors } = useTheme();
  const age = calcAge(profile.dob);
  const shared = new Set(compatibility?.sharedInterests ?? []);
  const l = profile.lifestyle;
  const [firstPrompt, ...otherPrompts] = profile.prompts;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: footerSpace }}>
      <View>
        <PhotoCarousel photos={profile.photos.slice(0, 1).concat(profile.photos.slice(1, 2))} name={profile.name} blur={blur} />
        <View style={styles.heroInfo} pointerEvents="none">
          <IntentBadge intent={profile.intent} glass />
          <View style={styles.nameRow}>
            <Text variant="h2" color="#fff">
              {profile.name}, {age}
            </Text>
            {profile.verified ? <VerifiedTick size={24} /> : null}
            {profile.online ? <OnlineDot border="transparent" /> : null}
          </View>
          <View style={styles.chips}>
            {showDistance && profile.distanceKm > 0 ? <GlassChip icon="mapPin" label={`${profile.distanceKm} km · ${profile.city}`} /> : <GlassChip icon="mapPin" label={profile.city} />}
          </View>
        </View>
        {header}
      </View>

      <View style={styles.body}>
        {compatibility ? (
          <Animated.View entering={FadeIn.duration(400)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.compatHead}>
              <MatchRing score={compatibility.score} size={72} />
              <View style={styles.flex}>
                <Text variant="h3">Why you match</Text>
                <Text variant="caption" muted>
                  Based on values, lifestyle and interests
                </Text>
              </View>
            </View>
            {compatibility.reasons.map(r => (
              <View key={r.label} style={styles.reason}>
                <View style={[styles.reasonIcon, { backgroundColor: colors.primarySoft }]}>
                  <Icon name={r.icon} size={16} color={colors.primary} />
                </View>
                <View style={styles.flex}>
                  <Text variant="bodyMedium">{r.label}</Text>
                  <Text variant="caption" muted>
                    {r.detail}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        ) : null}

        {profile.voiceIntroSec ? <VoiceIntro seconds={profile.voiceIntroSec} /> : null}

        {profile.bio ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="captionMedium" color={colors.primary}>
              About {profile.name}
            </Text>
            <Text variant="body" style={styles.mt8}>
              {profile.bio}
            </Text>
          </View>
        ) : null}

        {firstPrompt ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="captionMedium" color={colors.primary}>
              {firstPrompt.question}
            </Text>
            <Text variant="h3" style={styles.mt8}>
              {firstPrompt.answer}
            </Text>
          </View>
        ) : null}

        {profile.photos[2] ? <SmartImage uri={profile.photos[2]} blurRadius={blur} style={styles.inlinePhoto} /> : null}

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="captionMedium" color={colors.primary}>
            Interests
          </Text>
          <View style={[styles.wrap, styles.mt8]}>
            {profile.interests.map(i => (
              <Chip key={i} size="sm" label={i} static highlight={shared.has(i)} icon={shared.has(i) ? 'sparkles' : undefined} />
            ))}
          </View>
        </View>

        {otherPrompts.map((p, idx) => (
          <React.Fragment key={p.question}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text variant="captionMedium" color={colors.primary}>
                {p.question}
              </Text>
              <Text variant="h3" style={styles.mt8}>
                {p.answer}
              </Text>
            </View>
            {profile.photos[3 + idx] ? <SmartImage uri={profile.photos[3 + idx]} blurRadius={blur} style={styles.inlinePhoto} /> : null}
          </React.Fragment>
        ))}

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="captionMedium" color={colors.primary}>
            The essentials
          </Text>
          <View style={styles.mt8}>
            {l.heightCm ? <InfoRow icon="ruler" label={formatHeight(l.heightCm)} /> : null}
            {l.job ? <InfoRow icon="briefcase" label={l.company ? `${l.job} at ${l.company}` : l.job} /> : null}
            {l.education ? <InfoRow icon="graduation" label={l.education} /> : null}
            {l.drinking ? <InfoRow icon="wine" label={`Drinks ${l.drinking}`} /> : null}
            {l.smoking ? <InfoRow icon="flame" label={l.smoking === 'never' ? 'Doesn’t smoke' : `Smokes ${l.smoking}`} /> : null}
            {l.religion && l.religion !== 'Prefer not to say' ? <InfoRow icon="sparkles" label={l.religion} /> : null}
            <InfoRow icon="globe" label={l.languages.join(', ')} />
          </View>
          {profile.values.length ? (
            <View style={[styles.wrap, styles.mt8]}>
              {profile.values.map(v => (
                <Chip key={v} size="sm" label={v} static emoji="💎" />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  indicators: { position: 'absolute', top: 54, left: 12, right: 12, flexDirection: 'row', gap: 4 },
  indicator: { flex: 1, height: 3.5, borderRadius: 2 },
  heroInfo: { position: 'absolute', left: 20, right: 20, bottom: 24, gap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  body: { paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 18 },
  compatHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  reasonIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  mt8: { marginTop: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  inlinePhoto: { width: '100%', aspectRatio: 0.85, borderRadius: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7 },
});
