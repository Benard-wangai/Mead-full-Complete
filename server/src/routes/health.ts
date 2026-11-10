import { Router } from 'express';
import { config } from '../config.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mead-api',
    environment: config.nodeEnv,
    paystackConfigured: Boolean(config.paystackSecretKey),
  });
});
