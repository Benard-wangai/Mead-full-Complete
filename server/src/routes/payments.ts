import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { initializeTransaction, verifyTransaction } from '../services/paystack.js';

export const paymentsRouter = Router();

const initializeSchema = z.object({
  email: z.string().min(3).max(320),
  amount: z.number().int().positive(),
  feature: z.string().optional(),
  planCode: z.string().nullable().optional(),
  isSubscription: z.boolean().optional(),
  publicKey: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  callbackUrl: z.string().url().optional(),
});

paymentsRouter.post(
  '/initialize',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = initializeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: 'Invalid request body',
          errors: parsed.error.flatten(),
        });
        return;
      }

      const { email, amount, planCode, isSubscription, metadata, callbackUrl } =
        parsed.data;

      const data = await initializeTransaction({
        email,
        amount,
        planCode: planCode ?? null,
        isSubscription: Boolean(isSubscription),
        metadata: {
          ...(metadata ?? {}),
          feature: parsed.data.feature,
        },
        callbackUrl,
      });

      res.json({
        data: {
          authorization_url: data.authorization_url,
          reference: data.reference,
          access_code: data.access_code,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

paymentsRouter.get(
  '/verify/:reference',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reference = req.params.reference?.trim();
      if (!reference) {
        res.status(400).json({ message: 'Payment reference is required' });
        return;
      }

      const data = await verifyTransaction(reference);

      res.json({
        data: {
          status: data.status,
          reference: data.reference,
          amount: data.amount,
          currency: data.currency,
          paid_at: data.paid_at,
          channel: data.channel,
          metadata: data.metadata,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
