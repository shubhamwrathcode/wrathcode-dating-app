import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, Button, EmptyState, GradientView, Icon, IconButton, Row, ScalePressable, Screen, Section } from '@/components';
import { useTheme } from '@/core/theme';
import { ReportSheet } from '@/features/safety/components/ReportSheet';
import { ProfileView } from '@/features/profile/components/ProfileView';
import { RootScreenProps } from '@/navigation/types';
import { useProfileDetailViewModel } from '../viewmodels/useProfileDetailViewModel';

export const ProfileDetailScreen = ({ route }: RootScreenProps<'ProfileDetail'>) => {
  const vm = useProfileDetailViewModel(route.params.profileId);
  const insets = useSafeAreaInsets();
  const { colors, shadowSoft } = useTheme();

  if (!vm.profile) {
    return (
      <Screen>
        <EmptyState icon="user" title="Profile unavailable" body="This profile is no longer on DilSe." cta="Go back" onPress={vm.close} />
      </Screen>
    );
  }
  const p = vm.profile;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ProfileView profile={p} compatibility={vm.compatibility} showDistance={vm.showDistance} footerSpace={140} />

      <View style={[styles.topBar, { top: insets.top + 6 }]}>
        <IconButton icon="chevronDown" onPress={vm.close} bg="rgba(0,0,0,0.35)" color="#fff" accessibilityLabel="Close" />
        <IconButton icon="more" onPress={() => vm.setMenuOpen(true)} bg="rgba(0,0,0,0.35)" color="#fff" accessibilityLabel="More options" />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]} pointerEvents="box-none">
        {vm.match ? (
          <Button title={`Message ${p.name}`} icon="message" onPress={vm.message} style={styles.msg} />
        ) : vm.canAct ? (
          <View style={styles.actions}>
            <ScalePressable onPress={() => vm.act('pass')} style={[styles.round, styles.md, { backgroundColor: colors.surface }, shadowSoft]} accessibilityLabel="Pass">
              <Icon name="x" size={28} color={colors.pass} strokeWidth={3} />
            </ScalePressable>
            <ScalePressable onPress={() => vm.act('superlike')} style={shadowSoft} accessibilityLabel="Super like">
              <GradientView name="superlike" style={[styles.round, styles.sm]}>
                <Icon name="star" size={24} color="#fff" filled />
              </GradientView>
            </ScalePressable>
            <ScalePressable onPress={() => vm.act('like')} style={shadowSoft} accessibilityLabel="Like">
              <GradientView name="primary" style={[styles.round, styles.lg]}>
                <Icon name="heart" size={32} color="#fff" filled />
              </GradientView>
            </ScalePressable>
          </View>
        ) : null}
      </View>

      <BottomSheet visible={vm.menuOpen} onClose={() => vm.setMenuOpen(false)} title={p.name}>
        <Section>
          <Row
            icon="flag"
            title={`Report ${p.name}`}
            subtitle="Fake profile, inappropriate content, safety concern"
            onPress={() => {
              vm.setMenuOpen(false);
              setTimeout(() => vm.setReportOpen(true), 260);
            }}
          />
          <Row
            icon="ban"
            danger
            title={`Block ${p.name}`}
            subtitle="They won’t see you or be able to contact you"
            onPress={() => {
              vm.setMenuOpen(false);
              vm.block();
            }}
            last
          />
        </Section>
      </BottomSheet>

      <ReportSheet visible={vm.reportOpen} onClose={() => vm.setReportOpen(false)} profileId={p.id} name={p.name} onDone={blocked => blocked && vm.close()} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  round: { alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  sm: { width: 54, height: 54 },
  md: { width: 62, height: 62 },
  lg: { width: 72, height: 72 },
  msg: { alignSelf: 'stretch', marginHorizontal: 24 },
});
