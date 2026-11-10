// Supabase Client for Mead - secure, realtime-ready

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';
import { meadLogger } from './logger';

const PLACEHOLDER_MARKERS = ['my-supabase', 'your-project', 'your-supabase'];

function isConfigured(value: string): boolean {
  return Boolean(value) && !PLACEHOLDER_MARKERS.some((m) => value.includes(m));
}

if (!isConfigured(SUPABASE_URL)) {
  meadLogger.warn(
    'Supabase URL is not configured. Set EXPO_PUBLIC_SUPABASE_URL in .env'
  );
}

if (!isConfigured(SUPABASE_ANON_KEY)) {
  meadLogger.warn(
    'Supabase anon key is not configured. Set EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

const supabaseUrl =
  SUPABASE_URL || 'https://kawqtpsqjxauvfeazbpo.supabase.co';
const supabaseAnonKey =
  SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthd3F0cHNxanhhdXZmZWF6YnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODMzMDEsImV4cCI6MjA5MjM1OTMwMX0.ZGQieErZPXX-hWNgx9GlcwEcHLHkQ-rivpN-czSFpBg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    meadLogger.error('Failed to get current user', { error: message });
    return null;
  }
};

export const getCurrentSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    meadLogger.error('Failed to get session', { error: message });
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    meadLogger.info('User signed out successfully');
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    meadLogger.error('Sign out failed', { error: message });
    return false;
  }
};

export const subscribeToTable = (
  table: string,
  callback: (payload: unknown) => void,
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE' = '*'
) => {
  return supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes' as 'system',
      { event, schema: 'public', table },
      (payload: { eventType: string }) => {
        meadLogger.info(`Realtime ${payload.eventType} on ${table}`);
        callback(payload);
      }
    )
    .subscribe();
};

export default supabase;
