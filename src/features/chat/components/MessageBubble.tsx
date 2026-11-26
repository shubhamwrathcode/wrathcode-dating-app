import React, { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { GradientView, Icon, ScalePressable, SmartImage, Text, Waveform } from '@/components';
import { usePlayback } from '@/core/hooks';
import { haptics } from '@/core/services/haptics';
import { useTheme } from '@/core/theme';
import { formatClock, formatDuration } from '@/core/utils';
import { Message } from '@/data/models';
import { DateCard } from './DateCard';

interface Props {
  message: Message;
  mine: boolean;
  replyTo?: Message;
  showTime: boolean;
  partnerName: string;
  isNew: boolean;
  onLongPress: (m: Message) => void;
  onDoubleTap: (m: Message) => void;
  onAcceptDate?: (m: Message) => void;
}

const StatusTicks = ({ status }: { status: Message['status'] }) => {
  const read = status === 'read';
  if (status === 'sending') {
    return <Icon name="clock" size={12} color="rgba(255,255,255,0.8)" />;
  }
  return <Icon name={status === 'sent' ? 'check' : 'checks'} size={14} color={read ? '#BDF4FF' : 'rgba(255,255,255,0.8)'} strokeWidth={2.2} />;
};

const VoiceContent = ({ m, mine }: { m: Message; mine: boolean }) => {
  const { colors } = useTheme();
  const playback = usePlayback(m.durationSec ?? 5);
  const fg = mine ? '#fff' : colors.primary;
  return (
    <View style={styles.voice}>
      <ScalePressable onPress={playback.toggle} style={[styles.voicePlay, { backgroundColor: mine ? 'rgba(255,255,255,0.25)' : colors.primarySoft }]} accessibilityLabel="Play voice note">
        <Icon name={playback.playing ? 'pause' : 'play'} size={16} color={fg} filled />
      </ScalePressable>
      <Waveform
        bars={m.waveform}
        progress={playback.progress}
        color={mine ? 'rgba(255,255,255,0.45)' : colors.border}
        activeColor={mine ? '#fff' : colors.primary}
        height={26}
        count={24}
      />
      <Text variant="micro" color={mine ? 'rgba(255,255,255,0.9)' : colors.textSecondary}>
        {formatDuration(playback.playing ? (m.durationSec ?? 0) * playback.progress : m.durationSec ?? 0)}
      </Text>
    </View>
  );
};

const PhotoContent = ({ m }: { m: Message }) => {
  const [revealed, setRevealed] = useState(!m.flagged);
  return (
    <Pressable onPress={() => setRevealed(true)} disabled={revealed}>
      <SmartImage uri={m.uri} style={styles.photo} blurRadius={revealed ? undefined : 30} />
      {!revealed ? (
        <View style={[StyleSheet.absoluteFill, styles.flagged]}>
          <Icon name="eyeOff" size={26} color="#fff" />
          <Text variant="captionMedium" color="#fff" center>
            Hidden by safety filter
          </Text>
          <Text variant="micro" color="rgba(255,255,255,0.8)">
            Tap to view anyway
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

/**
 * Chat bubble. Sent = gradient-primary, received = surface. New bubbles slide
 * up + fade (200ms); double-tap drops a heart reaction with a pop.
 */
export const MessageBubble = memo(({ message: m, mine, replyTo, showTime, partnerName, isNew, onLongPress, onDoubleTap, onAcceptDate }: Props) => {
  const { colors } = useTheme();
  const heart = useSharedValue(0);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_e, ok) => {
      if (ok) {
        heart.value = withSequence(withTiming(1.2, { duration: 150 }), withDelay(350, withTiming(0, { duration: 250 })));
        runOnJS(onDoubleTap)(m);
      }
    });
  const longPress = Gesture.LongPress()
    .minDuration(350)
    .onStart(() => {
      runOnJS(haptics.medium)();
      runOnJS(onLongPress)(m);
    });
  const gesture = Gesture.Exclusive(doubleTap, longPress);
  const heartStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, heart.value), transform: [{ scale: heart.value }] }));

  if (m.type === 'system') {
    return (
      <Animated.View entering={FadeIn} style={styles.system}>
        <View style={[styles.systemPill, { backgroundColor: colors.primarySoft }]}>
          <Text variant="micro" color={colors.primary} center>
            {m.text}
          </Text>
        </View>
      </Animated.View>
    );
  }

  const isMedia = m.type === 'photo' || m.type === 'sticker' || m.type === 'date';
  const textColor = mine ? '#fff' : colors.textPrimary;

  const content = (() => {
    switch (m.type) {
      case 'sticker':
        return <Text style={styles.sticker}>{m.text}</Text>;
      case 'photo':
        return <PhotoContent m={m} />;
      case 'voice':
        return <VoiceContent m={m} mine={mine} />;
      case 'date':
        return m.date ? <DateCard date={m.date} mine={mine} partnerName={partnerName} onAccept={onAcceptDate ? () => onAcceptDate(m) : undefined} /> : null;
      default:
        return (
          <Text variant="body" color={textColor} style={m.type === 'emoji' ? styles.bigEmoji : null}>
            {m.text}
          </Text>
        );
    }
  })();

  const reply = replyTo ? (
    <View style={[styles.reply, { borderLeftColor: mine ? '#fff' : colors.primary, backgroundColor: mine ? 'rgba(255,255,255,0.18)' : colors.primarySoft }]}>
      <Text variant="micro" color={mine ? '#fff' : colors.primary}>
        {replyTo.senderId === m.senderId ? 'Replying to themselves' : 'Reply'}
      </Text>
      <Text variant="caption" color={mine ? 'rgba(255,255,255,0.9)' : colors.textSecondary} numberOfLines={1}>
        {replyTo.text ?? (replyTo.type === 'voice' ? '🎤 Voice note' : replyTo.type === 'photo' ? '📷 Photo' : '🗓️ Date plan')}
      </Text>
    </View>
  ) : null;

  const meta = (
    <View style={styles.meta}>
      <Text variant="micro" color={mine && !isMedia ? 'rgba(255,255,255,0.8)' : colors.textSecondary}>
        {formatClock(m.createdAt)}
      </Text>
      {mine && !isMedia ? <StatusTicks status={m.status} /> : null}
    </View>
  );

  const bubbleShape = [styles.bubble, mine ? styles.mine : styles.theirs];

  return (
    <Animated.View
      entering={isNew ? FadeIn.duration(200) : undefined}
      style={[styles.wrap, mine ? styles.wrapMine : styles.wrapTheirs]}>
      <GestureDetector gesture={gesture}>
        <View>
          {isMedia ? (
            <View>
              {reply}
              {content}
            </View>
          ) : mine ? (
            <GradientView name="primary" style={bubbleShape}>
              {reply}
              {content}
              {meta}
            </GradientView>
          ) : (
            <View style={[bubbleShape, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}>
              {reply}
              {content}
              {meta}
            </View>
          )}
          <Animated.View pointerEvents="none" style={[styles.heartPop, heartStyle]}>
            <Icon name="heart" size={44} color="#DE24F8" filled />
          </Animated.View>
        </View>
      </GestureDetector>
      {m.reactions?.length ? (
        <View style={[styles.reactions, mine ? styles.reactMine : styles.reactTheirs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="caption">{m.reactions.join('')}</Text>
        </View>
      ) : null}
      {isMedia && showTime ? (
        <View style={[styles.mediaMeta, mine && styles.alignEnd]}>
          <Text variant="micro" muted>
            {formatClock(m.createdAt)}
            {mine ? ` · ${m.status === 'read' ? 'Read' : m.status === 'delivered' ? 'Delivered' : 'Sent'}` : ''}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginBottom: 6, maxWidth: '100%' },
  wrapMine: { alignItems: 'flex-end' },
  wrapTheirs: { alignItems: 'flex-start' },
  bubble: { maxWidth: 290, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22 },
  mine: { borderBottomRightRadius: 6 },
  theirs: { borderBottomLeftRadius: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginTop: 3 },
  mediaMeta: { marginTop: 3 },
  alignEnd: { alignItems: 'flex-end' },
  sticker: { fontSize: 54, lineHeight: 64 },
  bigEmoji: { fontSize: 36, lineHeight: 44 },
  photo: { width: 220, height: 170, borderRadius: 20 },
  flagged: { alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 20, backgroundColor: 'rgba(20,4,40,0.35)' },
  voice: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 210 },
  voicePlay: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  reply: { borderLeftWidth: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 6 },
  reactions: { position: 'relative', marginTop: -8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  reactMine: { marginRight: 8 },
  reactTheirs: { marginLeft: 8 },
  heartPop: { position: 'absolute', alignSelf: 'center', top: '20%' },
  system: { alignItems: 'center', marginVertical: 10, paddingHorizontal: 24 },
  systemPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
});
