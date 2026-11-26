import React, { useCallback, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BottomSheet, Button, EmptyState, GradientView, Icon, IconButton, OnlineDot, ProgressBar, Row, ScalePressable, Screen,
  Section, SmartImage, Text, VerifiedTick,
} from '@/components';
import { REACTIONS } from '@/core/constants';
import { useTheme } from '@/core/theme';
import { formatRelative } from '@/core/utils';
import { Message } from '@/data/models';
import { ME_ID } from '@/data/mock/demoAccounts';
import { ReportSheet } from '@/features/safety/components/ReportSheet';
import { RootScreenProps } from '@/navigation/types';
import { Composer } from '../components/Composer';
import { DatePlannerSheet } from '../components/DatePlannerSheet';
import { MessageBubble } from '../components/MessageBubble';
import { TypingBubble } from '../components/TypingDots';
import { CLOSE_CHAT_MESSAGE, useChatRoomViewModel } from '../viewmodels/useChatRoomViewModel';

export const ChatRoomScreen = ({ route }: RootScreenProps<'ChatRoom'>) => {
  const vm = useChatRoomViewModel(route.params.matchId);
  const { colors } = useTheme();
  const reversed = useMemo(() => [...vm.messages].reverse(), [vm.messages]);

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const newer = reversed[index - 1];
      return (
        <MessageBubble
          message={item}
          mine={item.senderId === ME_ID}
          replyTo={item.replyToId ? vm.byId[item.replyToId] : undefined}
          showTime={!newer || newer.senderId !== item.senderId}
          partnerName={vm.partner?.name ?? ''}
          isNew={item.createdAt > vm.mountedAt}
          onLongPress={vm.setActionFor}
          onDoubleTap={vm.heart}
          onAcceptDate={item.senderId !== ME_ID ? vm.acceptDate : undefined}
        />
      );
    },
    [reversed, vm.byId, vm.partner, vm.mountedAt, vm.setActionFor, vm.heart, vm.acceptDate],
  );

  if (!vm.match || !vm.partner) {
    return (
      <Screen>
        <EmptyState icon="message" title="Chat unavailable" body="This match is no longer active." cta="Go back" onPress={vm.back} />
      </Screen>
    );
  }
  const p = vm.partner;
  const status = vm.typing ? 'typing…' : p.online ? 'Online now' : `Active ${formatRelative(p.lastActiveAt)} ago`;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <IconButton icon="chevronLeft" onPress={vm.back} accessibilityLabel="Back" />
          <ScalePressable onPress={vm.openProfile} style={styles.person} accessibilityLabel={`Open ${p.name}'s profile`}>
            <View>
              <SmartImage uri={p.photos[0]} name={p.name} style={styles.avatar} blurRadius={vm.blurPhotos ? 18 : undefined} />
              {p.online ? (
                <View style={styles.dot}>
                  <OnlineDot size={11} border={colors.surface} />
                </View>
              ) : null}
            </View>
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <Text variant="title" numberOfLines={1}>
                  {p.name}
                </Text>
                {p.verified ? <VerifiedTick size={15} /> : null}
              </View>
              <Text variant="micro" color={vm.typing || p.online ? colors.success : colors.textSecondary}>
                {status}
              </Text>
            </View>
          </ScalePressable>
          <IconButton icon="phone" size={20} onPress={() => vm.call(false)} accessibilityLabel="Audio call" />
          <IconButton icon="video" size={20} onPress={() => vm.call(true)} accessibilityLabel="Video call" />
          <IconButton icon="more" size={20} onPress={() => vm.setMenuOpen(true)} accessibilityLabel="More" />
        </View>
        {vm.blurPhotos ? (
          <View style={styles.reveal}>
            <Icon name="eyeOff" size={14} color={colors.secondary} />
            <Text variant="micro" color={colors.secondary} style={styles.revealText}>
              Slow reveal: photos unblur after 10 messages
            </Text>
            <View style={styles.revealBar}>
              <ProgressBar progress={vm.revealProgress} height={4} />
            </View>
          </View>
        ) : null}
      </SafeAreaView>

      {vm.ghostState !== 'none' ? (
        <Animated.View entering={FadeIn.duration(250)} style={[styles.ghost, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <GradientView name={vm.ghostState === 'reply_reminder' ? 'primary' : 'gold'} style={styles.ghostIcon}>
            <Icon name={vm.ghostState === 'reply_reminder' ? 'clock' : 'heart'} size={18} color={vm.ghostState === 'reply_reminder' ? '#fff' : '#3B2410'} />
          </GradientView>
          <View style={styles.flex}>
            <Text variant="captionMedium">
              {vm.ghostState === 'reply_reminder' ? `${p.name} is waiting for your reply` : 'This chat has gone quiet'}
            </Text>
            <Text variant="micro" muted>
              {vm.ghostState === 'reply_reminder'
                ? 'It’s been over 48 hours. A quick reply goes a long way 💛'
                : 'No reply for 5+ days. Close it kindly instead of ghosting?'}
            </Text>
            {vm.ghostState === 'close_suggestion' ? (
              <View style={styles.ghostActions}>
                <Button title="Close kindly" size="sm" variant="outline" onPress={vm.closeChat} />
                <Button title="Keep open" size="sm" variant="ghost" onPress={vm.dismissGhost} />
              </View>
            ) : null}
          </View>
          <ScalePressable onPress={vm.dismissGhost} hitSlop={10}>
            <Icon name="x" size={16} color={colors.textSecondary} />
          </ScalePressable>
        </Animated.View>
      ) : null}

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {vm.messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Animated.View entering={FadeIn.duration(400)} style={styles.matchedHead}>
              <SmartImage uri={p.photos[0]} name={p.name} style={styles.bigAvatar} blurRadius={vm.blurPhotos ? 18 : undefined} />
              <Text variant="h3" center>
                You matched with {p.name}
              </Text>
              <Text variant="caption" muted center>
                {formatRelative(vm.match.createdAt)} ago{vm.match.viaSuperLike ? ' · via Super Like ⭐' : ''}
              </Text>
            </Animated.View>
            <View style={styles.ice}>
              <View style={styles.iceTitle}>
                <Icon name="sparkles" size={16} gradient="primary" />
                <Text variant="captionMedium" color={colors.primary}>
                  AI icebreakers, based on what you share
                </Text>
              </View>
              {vm.icebreakers.map(ib => (
                <Animated.View key={ib} entering={FadeIn.duration(250)}>
                  <ScalePressable onPress={() => vm.sendText(ib)} style={[styles.iceItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text variant="bodyMedium" style={styles.flex}>
                      {ib}
                    </Text>
                    <Icon name="send" size={18} color={colors.primary} />
                  </ScalePressable>
                </Animated.View>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            data={reversed}
            inverted
            keyExtractor={m => m.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListHeaderComponent={vm.typing ? <TypingBubble /> : undefined}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.surface }}>
          <Composer
            disabled={vm.match.closed}
            disabledReason="This chat was closed kindly. You can still view the history."
            replyTo={vm.replyTo}
            onCancelReply={() => vm.setReplyTo(null)}
            onSendText={vm.sendText}
            onSendSticker={vm.sendSticker}
            onSendPhoto={vm.sendPhoto}
            onSendVoice={vm.sendVoice}
            onOpenDatePlanner={() => vm.setPlannerOpen(true)}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Long-press actions: reactions + reply */}
      <BottomSheet visible={!!vm.actionFor} onClose={() => vm.setActionFor(null)}>
        <View style={styles.reactRow}>
          {REACTIONS.map(r => (
            <ScalePressable key={r} onPress={() => vm.actionFor && vm.react(vm.actionFor, r)} style={[styles.reactBtn, { backgroundColor: colors.primarySoft }]}>
              <Text style={styles.reactEmoji}>{r}</Text>
            </ScalePressable>
          ))}
        </View>
        <Section>
          <Row
            icon="reply"
            title="Reply"
            onPress={() => {
              vm.setReplyTo(vm.actionFor);
              vm.setActionFor(null);
            }}
            last
          />
        </Section>
      </BottomSheet>

      <BottomSheet visible={vm.menuOpen} onClose={() => vm.setMenuOpen(false)} title={p.name} scroll>
        <Section>
          <Row icon="user" title="View profile" onPress={() => { vm.setMenuOpen(false); vm.openProfile(); }} />
          <Row icon="calendar" title="Plan a date" onPress={() => { vm.setMenuOpen(false); setTimeout(() => vm.setPlannerOpen(true), 260); }} />
          <Row icon="shieldCheck" title="Safety centre" subtitle="Date check-in, SOS, trusted contact" onPress={() => { vm.setMenuOpen(false); vm.openSafety(); }} />
          <Row icon="camera" title="Demo: screenshot alert" onPress={() => { vm.setMenuOpen(false); vm.simulateScreenshot(); }} last />
        </Section>
        <Section>
          {!vm.match.closed ? (
            <Row icon="heart" title="Close chat kindly" subtitle={`Sends: “${CLOSE_CHAT_MESSAGE.slice(0, 42)}…”`} onPress={() => { vm.setMenuOpen(false); vm.closeChat(); }} />
          ) : null}
          <Row icon="x" title="Unmatch" danger onPress={() => { vm.setMenuOpen(false); vm.unmatch(); }} />
          <Row icon="ban" title="Block" danger onPress={() => { vm.setMenuOpen(false); vm.block(); }} />
          <Row icon="flag" title="Report" danger onPress={() => { vm.setMenuOpen(false); setTimeout(() => vm.setReportOpen(true), 260); }} last />
        </Section>
      </BottomSheet>

      <DatePlannerSheet
        visible={vm.plannerOpen}
        onClose={() => vm.setPlannerOpen(false)}
        partnerName={p.name}
        city={p.city}
        trustedContact={vm.trustedContact}
        onSend={vm.proposeDate}
        onAddContact={() => {
          vm.setPlannerOpen(false);
          vm.openSafety();
        }}
      />

      <ReportSheet visible={vm.reportOpen} onClose={() => vm.setReportOpen(false)} profileId={p.id} name={p.name} onDone={blocked => blocked && vm.back()} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8 },
  person: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  dot: { position: 'absolute', right: 0, bottom: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reveal: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingBottom: 8 },
  revealText: { flexShrink: 1 },
  revealBar: { width: 60 },
  ghost: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginHorizontal: 20, marginVertical: 12, padding: 12, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  ghostIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ghostActions: { flexDirection: 'row', gap: 6, marginTop: 8 },
  list: { paddingVertical: 12 },
  emptyWrap: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20, paddingVertical: 16 },
  matchedHead: { alignItems: 'center', gap: 6, marginBottom: 24 },
  bigAvatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 8 },
  ice: { gap: 8 },
  iceTitle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  iceItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  reactRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  reactBtn: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  reactEmoji: { fontSize: 26 },
});
