import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSessionStore } from '@/store/useSessionStore';
import { LoginScreen, OtpScreen, WelcomeScreen } from '@/features/auth';
import {
  AllSetScreen, GenderScreen, IntentScreen, InterestsScreen, LifestyleScreen, LocationScreen,
  NameDobScreen, PhotosScreen, PromptsScreen, VerificationScreen, VoiceIntroScreen,
} from '@/features/onboarding';
import { DiscoverScreen, MatchScreen, ProfileDetailScreen } from '@/features/discover';
import { DailyPicksScreen, LikesYouScreen } from '@/features/picks';
import { CallScreen, ChatRoomScreen, ChatsListScreen } from '@/features/chat';
import {
  EditProfileScreen, MyProfileScreen, NotificationsScreen, PreviewProfileScreen, SettingsScreen,
} from '@/features/profile';
import { SafetyCentreScreen } from '@/features/safety';
import { BoostScreen, PaywallScreen, PurchaseSuccessScreen } from '@/features/premium';
import { CustomTabBar } from './CustomTabBar';
import { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, lazy: true }} tabBar={props => <CustomTabBar {...props} />}>
    <Tab.Screen name="Discover" component={DiscoverScreen} />
    <Tab.Screen name="Picks" component={DailyPicksScreen} />
    <Tab.Screen name="Likes" component={LikesYouScreen} />
    <Tab.Screen name="Chats" component={ChatsListScreen} />
    <Tab.Screen name="Profile" component={MyProfileScreen} />
  </Tab.Navigator>
);

/**
 * Auth-state driven navigation: guest → onboarding → app.
 * Switching groups resets history, so back never leaks into a finished flow.
 */
export const RootNavigator = () => {
  const status = useSessionStore(s => s.status);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true }}>
      {status === 'guest' ? (
        <Stack.Group screenOptions={{ animation: 'fade_from_bottom' }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Otp" component={OtpScreen} options={{ animation: 'slide_from_right' }} />
        </Stack.Group>
      ) : status === 'onboarding' ? (
        <Stack.Group>
          <Stack.Screen name="OnbName" component={NameDobScreen} />
          <Stack.Screen name="OnbGender" component={GenderScreen} />
          <Stack.Screen name="OnbIntent" component={IntentScreen} />
          <Stack.Screen name="OnbPhotos" component={PhotosScreen} options={{ animation: 'none' }} />
          <Stack.Screen name="OnbInterests" component={InterestsScreen} />
          <Stack.Screen name="OnbPrompts" component={PromptsScreen} />
          <Stack.Screen name="OnbLifestyle" component={LifestyleScreen} />
          <Stack.Screen name="OnbVoice" component={VoiceIntroScreen} />
          <Stack.Screen name="OnbLocation" component={LocationScreen} />
          <Stack.Screen name="OnbVerify" component={VerificationScreen} />
          <Stack.Screen name="OnbAllSet" component={AllSetScreen} options={{ animation: 'fade', gestureEnabled: false }} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
          <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Match" component={MatchScreen} options={{ animation: 'fade', presentation: 'transparentModal', gestureEnabled: false }} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
          <Stack.Screen name="Call" component={CallScreen} options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="PreviewProfile" component={PreviewProfileScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Safety" component={SafetyCentreScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Boost" component={BoostScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="PurchaseSuccess" component={PurchaseSuccessScreen} options={{ animation: 'fade', gestureEnabled: false }} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};
