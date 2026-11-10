import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load root project .env (same file Expo uses for PAYSTACK_SECRET_KEY)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: Number(process.env.PORT || process.env.API_PORT || 3000),
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
  paystackCurrency: process.env.PAYSTACK_CURRENCY || 'KES',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || '*').split(',').map((s) => s.trim()),
};

export function assertPaystackConfigured(): void {
  if (!config.paystackSecretKey || config.paystackSecretKey.startsWith('sk_test_your')) {
    throw new Error(
      'PAYSTACK_SECRET_KEY is missing. Set it in the project root .env file.'
    );
  }
}
