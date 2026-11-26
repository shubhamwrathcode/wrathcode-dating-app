import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer, Theme as NavTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastHost } from '@/components';
import { useTheme } from '@/core/theme';
import { initRealtime } from '@/domain/chat';
import { SplashScreen } from '@/features/auth';
import { navigationRef } from '@/navigation/navigationRef';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useHydration } from './useHydration';

const AppShell = () => {
  const { colors, isDark } = useTheme();
  const hydrated = useHydration();
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    initRealtime();
  }, []);

  const navTheme = useMemo<NavTheme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.primary,
      },
    };
  }, [isDark, colors]);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {hydrated ? (
        <NavigationContainer ref={navigationRef} theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      ) : null}
      {!splashDone ? <SplashScreen ready={hydrated} onFinish={finishSplash} /> : null}
      <ToastHost />
    </View>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AppShell />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
