import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useShallow } from 'zustand/react/shallow';
import { BottomSheet, Button, Chip, Header, Input, PlanBadge, Row, Screen, Section, Text } from '@/components';
import { APP_NAME, PLANS } from '@/core/constants';
import { useT } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { formatPhone } from '@/core/utils';
import { deleteAccount, signOut } from '@/domain/session';
import { RootStackParamList } from '@/navigation/types';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useSessionStore } from '@/store/useSessionStore';
import { ThemeMode, useSettingsStore } from '@/store/useSettingsStore';
import { toast } from '@/store/useToastStore';

export const SettingsScreen = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const t = useT();
  const { colors } = useTheme();
  const user = useSessionStore(s => s.user)!;
  const plan = usePremiumStore(s => s.plan);
  const renewsAt = usePremiumStore(s => s.renewsAt);
  const s = useSettingsStore(
    useShallow(x => ({
      themeMode: x.themeMode, language: x.language, notifications: x.notifications, privacy: x.privacy,
      incognito: x.incognito, paused: x.paused, setThemeMode: x.setThemeMode, setLanguage: x.setLanguage,
      setNotification: x.setNotification, setPrivacy: x.setPrivacy, setIncognito: x.setIncognito, setPaused: x.setPaused,
    })),
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [logoutOpen, setLogoutOpen] = useState(false);

  const themes: { id: ThemeMode; label: string }[] = [
    { id: 'system', label: 'System' },
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
  ];

  return (
    <Screen>
      <Header title={t('settings.title')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section title="Account">
          <Row icon="phone" title="Phone number" value={user.phone ? formatPhone(user.phone) : 'Not added'} />
          <Row
            icon="crown"
            title={`${PLANS[plan].name} plan`}
            subtitle={renewsAt ? `Renews ${new Date(renewsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Upgrade for unlimited likes & more'}
            right={<PlanBadge plan={plan} />}
            onPress={() => nav.navigate('Paywall', { reason: 'general' })}
            last
          />
        </Section>

        <Section title="Discovery">
          <Row icon="sliders" title="Discovery preferences" subtitle="Age, distance, intent, verified-only" onPress={() => nav.navigate('Main', { screen: 'Discover' })} />
          <Row icon="eye" title="Show my distance" toggle={s.privacy.showDistance} onToggle={v => s.setPrivacy('showDistance', v)} />
          <Row
            icon="eyeOff"
            title="Incognito mode"
            subtitle="Only people you like can see you"
            locked={plan !== 'platinum'}
            toggle={s.incognito}
            onToggle={v => (plan === 'platinum' ? s.setIncognito(v) : nav.navigate('Paywall', { reason: 'incognito' }))}
          />
          <Row icon="pause" title="Pause my account" subtitle="Hide from Discover, keep your matches" toggle={s.paused} onToggle={s.setPaused} last />
        </Section>

        <Section title="Notifications" footer="Push notifications use Firebase Cloud Messaging in production.">
          <Row icon="heart" title="New matches" toggle={s.notifications.matches} onToggle={v => s.setNotification('matches', v)} />
          <Row icon="message" title="Messages" toggle={s.notifications.messages} onToggle={v => s.setNotification('messages', v)} />
          <Row icon="star" title="Likes" toggle={s.notifications.likes} onToggle={v => s.setNotification('likes', v)} />
          <Row icon="sparkles" title="Daily Picks ready" toggle={s.notifications.dailyPicks} onToggle={v => s.setNotification('dailyPicks', v)} />
          <Row icon="gift" title="Offers & updates" toggle={s.notifications.promotions} onToggle={v => s.setNotification('promotions', v)} last />
        </Section>

        <Section title="Privacy">
          <Row icon="users" title="Show online status" toggle={s.privacy.showOnline} onToggle={v => s.setPrivacy('showOnline', v)} />
          <Row icon="checks" title="Read receipts" toggle={s.privacy.readReceipts} onToggle={v => s.setPrivacy('readReceipts', v)} />
          <Row icon="lock" title="Slow reveal" subtitle="Blur photos until 10 messages are exchanged" toggle={s.privacy.slowReveal} onToggle={v => s.setPrivacy('slowReveal', v)} last />
        </Section>

        <Section title="Appearance & language">
          <View style={styles.pad}>
            <Text variant="captionMedium" muted>
              Theme
            </Text>
            <View style={styles.chips}>
              {themes.map(th => (
                <Chip key={th.id} size="sm" label={th.label} icon={th.id === 'dark' ? 'moon' : th.id === 'light' ? 'sun' : undefined} selected={s.themeMode === th.id} onPress={() => s.setThemeMode(th.id)} />
              ))}
            </View>
            <Text variant="captionMedium" muted style={styles.mt}>
              Language
            </Text>
            <View style={styles.chips}>
              <Chip size="sm" label="English" selected={s.language === 'en'} onPress={() => s.setLanguage('en')} />
              <Chip size="sm" label="हिन्दी" selected={s.language === 'hi'} onPress={() => s.setLanguage('hi')} />
            </View>
          </View>
        </Section>

        <Section title="Help & safety">
          <Row icon="shieldCheck" title={t('safety.title')} onPress={() => nav.navigate('Safety')} />
          <Row icon="info" title="Community guidelines" onPress={() => toast.info('Community guidelines', 'Be kind, be real, be safe.')} />
          <Row icon="refresh" title="Restore purchases" onPress={() => toast.info('No purchases to restore')} last />
        </Section>

        <Section>
          <Row icon="logout" title="Log out" onPress={() => setLogoutOpen(true)} />
          <Row icon="trash" title="Delete account" danger onPress={() => setDeleteOpen(true)} last />
        </Section>

        <Text variant="micro" muted center>
          {APP_NAME} v1.0.0 · Demo build by Wrathcode Technology
        </Text>
      </ScrollView>

      <BottomSheet visible={logoutOpen} onClose={() => setLogoutOpen(false)} title="Log out?" subtitle="Your profile and matches will be here when you come back.">
        <View style={styles.sheetBtns}>
          <Button title="Log out" onPress={signOut} />
          <Button title={t('common.cancel')} variant="ghost" onPress={() => setLogoutOpen(false)} />
        </View>
      </BottomSheet>

      <BottomSheet
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        subtitle="This permanently deletes your profile, photos, matches and messages. This can’t be undone.">
        <View style={styles.sheetBtns}>
          <Button title="Pause instead" variant="outline" onPress={() => { s.setPaused(true); setDeleteOpen(false); toast.info('Account paused', 'You’re hidden from Discover.'); }} />
          <Input value={confirmText} onChangeText={setConfirmText} placeholder="Type DELETE to confirm" autoCapitalize="characters" />
          <Button
            title="Delete permanently"
            variant="danger"
            disabled={confirmText.trim() !== 'DELETE'}
            onPress={async () => {
              setDeleteOpen(false);
              await deleteAccount();
            }}
          />
          <Text variant="micro" color={colors.textSecondary} center>
            Data is erased in line with the DPDP Act 2023 and app-store deletion requirements.
          </Text>
        </View>
      </BottomSheet>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  pad: { padding: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  mt: { marginTop: 16 },
  sheetBtns: { gap: 12 },
});
