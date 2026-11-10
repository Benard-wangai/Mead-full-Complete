// src/components/LoadingSpinner.tsx
// Luxury Loading Spinner for Mead - Elegant gold animated spinner with text support
// Used across all 94 files for loading states (uploading, payments, AI responses, Brew posting, etc.)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../utils/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  text,
  style,
  textStyle,
  fullScreen = false,
}) => {
  const { colors } = useTheme();

  const spinnerColor = color || colors.gold;

  const containerStyle = fullScreen 
    ? styles.fullScreenContainer 
    : styles.container;

  return (
    <View style={[containerStyle, style]}>
      <ActivityIndicator 
        size={size} 
        color={spinnerColor} 
        style={styles.spinner}
      />
      
      {text && (
        <Text style={[styles.text, { color: colors.white }, textStyle]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default LoadingSpinner;