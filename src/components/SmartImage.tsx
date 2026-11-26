import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GradientView } from './GradientView';
import { Text } from './Text';

interface Props {
  uri?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  /** Used for the fallback monogram if the photo fails to load. */
  name?: string;
  blurRadius?: number;
}

/** Remote image with fade-in, blush placeholder and a gradient monogram fallback. */
export const SmartImage = ({ uri, style, imageStyle, name, blurRadius }: Props) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      {!loaded || failed || !uri ? (
        <GradientView name={failed || !uri ? 'romance' : 'soft'} style={[StyleSheet.absoluteFill, styles.center]}>
          {(failed || !uri) && name ? (
            <Text variant="h1" color="rgba(255,255,255,0.9)">
              {name.charAt(0)}
            </Text>
          ) : null}
        </GradientView>
      ) : null}
      {uri && !failed ? (
        <Animated.View entering={FadeIn.duration(250)} style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri }}
            style={[StyleSheet.absoluteFill, imageStyle]}
            resizeMode="cover"
            blurRadius={blurRadius}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
