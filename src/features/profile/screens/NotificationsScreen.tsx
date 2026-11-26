import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, EmptyState, GradientView, Header, Icon, IconName, ScalePressable, Screen, SmartImage, Text } from '@/components';
import { useTheme } from '@/core/theme';
import { GradientName } from '@/core/theme/gradients';
import { formatRelative } from '@/core/utils';
import { AppNotification, NotificationKind } from '@/data/models';
import { profileRepository } from '@/data/repositories/profileRepository';
import { RootStackParamList } from '@/navigation/types';
import { useNotificationStore } from '@/store/useNotificationStore';

const KIND: Record<NotificationKind, { icon: IconName; gradient: GradientName }> = {
  match: { icon: 'heart', gradient: 'primary' },
  message: { icon: 'message', gradient: 'primary' },
  like: { icon: 'star', gradient: 'superlike' },
  picks: { icon: 'sparkles', gradient: 'gold' },
  safety: { icon: 'shieldCheck', gradient: 'romance' },
  premium: { icon: 'crown', gradient: 'premium' },
};

/** In-app notification centre (mirrors push: match, message, likes, Daily Picks). */
export const NotificationsScreen = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const items = useNotificationStore(s => s.items);
  const markAllRead = useNotificationStore(s => s.markAllRead);
  const markRead = useNotificationStore(s => s.markRead);

  useEffect(() => () => markAllRead(), [markAllRead]);

  const open = (n: AppNotification) => {
    markRead(n.id);
    if (n.matchId && (n.kind === 'match' || n.kind === 'message')) {
      nav.navigate('ChatRoom', { matchId: n.matchId });
    } else if (n.kind === 'picks') {
      nav.navigate('Main', { screen: 'Picks' });
    } else if (n.kind === 'like') {
      nav.navigate('Main', { screen: 'Likes' });
    }
  };

  return (
    <Screen>
      <Header title="Notifications" right={items.some(i => !i.read) ? <Button title="Read all" size="sm" variant="ghost" onPress={markAllRead} /> : null} />
      {!items.length ? (
        <EmptyState icon="bell" title="You’re all caught up" body="Matches, messages and likes will show up here." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const k = KIND[item.kind];
            const profile = item.profileId ? profileRepository.getById(item.profileId) : undefined;
            return (
              <Animated.View entering={FadeIn.duration(250)}>
                <ScalePressable
                  scaleTo={0.98}
                  onPress={() => open(item)}
                  style={[styles.row, { backgroundColor: item.read ? 'transparent' : colors.primarySoft }]}>
                  {profile ? (
                    <View>
                      <SmartImage uri={profile.photos[0]} name={profile.name} style={styles.avatar} />
                      <GradientView name={k.gradient} style={styles.kindBadge}>
                        <Icon name={k.icon} size={10} color="#fff" filled />
                      </GradientView>
                    </View>
                  ) : (
                    <GradientView name={k.gradient} style={styles.avatar}>
                      <View style={styles.center}>
                        <Icon name={k.icon} size={22} color="#fff" />
                      </View>
                    </GradientView>
                  )}
                  <View style={styles.flex}>
                    <Text variant="bodyMedium">{item.title}</Text>
                    <Text variant="caption" muted numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>
                  <Text variant="micro" muted>
                    {formatRelative(item.createdAt)}
                  </Text>
                </ScalePressable>
              </Animated.View>
            );
          }}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: 12, paddingVertical: 8, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18 },
  avatar: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden' },
  kindBadge: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
});
