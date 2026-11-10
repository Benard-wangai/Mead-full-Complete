// src/components/Input.tsx
// Luxury Input Component for Mead - Black + Gold Imperial Design
// Used across all forms: Login, Signup, BrewCreate, Marketplace, Settings, etc.
// Supports error states, icons, multiline, haptics, and perfect integration with validation.ts

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../utils/theme';
import { tap } from '../utils/haptics';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  onFocus?: () => void;
  onBlur?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  iconLeft,
  iconRight,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    tap();
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.gray }, labelStyle]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error 
              ? colors.ruby 
              : isFocused 
                ? colors.gold 
                : colors.dark,
            backgroundColor: colors.dark,
          },
        ]}
      >
        {iconLeft && (
          <View style={styles.iconLeft}>
            {iconLeft}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            { color: colors.white },
            inputStyle,
          ]}
          placeholderTextColor={colors.gray}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />

        {iconRight && (
          <View style={styles.iconRight}>
            {iconRight}
          </View>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: colors.ruby }, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
});

export default Input;