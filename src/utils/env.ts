// src/utils/env.ts
// Centralized Environment Configuration for Mead - The Global Luxury Super App
// This file safely loads keys from .env and provides fallbacks + validation

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Helper to get environment variables with proper Expo support
const getEnvVar = (key: string, fallback: string = ''): string => {
  // Priority: Expo Constants (app.json extra) > process.env > fallback
  const value = 
    Constants.expoConfig?.extra?.[key] || 
    // eslint-disable-next-line no-undef
    (process as any).env?.[key] || 
    fallback;

  // eslint-disable-next-line no-undef
  if (!value && __DEV__) {
    console.warn(`[ENV] Missing value for ${key}. Using fallback or empty.`);
  }

  return value;
};

// ================================================
// MEAD ENVIRONMENT CONFIGURATION
// ================================================
const ENV = {
  // === Supabase (Core Backend) ===
  SUPABASE_URL: getEnvVar(
    'EXPO_PUBLIC_SUPABASE_URL',
    'https://kawqtpsqjxauvfeazbpo.supabase.co'
  ),
  SUPABASE_ANON_KEY: getEnvVar(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthd3F0cHNxanhhdXZmZWF6YnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODMzMDEsImV4cCI6MjA5MjM1OTMwMX0.ZGQieErZPXX-hWNgx9GlcwEcHLHkQ-rivpN-czSFpBg'
  ),

  // === Paystack (Payments & Escrow) ===
  PAYSTACK_PUBLIC_KEY: getEnvVar('EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY', ''),

  // === xAI / Grok for Mead AI ===
  XAI_API_KEY: getEnvVar('EXPO_PUBLIC_XAI_API_KEY', 'my-xai-api-key'),

  // === Escrow Account ===
  ESCROW_ACCOUNT: getEnvVar('PAYSTACK_ESCROW_ACCOUNT', 'ACCT_ijlilx7syjt3ob6'),

  // === Paystack Product & Plan Codes ===
  PAYSTACK_PLANS: {
    MEGA_GROUP_UPGRADE: getEnvVar('PAYSTACK_MEGA_GROUP_UPGRADE', 'PROD_p9kyqo31en0s7fx'),
    POST_MEAD_BREW: getEnvVar('PAYSTACK_POST_MEAD_BREW', 'PROD_ggoitv57n0ugsbx'),
    MEAD_VIDEO_CALL_PRO: getEnvVar('PAYSTACK_MEAD_VIDEO_CALL_PRO', 'PROD_4v8uceh4eo7qjcb'),
    MEAD_SELLER_VERIFICATION: getEnvVar('PAYSTACK_MEAD_SELLER_VERIFICATION', 'PROD_j161xx3vf9ak1x4'),
    MEAD_AUDIO_CALLS_PRO: getEnvVar('PAYSTACK_MEAD_AUDIO_CALLS_PRO', 'PROD_693fbkj4khasbl6'),
    GAMING_PRO: getEnvVar('PAYSTACK_GAMING_PRO', 'PLN_xjoy7qzpuck7prd'),
    MEAD_AI_PLAN: getEnvVar('PAYSTACK_MEAD_AI_PLAN', 'PLN_8zq0dkme0ltzp1w'),
  },

  // === App Configuration ===
  APP_VERSION: getEnvVar('EXPO_PUBLIC_APP_VERSION', '1.0.0'),
  APP_NAME: getEnvVar('EXPO_PUBLIC_APP_NAME', 'Mead'),
  // eslint-disable-next-line no-undef
  ENVIRONMENT: getEnvVar('EXPO_PUBLIC_ENVIRONMENT', __DEV__ ? 'development' : 'production'),
  /** Public website (deep links, marketing, support) */
  PUBLIC_WEB_URL: getEnvVar(
    'EXPO_PUBLIC_WEB_URL',
    'https://meadtechnologies.com'
  ),

  API_BASE_URL: getEnvVar(
    'EXPO_PUBLIC_API_BASE_URL',
    // eslint-disable-next-line no-undef
    __DEV__
      ? Platform.OS === 'android'
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000'
      : 'https://api.meadtechnologies.com'
  ),

  // === Default Country Code (for global signup) ===
  DEFAULT_COUNTRY_CODE: getEnvVar('EXPO_PUBLIC_DEFAULT_COUNTRY_CODE', '254'),

  // === Feature Flags ===
  ENABLE_MEAD_AI: true,
  ENABLE_ESCROW: true,
  ENABLE_GEO_BREWS: true,
  ENABLE_OFFLINE_QUEUE: true,
} as const;

// Type-safe getter with validation
export const getEnv = (key: keyof typeof ENV): string | number | boolean | object => {
  const value = ENV[key];

  if (value === undefined || value === '') {
    // eslint-disable-next-line no-undef
    if (__DEV__) {
      console.warn(`[ENV WARNING] ${key} is not set. Check your .env or app.json`);
    }
  }

  return value;
};

// Export individual constants for easy import
export const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  PAYSTACK_PUBLIC_KEY,
  XAI_API_KEY,
  ESCROW_ACCOUNT,
  PAYSTACK_PLANS,
  APP_VERSION,
  ENVIRONMENT,
  API_BASE_URL,
  PUBLIC_WEB_URL,
  DEFAULT_COUNTRY_CODE,
} = ENV;

export default ENV;