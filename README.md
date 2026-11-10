# MEAD - The Global Luxury Super App

**Mead** is a premium, all-in-one social, entertainment, and lifestyle super app built with **React Native + Expo**. It combines messaging, short & long-form video, live streaming, music, books, gaming, marketplace, AI assistant, and more — all wrapped in a luxurious black & gold experience.

---

## ✨ Key Features

- **Phone-only Authentication** (No email required)
- **Real-time Messaging & Video/Audio Calls**
- **Reels & Long-form Video** with permanent gold watermark
- **Mead AI** – Intelligent luxury assistant
- **Music & Audiobooks** (Spotify-style with offline downloads)
- **Mead Books** – Digital library & reading experience
- **Movies & TV** – Watch & download
- **Mead Arena** – Multiplayer gaming rooms
- **Marketplace** – Buy/Sell with 2% escrow protection
- **Geo-targeted Brews** – Pay $1 to post content visible only in selected countries/regions
- **Groups & Mega Groups** (up to 10 million members)
- **Live Streaming** with gifts
- **Mead Together** – Watch/listen/play together (up to 500 people)
- **Offline-first** architecture with smart sync
- **Luxury Black & Gold UI** with premium haptics
- **Supabase Backend** + Paystack Payments + Escrow

---

## 🚀 Quick Start


### 1. Clone the Project
```bash
git clone <your-repo-url>
cd mead-app-full
```

### 2. Environment & API server (Paystack)

Production: point `EXPO_PUBLIC_API_BASE_URL` at your API (e.g. `https://api.meadtechnologies.com`) and `EXPO_PUBLIC_WEB_URL` at your site (`https://meadtechnologies.com`).

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_WEB_URL=https://meadtechnologies.com
PAYSTACK_SECRET_KEY=sk_live_...
```

Start the Mead API (proxies Paystack with your secret key):

```bash
npm run server:dev
```

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | API health check |
| `/payments/initialize` | POST | Start Paystack checkout |
| `/payments/verify/:reference` | GET | Verify transaction |

- **iOS simulator / web:** `http://localhost:3000`
- **Android emulator:** `http://10.0.2.2:3000` (default in dev when `EXPO_PUBLIC_API_BASE_URL` is unset)

### 3. Run the app
```bash
npm install
npm start
```
