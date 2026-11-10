// Luxury animated splash — black canvas, gold typography, subtle entrance

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Image,
  Easing,
} from 'react-native';
import AppConfig from '../constants/appConfig';
import { colors, typography, spacing } from '../utils/theme';

interface LuxurySplashProps {
  visible?: boolean;
}

export default function LuxurySplash({ visible = true }: LuxurySplashProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [visible, fade, scale, shimmer]);

  if (!visible) return null;

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      <Animated.View
        style={[
          styles.content,
          { opacity: fade, transform: [{ scale }] },
        ]}
      >
        <Image
          source={require('../../assets/logo-gold.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Mead logo"
        />
        <Animated.Text style={[styles.title, { opacity: shimmerOpacity }]}>
          {AppConfig.APP_NAME}
        </Animated.Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>{AppConfig.APP_TAGLINE}</Text>
        <Text style={styles.version}>{AppConfig.getFullVersion()}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.display,
    fontFamily: typography.fontFamily.bold,
    color: colors.gold,
    letterSpacing: 10,
  },
  divider: {
    width: 64,
    height: 2,
    backgroundColor: colors.gold,
    marginVertical: spacing.md,
    opacity: 0.85,
  },
  tagline: {
    fontSize: typography.bodyLg,
    color: colors.white,
    opacity: 0.92,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  version: {
    marginTop: spacing.xl,
    fontSize: typography.caption,
    color: colors.gray,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
