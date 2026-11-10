// src/utils/haptics.ts
// Haptic Feedback System for Mead - The Global Luxury Super App
// Premium tactile experience with full safety, consistency, and luxury feel

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Safe haptic trigger wrapper
 */
const trigger = (action: () => void | Promise<void>) => {
  if (!isSupported) return;

  try {
    const result = action();
    if (result instanceof Promise) {
      result.catch((err) => {
        console.debug('Haptic promise rejected:', err);
      });
    }
  } catch (error) {
    // Silent fail - haptics are enhancement, not critical
    console.debug('Haptics unavailable:', error);
  }
};

/* ==================== BASIC HAPTICS ==================== */

export const tap = () => trigger(() => 
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
);

export const mediumTap = () => trigger(() => 
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
);

export const heavyTap = () => trigger(() => 
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
);

export const successTap = () => trigger(() => 
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
);

export const warningTap = () => trigger(() => 
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
);

export const errorTap = () => trigger(() => 
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
);

export const selectionTap = () => trigger(() => 
  Haptics.selectionAsync()
);

/* ==================== LUXURY COMBINATIONS ==================== */

export const confirmTap = async () => {
  trigger(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  setTimeout(() => successTap(), 80);
};

export const dangerTap = async () => {
  trigger(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  setTimeout(() => errorTap(), 100);
};

export const longPressHaptic = async () => {
  trigger(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  setTimeout(() => mediumTap(), 60);
};

/* ==================== UTILITY ==================== */

/**
 * Execute any haptic function safely
 */
export const safeHaptic = (hapticFn: () => void | Promise<void>) => {
  trigger(hapticFn);
};

export default {
  tap,
  mediumTap,
  heavyTap,
  successTap,
  warningTap,
  errorTap,
  selectionTap,
  confirmTap,
  dangerTap,
  longPressHaptic,
  safeHaptic,
};