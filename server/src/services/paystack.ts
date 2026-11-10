import { config, assertPaystackConfigured } from '../config.js';

const PAYSTACK_API = 'https://api.paystack.co';

export interface PaystackApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface InitializeTransactionData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyTransactionData {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}

async function paystackFetch<T>(
  endpoint: string,
  init: RequestInit = {}
): Promise<PaystackApiResponse<T>> {
  assertPaystackConfigured();

  const response = await fetch(`${PAYSTACK_API}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.paystackSecretKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  const body = (await response.json()) as PaystackApiResponse<T> & {
    code?: string;
  };

  if (!response.ok || !body.status) {
    const message =
      body.message || `Paystack error (${response.status})`;
    const error = new Error(message) as Error & {
      statusCode: number;
      paystack?: unknown;
    };
    error.statusCode = response.status;
    error.paystack = body;
    throw error;
  }

  return body;
}

export async function initializeTransaction(params: {
  email: string;
  amount: number;
  planCode?: string | null;
  isSubscription?: boolean;
  metadata?: Record<string, unknown>;
  callbackUrl?: string;
}): Promise<InitializeTransactionData> {
  const payload: Record<string, unknown> = {
    email: params.email,
    amount: params.amount,
    currency: config.paystackCurrency,
    metadata: params.metadata ?? {},
  };

  if (params.callbackUrl) {
    payload.callback_url = params.callbackUrl;
  }

  if (params.isSubscription && params.planCode) {
    payload.plan = params.planCode;
  }

  const result = await paystackFetch<InitializeTransactionData>(
    '/transaction/initialize',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  return result.data;
}

export async function verifyTransaction(
  reference: string
): Promise<VerifyTransactionData> {
  const encoded = encodeURIComponent(reference);
  const result = await paystackFetch<VerifyTransactionData>(
    `/transaction/verify/${encoded}`,
    { method: 'GET' }
  );
  return result.data;
}
