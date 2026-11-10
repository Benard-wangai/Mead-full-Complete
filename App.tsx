// Root Entry Point for Mead - The Global Luxury Super App
// Complete Production Version with all providers, deep linking, and safe initialization

import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/navigationRef';

import { ThemeProvider } from './src/utils/theme';
import { OfflineProvider } from './src/utils/offline';
import { ToastProvider } from './src/components/Toast';
import ErrorBoundary from './src/components/ErrorBoundary';
import LuxurySplash from './src/components/LuxurySplash';

import AppNavigator from './src/navigation/AppNavigator';
import { useDeepLinking } from './src/navigation/DeepLinking';

import { useOfflineRetry } from './src/hooks/useOfflineRetry';
import { pushNotificationsService } from './src/services/pushNotifications';
import { backupService } from './src/services/backupService';
import { meadLogger } from './src/utils/logger';
import AppConfig from './src/constants/appConfig';

SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs(['new NativeEventEmitter']);

/** Runs inside NavigationContainer + ToastProvider so hooks stay valid */
function AppRoot() {
  useOfflineRetry();
  useDeepLinking();
  return <AppNavigator />;
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        await Font.loadAsync({
          // eslint-disable-next-line no-undef
          'Imperial-Bold': require('./assets/fonts/Imperial-Bold.ttf'),
          // eslint-disable-next-line no-undef
          'Imperial-Regular': require('./assets/fonts/Imperial-Regular.ttf'),
        });

        try {
          await pushNotificationsService.initialize();
          meadLogger.info('Push notifications initialized');
        } catch (e) {
          meadLogger.warn('Push notifications failed to initialize (non-critical)', e);
        }

        setTimeout(() => {
          backupService.scheduleAutoBackup();
        }, 5000);

        meadLogger.info('Mead App initialized successfully', {
          version: AppConfig.getFullVersion(),
        });
      } catch (error: unknown) {
        meadLogger.error('Critical error during app initialization', error);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepareApp();
  }, []);

  if (!appIsReady) {
    return <LuxurySplash />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <OfflineProvider>
          <ToastProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar barStyle="light-content" backgroundColor="#000000" />
              <AppRoot />
            </NavigationContainer>
          </ToastProvider>
        </OfflineProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

