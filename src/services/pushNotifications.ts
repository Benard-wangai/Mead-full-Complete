// src/services/pushNotifications.ts
// Push Notifications Service for Mead - The Global Luxury Super App
// Fixed permission handling with correct Expo Notifications types

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { supabase } from '../utils/supabaseClient';
import { meadLogger } from '../utils/logger';

export class PushNotificationsService {
  private static instance: PushNotificationsService | null = null;

  private constructor() {}

  public static getInstance(): PushNotificationsService {
    if (!PushNotificationsService.instance) {
      PushNotificationsService.instance = new PushNotificationsService();
    }
    return PushNotificationsService.instance;
  }

  /**
   * Initialize push notifications - Main entry point
   */
  async initialize(): Promise<void> {
    try {
      // Configure how notifications are shown when app is in foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Request permissions safely
      const permissionResponse = await Notifications.requestPermissionsAsync();

      // Correct way to access status
      const status = permissionResponse.status;

      if (status !== 'granted') {
        meadLogger.warn('Push notification permission not granted', { status });
        
        if (Platform.OS === 'ios') {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications in Settings for the best Mead experience.',
            [{ text: 'OK' }]
          );
        }
        return;
      }

      // Get and save push token
      const token = await this.registerForPushNotificationsAsync();
      
      if (token) {
        await this.savePushTokenToSupabase(token);
        meadLogger.info('Push notifications initialized successfully');
      }

    } catch (error: any) {
      meadLogger.error('Push notifications initialization failed', { 
        error: error.message 
      });
      console.warn('[PushNotifications] Error:', error.message);
    }
  }

  /**
   * Register for push token
   */
  private async registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
      meadLogger.warn('Push notifications are only supported on physical devices');
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId 
        ?? Constants.expoConfig?.slug;

      if (!projectId) {
        meadLogger.warn('Project ID not found for push token');
        return null;
      }

      const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
      return data;
    } catch (error: any) {
      meadLogger.error('Failed to get Expo push token', { error: error.message });
      return null;
    }
  }

  /**
   * Save push token to user profile in Supabase
   */
  private async savePushTokenToSupabase(token: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.id) {
        meadLogger.warn('No authenticated user found to save push token');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          push_token: token,
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);

      if (error) {
        meadLogger.error('Failed to save push token to Supabase', { error: error.message });
      } else {
        meadLogger.info('Push token saved to Supabase successfully');
      }
    } catch (error: any) {
      meadLogger.error('Error updating push token in database', { error: error.message });
    }
  }

  /**
   * Setup notification listeners (call this once in App.tsx)
   */
  setupNotificationListeners() {
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      meadLogger.info('Notification received while app is open', {
        title: notification.request.content.title
      });
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      meadLogger.info('User tapped on notification', {
        title: response.notification.request.content.title,
        action: response.actionIdentifier
      });
      // Add navigation logic here later if needed
    });

    // Return cleanup function
    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }

  /**
   * Send a test push notification (useful for debugging)
   */
  async sendTestNotification(title: string = "Mead", body: string = "Welcome back to luxury") {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real app, you would fetch the user's push_token from profiles
      meadLogger.info('Test notification triggered', { title, body });
    } catch (error) {
      meadLogger.error('Failed to send test notification', error);
    }
  }
}

// Export the singleton instance
export const pushNotificationsService = PushNotificationsService.getInstance();