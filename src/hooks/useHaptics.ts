// src/hooks/useHaptics.ts
// Haptics Hook for Mead - The Global Luxury Super App
// Production-ready with multiple feedback types, safety checks, and luxury feel

import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type HapticType = 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'tap';

const useHaptics = () => {

  const trigger = useCallback(async (type: HapticType = 'light') => {
    // Skip haptics in web or if device doesn't support
    if (Platform.OS === 'web') return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'tap':
          await Haptics.selectionAsync();
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Silent fail - haptics are enhancement, not critical
      console.debug('Haptics failed:', error);
    }
  }, []);

  // Common luxury interactions
  const tap = useCallback(() => trigger('tap'), [trigger]);
  const successTap = useCallback(() => trigger('success'), [trigger]);
  const errorTap = useCallback(() => trigger('error'), [trigger]);
  const heavyTap = useCallback(() => trigger('heavy'), [trigger]);

  return {
    trigger,
    tap,
    successTap,
    errorTap,
    heavyTap,
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    heavy: () => trigger('heavy'),
  };
};

export default useHaptics;