// src/components/Button.tsx
// Professional Reusable Button Component for Mead - The Global Luxury Super App
// Supports primary/secondary variants, loading state, custom styles, and full accessibility

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { useTheme } from '../utils/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  iconLeft,
  iconRight,
  fullWidth = true,
  onPress,
  ...restProps
}) => {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...(fullWidth && { width: '100%' }),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.gold,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#1A1A1A',
          borderWidth: 1,
          borderColor: colors.gold + '55',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.gold,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.buttonText,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: '#000000',
        };
      case 'secondary':
      case 'outline':
        return {
          ...baseTextStyle,
          color: colors.gold,
        };
      default:
        return baseTextStyle;
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        isDisabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      {...restProps}
    >
      <View style={styles.contentContainer}>
        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}

        {loading ? (
          <ActivityIndicator 
            color={variant === 'primary' ? '#000000' : colors.gold} 
            size="small" 
          />
        ) : (
          <Text style={[getTextStyle(), textStyle]}>
            {title}
          </Text>
        )}

        {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.65,
  },
});

export default Button;