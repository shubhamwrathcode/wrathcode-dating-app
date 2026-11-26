import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { GradientView, Icon, ScalePressable, SmartImage, Text, Waveform } from '@/components';
import { QUICK_EMOJIS, STICKERS } from '@/core/constants';
import { useVoiceRecorder } from '@/core/hooks';
import { useTheme } from '@/core/theme';
import { formatDuration } from '@/core/utils';
import { CHAT_GALLERY } from '@/data/mock/photos';
import { Message } from '@/data/models';

const VOICE_MAX = 60;

interface Props {
  disabled?: boolean;
  disabledReason?: string;
  replyTo?: Message | null;
  onCancelReply: () => void;
  onSendText: (t: string) => void;
  onSendSticker: (s: string) => void;
  onSendPhoto: (uri: string) => void;
  onSendVoice: (v: { durationSec: number; waveform: number[] }) => void;
  onOpenDatePlanner: () => void;
  onTyping?: () => void;
}

type Panel = 'none' | 'emoji' | 'attach';

export const Composer = ({
  disabled, disabledReason, replyTo, onCancelReply, onSendText, onSendSticker, onSendPhoto, onSendVoice, onOpenDatePlanner,
}: Props) => {
  const { colors, typography } = useTheme();
  const [text, setText] = useState('');
  const [panel, setPanel] = useState<Panel>('none');
  const recorder = useVoiceRecorder(VOICE_MAX, sec => onSendVoice({ durationSec: sec, waveform: Array.from({ length: 24 }, () => 0.2 + Math.random() * 0.8) }));

  if (disabled) {
    return (
      <View style={[styles.disabled, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Icon name="lock" size={16} color={colors.textSecondary} />
        <Text variant="caption" muted>
          {disabledReason}
        </Text>
      </View>
    );
  }

  const send = () => {
    const t = text.trim();
    if (!t) {
      return;
    }
    onSendText(t);
    setText('');
  };

  const togglePanel = (p: Panel) => setPanel(cur => (cur === p ? 'none' : p));

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {replyTo ? (
        <Animated.View entering={FadeIn.duration(180)} style={[styles.replyBar, { backgroundColor: colors.primarySoft }]}>
          <Icon name="reply" size={16} color={colors.primary} />
          <Text variant="caption" numberOfLines={1} style={styles.flex}>
            {replyTo.text ?? 'Attachment'}
          </Text>
          <ScalePressable onPress={onCancelReply} hitSlop={10}>
            <Icon name="x" size={16} color={colors.textSecondary} />
          </ScalePressable>
        </Animated.View>
      ) : null}

      {recorder.recording ? (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.row}>
          <ScalePressable onPress={recorder.cancel} style={[styles.round, { backgroundColor: colors.error + '1A' }]} accessibilityLabel="Cancel recording">
            <Icon name="trash" size={20} color={colors.error} />
          </ScalePressable>
          <View style={[styles.recording, { backgroundColor: colors.primarySoft }]}>
            <View style={[styles.recDot, { backgroundColor: colors.error }]} />
            <Text variant="captionMedium" color={colors.primary}>
              {formatDuration(recorder.seconds)}
            </Text>
            <View style={styles.flex}>
              <Waveform live color={colors.primary} height={24} count={22} />
            </View>
          </View>
          <ScalePressable onPress={() => onSendVoice(recorder.stop())} accessibilityLabel="Send voice note">
            <GradientView name="primary" style={styles.round}>
              <Icon name="send" size={20} color="#fff" />
            </GradientView>
          </ScalePressable>
        </Animated.View>
      ) : (
        <View style={styles.row}>
          <ScalePressable onPress={() => togglePanel('attach')} style={[styles.round, { backgroundColor: colors.primarySoft }]} accessibilityLabel="Attachments">
            <Icon name={panel === 'attach' ? 'x' : 'plus'} size={22} color={colors.primary} />
          </ScalePressable>
          <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message…"
              placeholderTextColor={colors.textSecondary}
              style={[{ fontFamily: typography.body.fontFamily, fontSize: 14 }, styles.input, { color: colors.textPrimary, includeFontPadding: false }]}
              multiline
              onFocus={() => setPanel('none')}
              selectionColor={colors.primary}
            />
            <ScalePressable onPress={() => togglePanel('emoji')} hitSlop={8} accessibilityLabel="Emoji">
              <Icon name="smile" size={22} color={panel === 'emoji' ? colors.primary : colors.textSecondary} />
            </ScalePressable>
          </View>
          {text.trim() ? (
            <ScalePressable onPress={send} accessibilityLabel="Send">
              <GradientView name="primary" style={styles.round}>
                <Icon name="send" size={20} color="#fff" />
              </GradientView>
            </ScalePressable>
          ) : (
            <ScalePressable onPress={recorder.start} accessibilityLabel="Record voice note">
              <GradientView name="primary" style={styles.round}>
                <Icon name="mic" size={20} color="#fff" />
              </GradientView>
            </ScalePressable>
          )}
        </View>
      )}

      {panel === 'emoji' ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.panel}>
          <View style={styles.emojiGrid}>
            {QUICK_EMOJIS.map(e => (
              <ScalePressable key={e} onPress={() => setText(t => t + e)} style={styles.emoji}>
                <Text style={styles.emojiText}>{e}</Text>
              </ScalePressable>
            ))}
          </View>
          <Text variant="captionMedium" muted style={styles.panelTitle}>
            Stickers & GIFs
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stickers}>
            {STICKERS.map(s => (
              <ScalePressable key={s} onPress={() => onSendSticker(s)} style={[styles.sticker, { backgroundColor: colors.primarySoft }]}>
                <Text style={styles.stickerText}>{s}</Text>
              </ScalePressable>
            ))}
          </ScrollView>
        </Animated.View>
      ) : null}

      {panel === 'attach' ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.panel}>
          <View style={styles.attachRow}>
            <ScalePressable
              onPress={() => {
                setPanel('none');
                onOpenDatePlanner();
              }}
              style={styles.attachItem}>
              <GradientView name="romance" style={styles.attachIcon}>
                <Icon name="calendar" size={22} color="#fff" />
              </GradientView>
              <Text variant="micro">Plan a date</Text>
            </ScalePressable>
            <View style={styles.attachItem}>
              <GradientView name="primary" style={styles.attachIcon}>
                <Icon name="image" size={22} color="#fff" />
              </GradientView>
              <Text variant="micro">Photos</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stickers}>
            {CHAT_GALLERY.map(uri => (
              <ScalePressable
                key={uri}
                onPress={() => {
                  setPanel('none');
                  onSendPhoto(uri);
                }}>
                <SmartImage uri={uri} style={styles.galleryItem} />
              </ScalePressable>
            ))}
          </ScrollView>
          <Text variant="micro" muted style={styles.panelTitle}>
            Photos are scanned by the NSFW filter before they’re shown. The last one is flagged for the demo.
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  inputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, minHeight: 44, gap: 8 },
  input: { flex: 1, maxHeight: 120, paddingVertical: 10 },
  flex: { flex: 1 },
  replyBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, marginBottom: 8 },
  recording: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 22, paddingHorizontal: 14, height: 44 },
  recDot: { width: 10, height: 10, borderRadius: 5 },
  panel: { paddingTop: 12 },
  panelTitle: { marginTop: 10, marginBottom: 6 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  emoji: { width: '10%', alignItems: 'center', paddingVertical: 6 },
  emojiText: { fontSize: 24 },
  stickers: { gap: 10, paddingVertical: 4 },
  sticker: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stickerText: { fontSize: 36 },
  attachRow: { flexDirection: 'row', gap: 20, marginBottom: 12 },
  attachItem: { alignItems: 'center', gap: 6 },
  attachIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  galleryItem: { width: 84, height: 84, borderRadius: 16 },
  disabled: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 18, borderTopWidth: StyleSheet.hairlineWidth },
});
