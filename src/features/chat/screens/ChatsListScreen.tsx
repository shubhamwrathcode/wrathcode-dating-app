import React from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  ChatListSkeleton, EmptyState, GradientView, Icon, Input, OnlineDot, ScalePressable, Screen, SmartImage, Text, VerifiedTick,
} from '@/components';
import { useT } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { formatRelative } from '@/core/utils';
import { Conversation, useChatsListViewModel } from '../viewmodels/useChatsListViewModel';
import { TypingDots } from '../components/TypingDots';

const NewMatch = ({ c, onPress }: { c: Conversation; onPress: () => void }) => (
  <Animated.View entering={FadeIn.duration(250)}>
    <ScalePressable onPress={onPress} style={styles.newMatch} accessibilityLabel={`New match ${c.profile.name}`}>
      <GradientView name={c.match.viaSuperLike ? 'superlike' : 'primary'} style={styles.newRing}>
        <View style={styles.newInner}>
          <SmartImage uri={c.profile.photos[0]} name={c.profile.name} style={StyleSheet.absoluteFill} />
        </View>
      </GradientView>
      {c.match.viaSuperLike ? (
        <GradientView name="superlike" style={styles.superDot}>
          <Icon name="star" size={10} color="#fff" filled />
        </GradientView>
      ) : null}
      <Text variant="captionMedium" numberOfLines={1} style={styles.newName}>
        {c.profile.name}
      </Text>
    </ScalePressable>
  </Animated.View>
);

export const ChatsListScreen = () => {
  const vm = useChatsListViewModel();
  const t = useT();
  const { colors } = useTheme();

  const header = (
    <View>
      <Input
        value={vm.query}
        onChangeText={vm.setQuery}
        placeholder="Search matches"
        left={<Icon name="search" size={18} color={colors.textSecondary} />}
        containerStyle={styles.search}
      />
      {vm.newMatches.length ? (
        <>
          <Text variant="title" style={styles.sectionTitle}>
            {t('chats.newMatches')} <Text variant="captionMedium" color={colors.primary}>{vm.newMatches.length}</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newRow}>
            {vm.newMatches.map(c => (
              <NewMatch key={c.match.id} c={c} onPress={() => vm.open(c.match.id)} />
            ))}
          </ScrollView>
        </>
      ) : null}
      <Text variant="title" style={styles.sectionTitle}>
        {t('chats.messages')}
      </Text>
    </View>
  );

  return (
    <Screen edges={['top']}>
      <View style={styles.top}>
        <Text variant="h1">{t('chats.title')}</Text>
      </View>
      {vm.loading ? (
        <ChatListSkeleton />
      ) : vm.isEmpty ? (
        <EmptyState icon="message" title="No chats yet" body="When you match with someone, your conversation starts here." cta="Start discovering" onPress={vm.goDiscover} />
      ) : (
        <FlatList
          data={vm.conversations}
          keyExtractor={c => c.match.id}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text muted center style={styles.empty}>
              {vm.query ? 'No chats match your search.' : 'Say hi to your new matches above 👆'}
            </Text>
          }
          renderItem={({ item: c }) => (
            <Animated.View entering={FadeIn.duration(300)}>
              <ScalePressable scaleTo={0.98} onPress={() => vm.open(c.match.id)} style={styles.row}>
                <View>
                  <SmartImage uri={c.profile.photos[0]} name={c.profile.name} style={styles.avatar} />
                  {c.profile.online ? (
                    <View style={styles.online}>
                      <OnlineDot border={colors.background} />
                    </View>
                  ) : null}
                </View>
                <View style={styles.rowBody}>
                  <View style={styles.rowTop}>
                    <View style={styles.nameRow}>
                      <Text variant="title" numberOfLines={1} style={styles.shrink}>
                        {c.profile.name}
                      </Text>
                      {c.profile.verified ? <VerifiedTick size={15} /> : null}
                    </View>
                    <Text variant="micro" color={c.match.unread ? colors.primary : colors.textSecondary}>
                      {c.last ? formatRelative(c.last.createdAt) : ''}
                    </Text>
                  </View>
                  <View style={styles.rowBottom}>
                    {c.typing ? (
                      <View style={styles.typingRow}>
                        <TypingDots small />
                        <Text variant="caption" color={colors.primary}>
                          typing…
                        </Text>
                      </View>
                    ) : (
                      <Text
                        variant={c.match.unread ? 'captionMedium' : 'caption'}
                        color={c.match.unread ? colors.textPrimary : colors.textSecondary}
                        numberOfLines={1}
                        style={styles.shrink}>
                        {vm.preview(c.last)}
                      </Text>
                    )}
                    {c.match.closed ? (
                      <Text variant="micro" muted>
                        Closed
                      </Text>
                    ) : c.match.unread ? (
                      <GradientView name="primary" style={styles.unread}>
                        <Text variant="micro" color="#fff">
                          {c.match.unread}
                        </Text>
                      </GradientView>
                    ) : c.yourTurn ? (
                      <View style={[styles.turn, { backgroundColor: c.stale ? colors.warning + '22' : colors.primarySoft }]}>
                        <Text variant="micro" color={c.stale ? colors.warning : colors.primary}>
                          {c.stale ? 'Waiting 2d+' : 'Your turn'}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </ScalePressable>
            </Animated.View>
          )}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  top: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  search: { marginVertical: 8 },
  sectionTitle: { marginTop: 14, marginBottom: 10 },
  newRow: { gap: 14, paddingRight: 20 },
  newMatch: { alignItems: 'center', width: 76 },
  newRing: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center' },
  newInner: { width: 66, height: 66, borderRadius: 33, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  superDot: { position: 'absolute', top: 0, right: 2, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  newName: { marginTop: 6 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  online: { position: 'absolute', right: 1, bottom: 1 },
  rowBody: { flex: 1, gap: 4 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  shrink: { flexShrink: 1, flex: 1 },
  unread: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  turn: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  empty: { marginTop: 24 },
});
