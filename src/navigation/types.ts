import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PlanId } from '@/data/models';

export type MainTabParamList = {
  Discover: undefined;
  Picks: undefined;
  Likes: undefined;
  Chats: undefined;
  Profile: undefined;
};

export type PaywallReason = 'likes' | 'superlikes' | 'undo' | 'likes_you' | 'picks' | 'boost' | 'incognito' | 'general';

export type RootStackParamList = {
  // Entry
  Welcome: undefined;
  Login: undefined;
  Otp: { phone: string };
  // Onboarding
  OnbName: undefined;
  OnbGender: undefined;
  OnbIntent: undefined;
  OnbPhotos: undefined;
  OnbInterests: undefined;
  OnbPrompts: undefined;
  OnbLifestyle: undefined;
  OnbVoice: undefined;
  OnbLocation: undefined;
  OnbVerify: undefined;
  OnbAllSet: undefined;
  // App
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  ProfileDetail: { profileId: string; source?: 'deck' | 'picks' | 'likes' | 'chat' };
  Match: { matchId: string };
  ChatRoom: { matchId: string };
  Call: { matchId: string; video: boolean };
  EditProfile: undefined;
  PreviewProfile: undefined;
  Settings: undefined;
  Safety: undefined;
  Notifications: undefined;
  Paywall: { reason?: PaywallReason } | undefined;
  Boost: undefined;
  PurchaseSuccess: { plan?: PlanId; title?: string };
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
