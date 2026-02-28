# Deployment Guide — Lightning POS

## Vercel (Recommended)

### 1. Fork & Connect

1. Fork the repository to your GitHub account
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your forked repository
4. Vercel auto-detects Next.js — click **Deploy**

### 2. Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_RELAY_URL` | No | `wss://relay.lacrypta.ar` | Primary Nostr relay |
| `NEXT_PUBLIC_EXTRA_RELAYS` | No | `wss://relay.damus.io,...` | Comma-separated extra relays |
| `NEXT_PUBLIC_CURRENCY_API` | No | `https://api.yadio.io` | Exchange rates API |
| `NEXT_PUBLIC_LAWALLET_API` | No | `https://api.lawallet.ar` | LaWallet API for NFC payments |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | No | `SAT` | Default currency (SAT/ARS/USD) |

All variables are prefixed `NEXT_PUBLIC_` — they are safe to expose in the browser.

### 3. Custom Domain

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `pos.yourbusiness.com`)
3. Update your DNS records as instructed by Vercel
4. Vercel provisions HTTPS automatically via Let's Encrypt

### 4. Automatic Deployments

- Every push to `main` triggers a production deploy
- PRs get preview deployments automatically

---

## Self-Host with Node.js

### Prerequisites

- Node.js 20+
- npm or pnpm

### Steps

```bash
# Clone
git clone https://github.com/lacrypta/lightning-pos.git
cd lightning-pos

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with your settings

# Build
npm run build

# Start (production)
npm start
# Listens on http://localhost:3000
```

### With PM2 (recommended for production)

```bash
npm install -g pm2
pm2 start "npm start" --name lightning-pos
pm2 save
pm2 startup
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name pos.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Use Certbot for HTTPS: `certbot --nginx -d pos.yourdomain.com`

---

## Self-Host with Bun

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install deps
bun install

# Build
bun run build

# Start
bun run start
```

---

## Notes

- The app is a **PWA** — users can install it to their home screen
- No backend database required — all state is Nostr + localStorage
- NFC payments require Chrome on Android (Web NFC API) or the native Android WebView wrapper
- Exchange rates are fetched client-side from yadio.io — no server-side caching needed
