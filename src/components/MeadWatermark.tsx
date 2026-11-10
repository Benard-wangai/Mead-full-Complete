// src/components/MeadWatermark.tsx
// Animated Luxury Gold Watermark for Mead
// Fully supports custom style prop + bouncing + golden sparkles

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../utils/theme';

interface MeadWatermarkProps {
  style?: ViewStyle;
  opacity?: number;
  size?: 'small' | 'medium' | 'large';
}

const MeadWatermark: React.FC<MeadWatermarkProps> = ({
  style,
  opacity = 0.28,
  size = 'medium',
}) => {
  useTheme();

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Bouncing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.08,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Gentle rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 26000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Golden sparkles
    sparkAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 700 + index * 100, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    });
  }, [bounceAnim, rotateAnim, sparkAnims]);

  const getFontSize = () => {
    switch (size) {
      case 'small': return 48;
      case 'large': return 82;
      default: return 62;
    }
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <Animated.View
        style={{
          transform: [
            { scale: bounceAnim },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['-8deg', '8deg'],
              }),
            },
          ],
        }}
      >
        <View style={styles.watermarkContent}>
          <Ionicons 
            name="diamond" 
            size={getFontSize() * 0.7} 
            color="#FFD700" 
            style={styles.icon} 
          />
          <Text style={[styles.watermarkText, { fontSize: getFontSize(), opacity }]}>
            MEAD
          </Text>
        </View>
      </Animated.View>

      {/* Golden Sparkles */}
      {sparkAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.spark,
            {
              opacity: anim,
              transform: [{ scale: anim }],
              left: 35 + (index % 3) * 18,
              bottom: 38 + Math.floor(index / 3) * 12,
            },
          ]}
        >
          <Ionicons name="sparkles" size={14} color="#FFEEB3" />
        </Animated.View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    zIndex: 999,
    pointerEvents: 'none',
  },
  watermarkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#FFD70044',
  },
  icon: {
    marginRight: 10,
  },
  watermarkText: {
    fontFamily: 'Imperial-Bold',
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 6,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  spark: {
    position: 'absolute',
  },
});

export default MeadWatermark;