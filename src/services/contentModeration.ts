// src/services/contentModeration.ts
// Content Moderation Service for Mead - The Global Luxury Super App
// Production-ready: Rule-based + AI-ready moderation, reporting, logging, and Supabase integration

import { meadLogger } from '../utils/logger';
import { supabase } from '../utils/supabaseClient';

export interface ModerationResult {
  approved: boolean;
  confidence: number;
  reasons: string[];
  flags: string[];           // e.g. 'hate_speech', 'spam', 'nsfw', 'violence'
  moderated_at: string;
}

class ContentModerationService {
  private static instance: ContentModerationService;

  private constructor() {}

  public static getInstance(): ContentModerationService {
    if (!ContentModerationService.instance) {
      ContentModerationService.instance = new ContentModerationService();
    }
    return ContentModerationService.instance;
  }

  /**
   * Moderate text content (Brews, comments, bios, messages, etc.)
   */
  async moderateText(
    text: string,
    contentType: 'brew' | 'comment' | 'bio' | 'message' | 'product' = 'brew'
  ): Promise<ModerationResult> {
    try {
      if (!text || text.trim().length === 0) {
        return {
          approved: true,
          confidence: 1.0,
          reasons: ['Empty content'],
          flags: [],
          moderated_at: new Date().toISOString(),
        };
      }

      const lowerText = text.toLowerCase().trim();
      const flags: string[] = [];
      let approved = true;

      // Rule-based keyword filtering
      const bannedKeywords = [
        'nigger', 'faggot', 'cunt', 'rape', 'kill', 'murder', 'bomb',
        'scam', 'spam', 'fuck', 'shit', 'porn', 'xxx', 'nsfw'
      ];

      for (const word of bannedKeywords) {
        if (lowerText.includes(word)) {
          flags.push('hate_speech_or_violence');
          approved = false;
        }
      }

      // Length limits
      if (text.length > 1500 && contentType === 'brew') {
        flags.push('content_too_long');
        approved = false;
      }

      // TODO: Integrate real AI moderation (xAI Grok or external service) here in future
      // Example: const aiResult = await callGrokModeration(text);

      meadLogger.info('Content moderation completed', {
        contentType,
        approved,
        flags,
        length: text.length,
      });

      return {
        approved,
        confidence: approved ? 0.92 : 0.45,
        reasons: flags.length > 0 ? ['Flagged by moderation rules'] : ['Passed all checks'],
        flags,
        moderated_at: new Date().toISOString(),
      };
    } catch (error: any) {
      meadLogger.error('Moderation service error', error);
      
      // Fail-safe: Allow content but log for manual review
      return {
        approved: true,
        confidence: 0.6,
        reasons: ['Moderation service unavailable - manual review recommended'],
        flags: ['system_error'],
        moderated_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Report content for manual review
   */
  async reportContent(
    contentId: string,
    contentType: 'brew' | 'comment' | 'post' | 'group' | 'profile',
    reason: string,
    reportedBy: string,
    details?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_reports')
        .insert({
          content_id: contentId,
          content_type: contentType,
          reason,
          reported_by: reportedBy,
          details: details || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      meadLogger.info('Content reported successfully', { 
        contentId, 
        contentType, 
        reason 
      });

      return true;
    } catch (error) {
      meadLogger.error('Failed to report content', error);
      return false;
    }
  }

  /**
   * Batch moderation (useful for admin or bulk uploads)
   */
  async moderateBatch(
    items: Array<{ id: string; text: string; type: string }>
  ): Promise<Array<{ id: string; moderation: ModerationResult }>> {
    const results = await Promise.all(
      items.map(item => this.moderateText(item.text, item.type as any))
    );

    return items.map((item, index) => ({
      id: item.id,
      moderation: results[index],
    }));
  }
}

// Export singleton
export const contentModerationService = ContentModerationService.getInstance();

export default contentModerationService;