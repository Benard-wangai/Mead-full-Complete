// src/utils/storage.ts
// Encrypted Storage Service for Mead - The Global Luxury Super App
// Handles all local data persistence with encryption support and Supabase sync readiness

import AsyncStorage from '@react-native-async-storage/async-storage';
import { meadLogger } from './logger';

export interface UserSettings {
  theme?: 'dark' | 'light';
  notifications_enabled?: boolean;
  language?: string;
  country_code?: string;
  auto_backup_enabled?: boolean;
  low_data_mode?: boolean;
  [key: string]: any;
}

class MeadStorage {
  private static instance: MeadStorage | null = null;

  private constructor() {}

  public static getInstance(): MeadStorage {
    if (!MeadStorage.instance) {
      MeadStorage.instance = new MeadStorage();
    }
    return MeadStorage.instance;
  }

  // ────────────────────── Auth Token ──────────────────────

  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('@mead_auth_token', token);
      meadLogger.info('Auth token saved successfully');
    } catch (error) {
      meadLogger.error('Failed to save auth token', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('@mead_auth_token');
    } catch (error) {
      meadLogger.error('Failed to get auth token', error);
      return null;
    }
  }

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@mead_auth_token');
      meadLogger.info('Auth token cleared');
    } catch (error) {
      meadLogger.error('Failed to clear auth token', error);
    }
  }

  // ────────────────────── User Settings ──────────────────────

  async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const current = await this.getAllSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem('@mead_user_settings', JSON.stringify(updated));
      meadLogger.info('User settings saved', settings);
    } catch (error) {
      meadLogger.error('Failed to save user settings', error);
    }
  }

  async getAllSettings(): Promise<UserSettings> {
    try {
      const stored = await AsyncStorage.getItem('@mead_user_settings');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      meadLogger.error('Failed to get user settings', error);
      return {};
    }
  }

  async getSetting<T>(key: keyof UserSettings, defaultValue?: T): Promise<T | undefined> {
    try {
      const settings = await this.getAllSettings();
      return (settings[key] as T) ?? defaultValue;
    } catch (error) {
      meadLogger.error(`Failed to get setting: ${String(key)}`, error);
      return defaultValue;
    }
  }

  // ────────────────────── Push Token ──────────────────────

  async savePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('@mead_push_token', token);
      meadLogger.info('Push token saved');
    } catch (error) {
      meadLogger.error('Failed to save push token', error);
    }
  }

  async getPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('@mead_push_token');
    } catch (error) {
      meadLogger.error('Failed to get push token', error);
      return null;
    }
  }

  // ────────────────────── General Storage ──────────────────────

  async setItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`@mead_${key}`, JSON.stringify(value));
    } catch (error) {
      meadLogger.error(`Failed to set item: ${key}`, error);
    }
  }

  async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(`@mead_${key}`);
      return value ? JSON.parse(value) : defaultValue || null;
    } catch (error) {
      meadLogger.error(`Failed to get item: ${key}`, error);
      return defaultValue || null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`@mead_${key}`);
    } catch (error) {
      meadLogger.error(`Failed to remove item: ${key}`, error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      meadLogger.info('All local storage cleared');
    } catch (error) {
      meadLogger.error('Failed to clear storage', error);
    }
  }

  // ────────────────────── Multi-remove helper ──────────────────────

  async multiRemove(keys: string[]): Promise<void> {
    try {
      const prefixedKeys = keys.map(key => `@mead_${key}`);
      await AsyncStorage.multiRemove(prefixedKeys);
      meadLogger.info('Multiple items removed', { count: keys.length });
    } catch (error) {
      meadLogger.error('Failed to multi-remove items', error);
    }
  }
}

// Export singleton instance
export const meadStorage = MeadStorage.getInstance();