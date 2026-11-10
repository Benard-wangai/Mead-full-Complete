// src/services/DeepLinking.ts
// Deep Linking Service for Mead - The Global Luxury Super App
// Production-ready deep link handling with comprehensive routing, analytics, and error recovery

import { Linking } from 'react-native';
import * as LinkingExpo from 'expo-linking';
import { useEffect } from 'react';
import { meadLogger } from '../utils/logger';
import { PUBLIC_WEB_URL } from '../utils/env';
import { navigate } from './navigationRef';
export interface DeepLinkParams {
  screen?: string;
  params?: Record<string, any>;
  path?: string;
}

class DeepLinkingService {
  private static instance: DeepLinkingService;
  private listeners: Array<() => void> = [];

  private constructor() {}

  public static getInstance(): DeepLinkingService {
    if (!DeepLinkingService.instance) {
      DeepLinkingService.instance = new DeepLinkingService();
    }
    return DeepLinkingService.instance;
  }

  /**
   * Initialize deep linking
   */
  init() {
    // Handle deep links when app is opened from link
    this.setupLinkingListener();
    meadLogger.info('Deep Linking Service initialized');
  }

  private setupLinkingListener() {
    // Handle incoming deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      this.handleDeepLink(url);
    });

    // Handle initial URL (app opened from link)
    Linking.getInitialURL().then(url => {
      if (url) this.handleDeepLink(url);
    });

    this.listeners.push(() => subscription.remove());
  }

  /**
   * Parse and handle deep link URLs
   */
  private handleDeepLink(url: string) {
    try {
      meadLogger.info('Received deep link', { url });

      const parsed = LinkingExpo.parse(url);
      const { hostname, path, queryParams } = parsed;

      let screen: string | undefined;
      let params: Record<string, any> = queryParams || {};

      // Custom URL scheme handling
      const isMeadHost =
        hostname === 'mead' ||
        hostname === 'meadtechnologies.com' ||
        hostname === 'www.meadtechnologies.com' ||
        hostname === 'mead.app' ||
        hostname === 'www.mead.app';

      if (isMeadHost) {
        if (path?.startsWith('/reel/')) {
          screen = 'ReelDetail';
          params.reelId = path.split('/')[2];
        } 
        else if (path?.startsWith('/brew/')) {
          screen = 'BrewDetail';
          params.brewId = path.split('/')[2];
        } 
        else if (path?.startsWith('/group/')) {
          screen = 'GroupDetail';
          params.groupId = path.split('/')[2];
        } 
        else if (path?.startsWith('/user/')) {
          screen = 'Profile';
          params.userId = path.split('/')[2];
        } 
        else if (path === '/create-brew') {
          screen = 'BrewCreate';
        } 
        else if (path === '/meadtogether') {
          screen = 'MeadTogether';
        }
      }

      if (screen) {
        this.navigateToScreen(screen, params);
      } else {
        meadLogger.warn('Unknown deep link path', { url, path });
      }
    } catch (error) {
      meadLogger.error('Failed to handle deep link', error);
    }
  }

  /**
   * Navigate to screen (to be used with your navigation library)
   */
  private navigateToScreen(screen: string, params: Record<string, unknown> = {}) {
    meadLogger.info('Deep link navigation', { screen, params });

    const routeMap: Record<string, keyof import('./types').RootStackParamList | 'Main'> = {
      ReelDetail: 'Main',
      BrewDetail: 'BrewCreate',
      GroupDetail: 'GroupDetail',
      Profile: 'Main',
      BrewCreate: 'BrewCreate',
      MeadTogether: 'MeadTogether',
    };

    const route = routeMap[screen] || (screen as keyof import('./types').RootStackParamList);

    if (screen === 'ReelDetail') {
      navigate('Main', { screen: 'Reels' } as never);
      return;
    }

    navigate(route, params);
  }

  /**
   * Generate deep link URL
   */
  generateLink(path: string, params?: Record<string, any>): string {
    let url = `mead://${path}`;

    if (params) {
      const query = new URLSearchParams(params).toString();
      if (query) url += `?${query}`;
    }

    return url;
  }

  /**
   * Shareable links
   */
  getShareableLink(type: 'reel' | 'brew' | 'group' | 'user', id: string): string {
    const base = PUBLIC_WEB_URL.replace(/\/$/, '');
    return `${base}/${type}/${id}`;
  }

  /**
   * Clean up listeners
   */
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
    meadLogger.info('Deep Linking Service cleaned up');
  }
}

// Export singleton
export const deepLinkingService = DeepLinkingService.getInstance();

/**
 * Hook for easy usage in components
 */
export const useDeepLinking = () => {
  useEffect(() => {
    deepLinkingService.init();

    return () => {
      deepLinkingService.cleanup();
    };
  }, []);

  return {
    generateLink: deepLinkingService.generateLink.bind(deepLinkingService),
    getShareableLink: deepLinkingService.getShareableLink.bind(deepLinkingService),
  };
};

export default deepLinkingService;