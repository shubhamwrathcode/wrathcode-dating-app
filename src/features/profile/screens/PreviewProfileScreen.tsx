import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientView, IconButton, Text } from '@/components';
import { useTheme } from '@/core/theme';
import { useSessionStore } from '@/store/useSessionStore';
import { ProfileView } from '../components/ProfileView';

/** "How others see me" — the exact profile view other users get. */
export const PreviewProfileScreen = () => {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useSessionStore(s => s.user)!;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ProfileView profile={user} footerSpace={40} />
      <View style={[styles.bar, { top: insets.top + 6 }]}>
        <IconButton icon="chevronDown" onPress={() => nav.goBack()} bg="rgba(0,0,0,0.35)" color="#fff" accessibilityLabel="Close preview" />
        <GradientView name="glass" style={styles.pill}>
          <Text variant="captionMedium" color="#fff">
            👀 How others see you
          </Text>
        </GradientView>
        <View style={styles.spacer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  spacer: { width: 44 },
});
