import React from 'react';
import { KeyboardAvoidingView, ScrollView, StatusBar, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme';
import { GradientView } from './GradientView';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  background?: 'default' | 'soft' | 'romance' | 'premium';
  contentStyle?: StyleProp<ViewStyle>;
  keyboard?: boolean;
  lightStatusBar?: boolean;
}

export const Screen = ({
  children, scroll, edges = ['top', 'bottom'], background = 'default', contentStyle, keyboard, lightStatusBar,
}: ScreenProps) => {
  const { colors, isDark } = useTheme();
  const isHero = background === 'romance' || background === 'premium';

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scroll, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isHero || lightStatusBar || isDark ? 'light-content' : 'dark-content'}
        {...({ backgroundColor: 'transparent', translucent: true } as any)}
      />
      {background === 'soft' && !isDark ? <GradientView name="soft" style={StyleSheet.absoluteFill} /> : null}
      {isDark && background !== 'romance' && background !== 'premium' ? (
        <GradientView name="night" style={StyleSheet.absoluteFill} />
      ) : null}
      {isHero ? <GradientView name={background} style={StyleSheet.absoluteFill} /> : null}
      <SafeAreaView edges={edges} style={styles.flex}>
        {keyboard ? (
          <KeyboardAvoidingView style={styles.flex} behavior="padding">
            {body}
          </KeyboardAvoidingView>
        ) : (
          body
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
});
