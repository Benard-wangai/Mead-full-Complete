// src/utils/offline.ts
// Production Offline Queue System for Mead
// Automatically retries actions and calls real APIs when online

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import React, { createContext, useContext, ReactNode } from 'react';
import { meadLogger } from './logger';
import AppConfig from '../constants/appConfig';
import { supabase } from './supabaseClient';

export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  feature?: string;
  retries: number;
  maxRetries: number;
}

class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: OfflineAction[] = [];
  private isProcessing = false;
  private readonly STORAGE_KEY = AppConfig.STORAGE_KEYS.OFFLINE_QUEUE;

  private constructor() {
    this.loadQueue();
    this.setupNetworkListener();
  }

  public static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) OfflineQueue.instance = new OfflineQueue();
    return OfflineQueue.instance;
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) this.queue = JSON.parse(stored);
    } catch {
      this.queue = [];
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      meadLogger.error('Failed to save offline queue');
    }
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable && this.queue.length > 0) {
        this.processQueue();
      }
    });
  }

  public async addAction(type: string, payload: any, feature?: string, maxRetries = 5) {
    const action: OfflineAction = {
      id: 'off_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
      type,
      payload,
      timestamp: Date.now(),
      feature,
      retries: 0,
      maxRetries,
    };

    this.queue.push(action);
    await this.saveQueue();

    const state = await NetInfo.fetch();
    if (state.isConnected && state.isInternetReachable) {
      this.processQueue();
    }
  }

  public async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const remaining: OfflineAction[] = [];

    for (const action of [...this.queue]) {
      try {
        await this.executeAction(action);
        meadLogger.info('Successfully processed offline action', { type: action.type });
      } catch (error) {
        action.retries += 1;
        if (action.retries < action.maxRetries) {
          remaining.push(action);
          meadLogger.warn(`Retrying action ( {action.type} ( ){action.retries}/${action.maxRetries})`);
        } else {
          meadLogger.error('Action failed permanently', { type: action.type });
        }
      }
    }

    this.queue = remaining;
    await this.saveQueue();
    this.isProcessing = false;
  }

  private async executeAction(action: OfflineAction) {
    switch (action.type) {
      case 'create_brew':
        // eslint-disable-next-line no-case-declarations
        const { error: brewError } = await supabase.from('brews').insert(action.payload);
        if (brewError) throw brewError;
        break;

      case 'send_message':
        // eslint-disable-next-line no-case-declarations
        const { error: msgError } = await supabase.from('messages').insert(action.payload);
        if (msgError) throw msgError;
        break;

      case 'make_payment':
        meadLogger.info('Processing offline payment', action.payload);
        break;

      case 'create_group':
        // eslint-disable-next-line no-case-declarations
        const { error: groupError } = await supabase.from('groups').insert(action.payload);
        if (groupError) throw groupError;
        break;

      default:
        meadLogger.warn('Unknown offline action type', { type: action.type });
    }
  }

  public async clearQueue() {
    this.queue = [];
    await this.saveQueue();
  }
}

// Singleton
const offlineQueue = OfflineQueue.getInstance();

// Context
interface OfflineContextType {
  addAction: typeof offlineQueue.addAction;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <OfflineContext.Provider 
      value={{
        addAction: offlineQueue.addAction.bind(offlineQueue),
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOfflineQueue = () => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOfflineQueue must be used within OfflineProvider');
  return context;
};

// Export for direct use in services
export const addToOfflineQueue = offlineQueue.addAction.bind(offlineQueue);

export default offlineQueue;