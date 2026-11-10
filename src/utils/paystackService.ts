// Paystack via Mead API — secret key stays on the server only

import { Linking } from 'react-native';
import AppConfig from '../constants/appConfig';
import { meadLogger } from './logger';
import { addToOfflineQueue } from './offline';
import { apiService } from '../services/api';

class PaystackService {
  private static instance: PaystackService;

  private constructor() {}

  public static getInstance(): PaystackService {
    if (!PaystackService.instance) {
      PaystackService.instance = new PaystackService();
    }
    return PaystackService.instance;
  }

  public async initializePayment({
    email,
    amount,
    feature,
    metadata = {},
    isSubscription = false,
  }: {
    email: string;
    amount: number;
    feature: string;
    metadata?: Record<string, unknown>;
    isSubscription?: boolean;
  }) {
    const planCode = this.getPlanCode(feature);

    const payload = {
      email,
      amount: Math.round(amount * 100),
      feature,
      planCode,
      isSubscription,
      publicKey: AppConfig.PAYSTACK.PUBLIC_KEY,
      metadata: {
        feature,
        isSubscription,
        ...metadata,
      },
    };

    try {
      const result = await apiService.post<{
        data: { authorization_url: string; reference: string };
      }>('/payments/initialize', payload);

      meadLogger.info('Payment initialized successfully', {
        feature,
        reference: result.data?.reference,
      });
      return result.data;
    } catch (error) {
      await addToOfflineQueue('make_payment', payload, 'Payments');
      meadLogger.warn('Payment initialization failed - queued for offline', {
        feature,
      });
      throw error;
    }
  }

  public async openAuthorizationUrl(authorizationUrl: string): Promise<void> {
    const canOpen = await Linking.canOpenURL(authorizationUrl);
    if (!canOpen) {
      throw new Error('Unable to open the payment page on this device');
    }
    await Linking.openURL(authorizationUrl);
  }

  public async verifyPayment(reference: string) {
    try {
      const result = await apiService.get<{ data: { status: string } }>(
        `/payments/verify/${reference}`
      );
      meadLogger.info('Payment verified', {
        reference,
        status: result.data?.status,
      });
      return result.data;
    } catch (error) {
      meadLogger.error('Payment verification failed', { reference });
      throw error;
    }
  }

  private getPlanCode(feature: string): string | null {
    const plans = AppConfig.PAYSTACK_PLANS || {};
    const key = Object.keys(plans).find((k) =>
      k.toLowerCase().includes(feature.toLowerCase())
    );
    return key ? (plans as Record<string, string>)[key] : null;
  }
}

export const paystackService = PaystackService.getInstance();

export default paystackService;
