// Central Application Configuration for Mead - reads from environment

import ENV, {
  API_BASE_URL,
  APP_VERSION,
  DEFAULT_COUNTRY_CODE,
  PAYSTACK_PLANS,
  PAYSTACK_PUBLIC_KEY,
  PUBLIC_WEB_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  XAI_API_KEY,
} from '../utils/env';

const AppConfig = {
  APP_NAME: ENV.APP_NAME,
  APP_TAGLINE: 'The Global Luxury Super App',
  APP_DESCRIPTION: 'Where connections are exclusive and experiences are extraordinary',
  APP_VERSION,
  BUILD_NUMBER: '20260507',

  IS_PRODUCTION: ENV.ENVIRONMENT === 'production',

  API_BASE_URL,

  /** Marketing site + universal links (meadtechnologies.com) */
  PUBLIC_WEB_URL,

  SUPABASE: {
    URL: SUPABASE_URL,
    ANON_KEY: SUPABASE_ANON_KEY,
  } as const,

  PAYSTACK: {
    PUBLIC_KEY: PAYSTACK_PUBLIC_KEY,
  } as const,

  XAI: {
    API_KEY: XAI_API_KEY,
  } as const,

  PAYSTACK_PLANS,

  FEATURES: {
    ENABLE_BREWS: true,
    ENABLE_REELS: true,
    ENABLE_LIVE_STREAMING: true,
    ENABLE_MARKETPLACE: true,
    ENABLE_MEAD_AI: true,
    ENABLE_GROUPS: true,
    ENABLE_VOTING: true,
    ENABLE_P2P_PAYMENTS: true,
    ENABLE_ESCROW: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_GEO_TARGETING: true,
    ENABLE_MUSIC_LIBRARY: true,
    ENABLE_MOVIES_TV: true,
    ENABLE_MEAD_TOGETHER: true,
    ENABLE_ADS_UP: true,
  } as const,

  LIMITS: {
    MAX_GROUP_MEMBERS: 10000,
    MAX_MEGA_GROUP_MEMBERS: 10000000,
    MAX_BREW_TARGET_COUNTRIES: 15,
    MAX_CHAT_MEMBERS: 500,
    MAX_TOGETHER_PARTICIPANTS: 500,
    FREE_AI_REPLIES_PER_DAY: 10,
    MAX_REEL_DURATION_SECONDS: 90,
  } as const,

  PRICING: {
    BREW_COST: 1,
    MEGA_GROUP_UPGRADE: 10,
    SELLER_VERIFICATION: 5,
    AUDIO_CALLS_PRO_6MONTHS: 2,
    VIDEO_CALLS_PRO_6MONTHS: 5,
    MEAD_AI_UNLIMITED_MONTHLY: 5,
    MARKETPLACE_COMMISSION: 0.02,
  } as const,

  UI: {
    DEFAULT_RADIUS: 20,
    GOLD_COLOR: '#FFD700',
    BLACK_COLOR: '#000000',
    DARK_BG: '#111111',
    SPLASH_DURATION: 2800,
    ANIMATION_DURATION: 420,
  } as const,

  DEFAULT_LANGUAGE: 'en',
  DEFAULT_COUNTRY_CODE,

  SUPPORTED_LANGUAGES: ['en', 'sw', 'fr', 'ar', 'zh', 'es', 'pt'] as const,

  STORAGE_KEYS: {
    AUTH_TOKEN: '@mead_auth_token',
    USER_PROFILE: '@mead_user_profile',
    PUSH_TOKEN: '@mead_push_token',
    OFFLINE_QUEUE: '@mead_offline_queue',
    LANGUAGE: '@mead_language',
    THEME: '@mead_theme',
    LAST_BACKUP: '@mead_last_backup',
  } as const,

  // eslint-disable-next-line no-undef
  LOG_LEVEL: (__DEV__ ? 'debug' : 'info') as 'debug' | 'info' | 'warn' | 'error',

  getFullVersion(): string {
    return `${this.APP_VERSION} (${this.BUILD_NUMBER})`;
  },

  isFeatureEnabled(feature: keyof typeof this.FEATURES): boolean {
    return this.FEATURES[feature];
  },

  getPricing(key: keyof typeof this.PRICING): number {
    return this.PRICING[key];
  },

  getPlanCode(feature: string): string | null {
    const plans = this.PAYSTACK_PLANS;
    const key = Object.keys(plans).find((k) =>
      k.toLowerCase().includes(feature.toLowerCase())
    );
    return key ? (plans as Record<string, string>)[key] : null;
  },
} as const;

export type AppConfigType = typeof AppConfig;

export default AppConfig;
