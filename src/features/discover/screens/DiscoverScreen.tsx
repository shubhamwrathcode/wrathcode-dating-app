import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { EmptyState, GradientView, HeartLogo, Icon, IconButton, Screen, Text } from '@/components';
import { APP_NAME } from '@/core/constants';
import { useT } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { formatCountdown } from '@/core/utils';
import { Profile, SwipeAction } from '@/data/models';
import { ActionBar } from '../components/ActionBar';
import { FiltersSheet } from '../components/FiltersSheet';
import { SwipeCard, SwipeCardHandle } from '../components/SwipeCard';
import { useDiscoverViewModel } from '../viewmodels/useDiscoverViewModel';

export const DiscoverScreen = () => {
  const vm = useDiscoverViewModel();
  const t = useT();
  const { colors } = useTheme();
  const topRef = useRef<SwipeCardHandle>(null);
  const topDrag = useSharedValue(0);
  const top = vm.deck[0];
  const visible = vm.deck.slice(0, 3);

  // new top card → the one underneath starts back at 0.95
  useEffect(() => {
    topDrag.value = 0;
  }, [top?.id, topDrag]);

  const release = useCallback(
    (action: SwipeAction) => {
      if (vm.canSwipe(action)) {
        topRef.current?.flyOut(action);
      } else {
        topRef.current?.reset();
      }
    },
    [vm],
  );

  const committed = useCallback((profile: Profile, action: SwipeAction) => vm.commitSwipe(profile, action), [vm]);

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <HeartLogo size={34} tile />
          <Text variant="h2">{APP_NAME}</Text>
        </View>
        <View style={styles.headerRight}>
          <IconButton icon="bell" onPress={vm.openNotifications} badge={vm.unreadNotifications} accessibilityLabel="Notifications" />
          <IconButton icon="sliders" onPress={vm.openFilters} accessibilityLabel="Filters" />
        </View>
      </View>

      {vm.boostActive ? (
        <GradientView name="gold" style={styles.boostBanner}>
          <Icon name="bolt" size={16} color="#3B2410" filled />
          <Text variant="captionMedium" color="#3B2410">
            Boost active · {formatCountdown(vm.boostRemainingMs)} left · you’re seen by 10× more people
          </Text>
        </GradientView>
      ) : vm.plan === 'free' && Number.isFinite(vm.likesLeft) && vm.likesLeft <= 5 ? (
        <View style={[styles.limitBanner, { backgroundColor: colors.primarySoft }]}>
          <Text variant="captionMedium" color={colors.primary}>
            {vm.likesLeft} likes left today · Go Gold for unlimited
          </Text>
        </View>
      ) : null}

      <View style={styles.deckArea}>
        {vm.paused ? (
          <EmptyState icon="pause" title="Your account is paused" body="You’re hidden from Discover. Unpause to start meeting people again." cta="Unpause" onPress={vm.unpause} />
        ) : visible.length === 0 ? (
          <EmptyState icon="sparkles" title={t('discover.empty')} body={t('discover.emptyHint')} cta="Adjust filters" onPress={vm.openFilters} />
        ) : (
          <View style={styles.deck}>
            {[...visible].reverse().map(p => {
              const depth = visible.indexOf(p);
              const isTop = depth === 0;
              return (
                <SwipeCard
                  key={p.id}
                  ref={isTop ? topRef : undefined}
                  profile={p}
                  isTop={isTop}
                  depth={depth}
                  topDrag={topDrag}
                  showDistance={vm.showDistance}
                  compatibility={isTop ? vm.compatibility(p) : undefined}
                  onRelease={release}
                  onCommitted={action => committed(p, action)}
                  onOpen={() => vm.openProfile(p)}
                />
              );
            })}
          </View>
        )}
      </View>

      {top && !vm.paused ? (
        <ActionBar
          onUndo={vm.undo}
          onPass={() => release('pass')}
          onSuperLike={() => release('superlike')}
          onLike={() => release('like')}
          onBoost={vm.openBoost}
          boostActive={vm.boostActive}
        />
      ) : null}

      <FiltersSheet
        visible={vm.filtersOpen}
        onClose={vm.closeFilters}
        value={vm.filters}
        onApply={vm.setFilters}
        resultCount={vm.countFor}
        travelLocked={vm.plan !== 'platinum'}
        onTravel={() => {
          vm.closeFilters();
          vm.openTravel();
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', gap: 10 },
  boostBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  limitBanner: { marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
  deckArea: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  deck: { flex: 1 },
});
