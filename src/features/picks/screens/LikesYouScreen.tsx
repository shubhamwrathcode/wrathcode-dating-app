import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  Button,
  EmptyState,
  GradientView,
  Icon,
  ScalePressable,
  Screen,
  Shimmer,
  SmartImage,
  Text,
  VerifiedTick,
} from '@/components';
import { useT } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { calcAge } from '@/core/utils';
import { useLikesYouViewModel } from '../viewmodels/usePicksViewModels';

const { width: W } = Dimensions.get('window');
const TILE = (W - 20 * 2 - 12) / 2;

export const LikesYouScreen = () => {
  const vm = useLikesYouViewModel();
  const t = useT();
  const { colors } = useTheme();

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1">{t('likes.title')}</Text>
        <Text muted>
          {vm.likes.length
            ? `${vm.likes.length} ${
                vm.likes.length === 1 ? 'person likes' : 'people like'
              } you. ${vm.unlocked ? 'Like back to match instantly.' : ''}`
            : 'When someone likes you, they’ll appear here.'}
        </Text>
      </View>

      {!vm.likes.length ? (
        <EmptyState
          icon="heart"
          title="No new likes yet"
          body="Complete your profile and add a voice intro to get noticed faster."
        />
      ) : (
        // One simple fade for the whole grid — no per-tile stagger or bounce.
        <Animated.View entering={FadeIn.duration(250)} style={styles.flex}>
          <FlatList
            data={vm.likes}
            keyExtractor={p => p.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={[
              styles.list,
              !vm.unlocked && styles.listLocked,
            ]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: p }) => (
              <ScalePressable
                onPress={() => vm.open(p)}
                style={styles.tile}
                accessibilityLabel={vm.unlocked ? p.name : 'Hidden like'}
              >
                <SmartImage
                  uri={p.photos[0]}
                  name={p.name}
                  blurRadius={vm.unlocked ? undefined : 28}
                  style={StyleSheet.absoluteFill}
                />
                <GradientView
                  name="cardOverlay"
                  style={StyleSheet.absoluteFill}
                />
                {!vm.unlocked ? (
                  <Shimmer duration={2000} intensity={0.35} />
                ) : null}
                {p.superLikedMe ? (
                  <GradientView name="superlike" style={styles.super}>
                    <Icon name="star" size={12} color="#fff" filled />
                  </GradientView>
                ) : null}
                <View style={styles.info}>
                  {vm.unlocked ? (
                    <View style={styles.nameRow}>
                      <Text
                        variant="title"
                        color="#fff"
                        numberOfLines={1}
                        style={styles.shrink}
                      >
                        {p.name}, {calcAge(p.dob)}
                      </Text>
                      {p.verified ? <VerifiedTick size={16} /> : null}
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.hiddenName,
                        { backgroundColor: 'rgba(255,255,255,0.35)' },
                      ]}
                    />
                  )}
                </View>
              </ScalePressable>
            )}
          />
        </Animated.View>
      )}

      {!vm.unlocked && vm.likes.length ? (
        <View
          style={[
            styles.unlockBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <GradientView name="gold" style={styles.unlockIcon}>
            <Icon name="eye" size={20} color="#3B2410" />
          </GradientView>
          <View style={styles.flex}>
            <Text variant="title">See who likes you</Text>
            <Text variant="caption" muted>
              Match instantly with anyone here
            </Text>
          </View>
          <Button
            title="Unlock"
            variant="gold"
            size="sm"
            onPress={vm.upgrade}
          />
        </View>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 4 },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  listLocked: { paddingBottom: 110 },
  row: { gap: 12 },
  tile: {
    width: TILE,
    height: TILE * 1.35,
    borderRadius: 24,
    overflow: 'hidden',
  },
  super: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shrink: { flexShrink: 1 },
  hiddenName: { width: '60%', height: 14, borderRadius: 7 },
  unlockBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  unlockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
});
