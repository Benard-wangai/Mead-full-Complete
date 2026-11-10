// src/services/escrowService.ts
// Escrow Service for Mead - Production Ready
// Handles 2% commission escrow with your real account ACCT_ijlilx7syjt3ob6

import { meadLogger } from '../utils/logger';
import { addToOfflineQueue } from '../utils/offline';
import { paystackService } from '../utils/paystackService';
import supabase from '../utils/supabaseClient';
import AppConfig from '../constants/appConfig';

export interface EscrowTransaction {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  commission: number;           // 2%
  status: 'pending' | 'held' | 'released' | 'refunded';
  createdAt: string;
  releasedAt?: string;
  metadata?: any;
}

class EscrowService {
  private static instance: EscrowService;
  private readonly ESCROW_ACCOUNT = 'ACCT_ijlilx7syjt3ob6'; // Your real escrow account

  private constructor() {}

  public static getInstance(): EscrowService {
    if (!EscrowService.instance) {
      EscrowService.instance = new EscrowService();
    }
    return EscrowService.instance;
  }

  /**
   * Initialize Escrow Payment
   */
  public async initializeEscrowPayment(
    buyerEmail: string,
    amount: number,
    orderId: string,
    sellerId: string,
    buyerId: string,
    metadata: any = {}
  ) {
    const commission = Math.round(amount * AppConfig.PRICING.MARKETPLACE_COMMISSION);
    const sellerAmount = amount - commission;

    const payload = {
      email: buyerEmail,
      amount: Math.round(amount * 100), // to kobo
      metadata: {
        is_escrow: true,
        orderId,
        sellerId,
        buyerId,
        commission,
        sellerAmount,
        ...metadata,
      },
    };

    try {
      const result = await paystackService.initializePayment({
        email: buyerEmail,
        amount,
        feature: 'marketplace_escrow',
        metadata: payload.metadata,
      });

      // Save escrow record to Supabase
      const { error } = await supabase
        .from('escrow_transactions')
        .insert({
          order_id: orderId,
          buyer_id: buyerId,
          seller_id: sellerId,
          amount,
          commission,
          status: 'pending',
          metadata: result,
        });

      if (error) throw error;

      meadLogger.info('Escrow payment initialized', { orderId, amount });
      return result;

    } catch (error: any) {
      meadLogger.error('Escrow initialization failed', { orderId, error: error.message });
      await addToOfflineQueue('escrow_payment', payload, 'Escrow');
      throw error;
    }
  }

  /**
   * Release funds to seller (after buyer confirms delivery)
   */
  public async releaseToSeller(orderId: string, sellerId: string) {
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .update({ 
          status: 'released',
          released_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) throw error;

      meadLogger.info('Escrow funds released to seller', { orderId, sellerId });
      return data;
    } catch (error: any) {
      meadLogger.error('Failed to release escrow', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Refund to buyer (if delivery fails)
   */
  public async refundToBuyer(orderId: string, buyerId: string) {
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .update({ 
          status: 'refunded',
          released_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) throw error;

      meadLogger.info('Escrow funds refunded to buyer', { orderId, buyerId });
      return data;
    } catch (error: any) {
      meadLogger.error('Failed to refund escrow', { orderId, error: error.message });
      throw error;
    }
  }
}

// Export singleton
export const escrowService = EscrowService.getInstance();

export default escrowService;