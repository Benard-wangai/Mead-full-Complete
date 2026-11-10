# Mead API

Express server that holds **Paystack secret keys** and exposes payment endpoints for the Mead mobile app.

## Setup

Uses the **root** `.env` file (same as Expo):

```env
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_CURRENCY=KES
PORT=3000
```

## Run

```bash
# From project root
npm run server:dev

# Or from this folder
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Endpoints

### `GET /health`

Health check.

### `POST /payments/initialize`

Body (JSON):

```json
{
  "email": "user@example.com",
  "amount": 50000,
  "feature": "mead_ai",
  "planCode": "PLN_xxx",
  "isSubscription": true,
  "metadata": {}
}
```

`amount` is in **subunits** (kobo/cents), same as the mobile client sends.

Response:

```json
{
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "reference": "T123...",
    "access_code": "..."
  }
}
```

### `GET /payments/verify/:reference`

Response:

```json
{
  "data": {
    "status": "success",
    "reference": "T123...",
    "amount": 50000,
    "currency": "KES"
  }
}
```

## Deploy

Deploy this service to any Node host. Point `EXPO_PUBLIC_API_BASE_URL` in the app to your API host (e.g. `https://api.meadtechnologies.com`).
