# vendshop-template-ecommerce

Universal multi-region e-commerce template ("ElectroMarket") — a power-tools store with a full customer storefront and an admin panel.

## Setup
1. Clone repo
2. `cp .env.local.example .env.local`
3. Set your values in `.env.local`
4. `pnpm install --config.node-linker=hoisted`
5. `pnpm dev:clean`

> On Windows/exFAT drives, always install with `--config.node-linker=hoisted` and run `pnpm dev:clean` (kills stale Next dev processes + clears `.next`).

## Vercel Deploy
`vercel.json` contains **no secrets** — all 4 vars must be set in **Vercel Dashboard → Settings → Environment Variables**:
- `REGION_BUNDLE=UA`
- `ADMIN_EMAIL=your@email.com`
- `ADMIN_PASSWORD=your_secure_password`
- `ADMIN_SECRET=random_32_char_string` (generate with: `openssl rand -hex 32`)

## Admin Access
`/admin` → redirects to `/admin/login` when not authenticated.
Default demo credentials: `admin@electromarket.ua` / `admin123` (change before production).

The admin session is an httpOnly cookie holding an HMAC-SHA256 token signed with `ADMIN_SECRET`; the middleware verifies the signature on every `/admin` request.

## Tech Stack
Next.js 15, TypeScript, CSS Modules, next-intl (6 locales: uk/ru/en/de/sk/cs), Zustand, Vercel.
