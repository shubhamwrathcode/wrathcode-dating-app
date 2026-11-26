import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Chip, Header, Input, PhotoGrid, Row, Screen, Section, Text } from '@/components';
import { INTENTS, INTEREST_OPTIONS, INTERESTS_MAX, INTERESTS_MIN, PHOTOS_MIN } from '@/core/constants';
import { haptics } from '@/core/services/haptics';
import { useTheme } from '@/core/theme';
import { delay } from '@/core/utils';
import { CurrentUser } from '@/data/models';
import { pickerGallery } from '@/data/mock/photos';
import { LifestyleForm, PromptEditor } from '@/features/onboarding';
import { useSessionStore } from '@/store/useSessionStore';
import { toast } from '@/store/useToastStore';
import { profileCompleteness } from '../viewmodels/useProfileViewModels';

const Block = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <View style={styles.block}>
    <Text variant="h3">{title}</Text>
    {hint ? (
      <Text variant="caption" muted style={styles.hint}>
        {hint}
      </Text>
    ) : null}
    <View style={styles.blockBody}>{children}</View>
  </View>
);

export const EditProfileScreen = () => {
  const nav = useNavigation();
  const { colors } = useTheme();
  const user = useSessionStore(s => s.user)!;
  const updateUser = useSessionStore(s => s.updateUser);
  const [draft, setDraft] = useState<CurrentUser>(user);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);

  const set = (patch: Partial<CurrentUser>) => setDraft(d => ({ ...d, ...patch }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(user);
  const valid = draft.photos.length >= PHOTOS_MIN && draft.interests.length >= INTERESTS_MIN && draft.prompts.length >= 3;
  const score = profileCompleteness(draft).score;

  const save = async () => {
    setSaving(true);
    await delay(500);
    updateUser(draft);
    haptics.success();
    toast.success('Profile updated', `Profile strength ${score}%`);
    setSaving(false);
    nav.goBack();
  };

  const recordVoice = async () => {
    setRecording(true);
    await delay(1600);
    set({ voiceIntroSec: 13 });
    setRecording(false);
    toast.success('Voice intro saved 🎤');
  };

  return (
    <Screen keyboard edges={['top', 'bottom']}>
      <Header
        title="Edit profile"
        subtitle={`Profile strength ${score}%`}
        right={<Button title="Save" size="sm" onPress={save} disabled={!dirty || !valid} loading={saving} />}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Block title="Photos" hint="2–6 photos. Long-press and drag to reorder.">
          <PhotoGrid photos={draft.photos} onChange={photos => set({ photos })} gallery={pickerGallery(draft.gender)} />
        </Block>

        <Block title="About you">
          <Input
            value={draft.bio}
            onChangeText={bio => set({ bio: bio.slice(0, 300) })}
            placeholder="A few lines about who you are and what you’re looking for"
            multiline
            style={styles.multiline}
            hint={`${draft.bio.length}/300`}
          />
        </Block>

        <Block title="Looking for" hint="Shown as a badge on your profile">
          <View style={styles.wrap}>
            {INTENTS.map(i => (
              <Chip key={i.id} emoji={i.emoji} label={i.label} selected={draft.intent === i.id} onPress={() => set({ intent: i.id })} />
            ))}
          </View>
        </Block>

        <Block title="Prompts">
          <PromptEditor prompts={draft.prompts} onChange={prompts => set({ prompts })} />
        </Block>

        <Block title="Interests" hint={`${draft.interests.length}/${INTERESTS_MAX} · pick at least ${INTERESTS_MIN}`}>
          <View style={styles.wrap}>
            {INTEREST_OPTIONS.map(o => {
              const sel = draft.interests.includes(o);
              return (
                <Chip
                  key={o}
                  size="sm"
                  label={o}
                  selected={sel}
                  disabled={!sel && draft.interests.length >= INTERESTS_MAX}
                  onPress={() => set({ interests: sel ? draft.interests.filter(x => x !== o) : [...draft.interests, o] })}
                />
              );
            })}
          </View>
        </Block>

        <Block title="Voice & video">
          <Section>
            <Row
              icon="mic"
              title={draft.voiceIntroSec ? `Voice intro · ${draft.voiceIntroSec}s` : 'Add a voice intro'}
              subtitle={recording ? 'Recording…' : '15 seconds to say hi'}
              onPress={recording ? undefined : recordVoice}
            />
            <Row
              icon="video"
              title={draft.videoPrompt ? 'Video prompt added' : 'Add a 30s video prompt'}
              subtitle="Show your vibe in motion"
              toggle={!!draft.videoPrompt}
              onToggle={videoPrompt => set({ videoPrompt })}
              last
            />
          </Section>
        </Block>

        <Block title="Lifestyle">
          <LifestyleForm value={draft.lifestyle} onChange={lifestyle => set({ lifestyle })} values={draft.values} onValues={values => set({ values })} />
        </Block>

        <Block title="Family mode" hint="For matrimony: let a parent or guardian co-manage your profile">
          <Section>
            <Row icon="users" title="Family mode" subtitle="Invite a family member to suggest matches" toggle={!!draft.familyMode} onToggle={familyMode => set({ familyMode })} last />
          </Section>
        </Block>

        {!valid ? (
          <Text variant="caption" color={colors.error} center>
            Add at least {PHOTOS_MIN} photos, {INTERESTS_MIN} interests and 3 prompts to save.
          </Text>
        ) : null}
        <Button title="Save changes" onPress={save} disabled={!dirty || !valid} loading={saving} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48 },
  block: { marginBottom: 28 },
  hint: { marginTop: 4 },
  blockBody: { marginTop: 14 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
