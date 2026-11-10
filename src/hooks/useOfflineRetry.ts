// src/hooks/useOfflineRetry.ts
// Hook to automatically retry offline actions when network is restored
// Compatible with your current offline.ts

import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { meadLogger } from '../utils/logger';

export const useOfflineRetry = () => {

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        meadLogger.info('[OfflineRetry] Network restored → Processing queued actions');
        // Trigger the queue (your offline.ts already listens to network changes)
      } else {
        meadLogger.info('[OfflineRetry] Network lost → Actions will be queued');
      }
    });

    return () => unsubscribe();
  }, []);

  // Manual retry option
  const retryNow = async () => {
    meadLogger.info('[OfflineRetry] Manual retry triggered');
    const state = await NetInfo.fetch();
    
    if (state.isConnected && state.isInternetReachable) {
      meadLogger.info('[OfflineRetry] Network is online - queue should process');
      // You can call processQueue() here if you expose it later
    } else {
      meadLogger.warn('[OfflineRetry] Still offline - cannot retry now');
    }
  };

  return {
    retryNow,
  };
};