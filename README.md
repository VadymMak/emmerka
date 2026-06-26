# template-restaurant

> Next.js 15 restaurant & café template — menu, table reservations, gallery, AI admin, DACH legal.  
> Live demo: https://emmerka.vercel.app

## What's included

- Menu by categories with photos (6 categories)
- Table reservations + interactive floor map
- Photo gallery (WebP auto-conversion via Sharp)
- Working hours editor (per-day toggle)
- Testimonials with admin moderation
- Theme editor (colors, presets)
- AI admin assistant (12 tools, RAG)
- Cookie consent banner (GDPR)
- Impressum + Datenschutz pages (DE only, via admin)
- Multilingual: SK / DE
- Admin panel: menu, reservations, tables, gallery, orders, reviews, theme, legal, settings

## Tech stack

Next.js 15 App Router · TypeScript · Prisma 7 · Neon PostgreSQL · Vercel Blob · Sharp · OpenAI · CSS Modules

## Fork & deploy in ~1 hour

1. **Fork** → your GitHub account
2. **Create Neon DB** → copy `DATABASE_URL`
3. Copy `.env.example` → `.env.local` → fill in all values
4. Install & migrate:
   ```bash
   pnpm install
   pnpm prisma migrate deploy
   pnpm prisma db seed
   ```
5. **Deploy to Vercel** → add env vars → connect your domain
6. Open `/admin` → set up menu, photos, working hours, legal info

## Environment variables

See [`.env.example`](.env.example) for all required variables.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `STORE_SLUG` | ✅ | Slug of your store in DB (set during seed) |
| `BLOB_READ_WRITE_TOKEN` | ✅ | Vercel Blob token for image uploads |
| `OPENAI_API_KEY` | optional | Enables AI admin assistant |
| `ADMIN_SECRET` | ✅ | HMAC secret for admin auth — use a strong random string |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Production URL for SEO canonical/og:url |

## Admin panel

Access at `/admin` after deployment.

| Section | Path |
|---|---|
| Dashboard | `/admin` |
| Menu (products) | `/admin/products` |
| Reservations | `/admin/reservations` |
| Tables | `/admin/tables` |
| Gallery | `/admin/gallery` |
| Orders | `/admin/orders` |
| Reviews | `/admin/reviews` |
| Theme editor | `/admin/theme` |
| Legal (DE) | `/admin/legal` |
| AI assistant | `/admin/ai` |
| Settings | `/admin/settings` |

## DACH legal pages

Enable Impressum + Datenschutz in `/admin/legal`:

1. Toggle "Impressum & Datenschutz aktivieren"
2. Fill in company address, email, phone, VAT ID
3. Save → pages appear at `/de/impressum` and `/de/datenschutz`
4. Links auto-appear in footer for German locale visitors

## License

MIT
