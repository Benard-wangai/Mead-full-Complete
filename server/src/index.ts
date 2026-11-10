import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { healthRouter } from './routes/health.js';
import { paymentsRouter } from './routes/payments.js';

const app = express();

app.use(
  cors({
    origin:
      config.corsOrigins[0] === '*'
        ? true
        : config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

app.use(express.json({ limit: '1mb' }));

app.use(healthRouter);
app.use('/payments', paymentsRouter);

app.use(
  (
    err: Error & { statusCode?: number; paystack?: unknown },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    console.error('[mead-api]', err.message, err.paystack ?? '');

    res.status(status).json({
      message: err.message || 'Internal server error',
      ...(config.nodeEnv === 'development' && err.paystack
        ? { paystack: err.paystack }
        : {}),
    });
  }
);

app.listen(config.port, () => {
  console.log(`Mead API listening on http://localhost:${config.port}`);
  console.log(`  POST /payments/initialize`);
  console.log(`  GET  /payments/verify/:reference`);
  console.log(`  GET  /health`);
  if (!config.paystackSecretKey) {
    console.warn('  WARNING: PAYSTACK_SECRET_KEY is not set in .env');
  }
});
