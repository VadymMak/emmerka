/**
 * Seed the restaurant theme preset for Adriano Trencin.
 * Run: npx tsx scripts/seed-restaurant-theme.ts
 *
 * Requires DATABASE_URL in .env pointing to the Adriano store DB.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const RESTAURANT_THEME = {
  colors: {
    bg: '#0a0a0a',
    primary: '#d4a853',
    primaryDark: '#b8922e',
    primaryLight: '#1a1505',
    text: '#f5f5f5',
    textSecondary: '#cbd5e1',
    textMuted: '#9ca3af',
    border: '#222222',
    bgSubtle: '#1a1a1a',
    success: '#4ade80',
    error: '#ef4444',
  },
  layout: {
    heroType: 'full-width',
    cardStyle: 'border',
    navPosition: 'top',
    borderRadius: 'rounded',
  },
};

const STORE_SLUG = process.env.STORE_SLUG ?? 'adriano';

async function main() {
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) {
    console.error(`Store "${STORE_SLUG}" not found. Set STORE_SLUG env var.`);
    process.exit(1);
  }

  await db.store.update({
    where: { id: store.id },
    data: { themeConfig: RESTAURANT_THEME as object },
  });

  console.log(`Restaurant theme applied to store "${store.name}" (${STORE_SLUG})`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
