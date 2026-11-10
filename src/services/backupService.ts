// src/services/backupService.ts
// Backup Service for Mead - The Global Luxury Super App
// Production-ready with correct offline queue usage and Supabase integration

import { meadLogger } from '../utils/logger';
import { supabase } from '../utils/supabaseClient';
import { addToOfflineQueue } from '../utils/offline';
import AppConfig from '../constants/appConfig';

export interface BackupData {
  user_id: string;
  profile?: any;
  chats?: any[];
  brews?: any[];
  reels?: any[];
  marketplace_listings?: any[];
  settings?: any;
  last_backup: string;
  version: string;
}

class BackupService {
  private static instance: BackupService;

  private constructor() {}

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Create a backup of user data
   */
  async createBackup(userId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        meadLogger.warn('Cannot create backup - no authenticated user');
        return false;
      }

      meadLogger.info('Starting backup', { userId: targetUserId });

      // Gather data
      const profile = await this.getProfileData(targetUserId);
      const chats = await this.getChatsData(targetUserId);
      const brews = await this.getBrewsData(targetUserId);
      const reels = await this.getReelsData(targetUserId);
      const listings = await this.getMarketplaceListings(targetUserId);

      const backupPayload: BackupData = {
        user_id: targetUserId,
        profile,
        chats,
        brews,
        reels,
        marketplace_listings: listings,
        settings: {},
        last_backup: new Date().toISOString(),
        version: AppConfig.APP_VERSION,
      };

      // Save to Supabase
      const { error } = await supabase
        .from('user_backups')
        .upsert(backupPayload, { onConflict: 'user_id' });

      if (error) {
        meadLogger.error('Failed to save backup to Supabase', error);
        await this.queueBackup(backupPayload);
        return false;
      }

      meadLogger.info('Backup completed successfully', { userId: targetUserId });
      return true;
    } catch (error: any) {
      meadLogger.error('Backup creation failed', error);
      return false;
    }
  }

  private async getProfileData(userId: string): Promise<any> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return data || {};
    } catch {
      return {};
    }
  }

  private async getChatsData(userId: string): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })
        .limit(300);
      return data || [];
    } catch {
      return [];
    }
  }

  private async getBrewsData(userId: string): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('brews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(200);
      return data || [];
    } catch {
      return [];
    }
  }

  private async getReelsData(userId: string): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('reels')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      return data || [];
    } catch {
      return [];
    }
  }

  private async getMarketplaceListings(userId: string): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userId);
      return data || [];
    } catch {
      return [];
    }
  }

  /**
   * Queue backup for offline sync (Fixed: Correct argument order)
   */
  private async queueBackup(backupData: BackupData): Promise<void> {
    try {
      await addToOfflineQueue(
        'create_backup',        // type
        backupData,             // payload
        'backup',               // feature
        3                       // maxRetries
      );
      meadLogger.info('Backup queued for offline sync');
    } catch (error) {
      meadLogger.error('Failed to queue backup', error);
    }
  }

  /**
   * Restore latest backup for a user
   */
  async restoreBackup(userId: string): Promise<BackupData | null> {
    try {
      const { data, error } = await supabase
        .from('user_backups')
        .select('*')
        .eq('user_id', userId)
        .order('last_backup', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        meadLogger.warn('No backup found', { userId });
        return null;
      }

      meadLogger.info('Backup restored successfully', { userId });
      return data as BackupData;
    } catch (error: any) {
      meadLogger.error('Restore failed', error);
      return null;
    }
  }

  /**
   * Auto-backup helper
   */
  async scheduleAutoBackup(): Promise<void> {
    await this.createBackup();
  }
}

// Export singleton
export const backupService = BackupService.getInstance();

export default backupService;