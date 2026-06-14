import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

async function main() {
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) {
    console.error(`Store "${STORE_SLUG}" not found`);
    process.exit(1);
  }

  const current = (store.themeConfig as Record<string, unknown>) ?? {};
  const currentColors = (current.colors as Record<string, string>) ?? {};

  const updated = {
    ...current,
    colors: {
      ...currentColors,
      bg:            '#F8F4ED',
      primary:       '#C68A6F',
      primaryDark:   '#5C4638',
      primaryLight:  '#F8F4ED',
      text:          '#5C4638',
      contrast:      '#ffffff',
      textSecondary: '#7a6b5e',
      textMuted:     '#8a7b6e',
      headerBg:      'rgba(248,244,237,0.92)',
      overlayAlpha:  'rgba(92,70,56,0.15)',
      overlay:       '#5C4638',
      border:        '#e8ddd6',
      bgSubtle:      '#f5ede8',
      bgDark:        '#3A2E25',
      success:       '#4ade80',
      error:         '#ef4444',
      warning:       '#fbbf24',
      successLight:  '#dcfce7',
      errorLight:    '#fef2f2',
      infoLight:     '#eff6ff',
    },
    layout: (current.layout as object) ?? {
      heroType:     'full-width',
      cardStyle:    'border',
      navPosition:  'top',
      borderRadius: 'rounded',
    },
  };

  await db.store.update({
    where: { id: store.id },
    data: { themeConfig: updated as object },
  });

  console.log(`✅ Emmerka theme updated for store "${store.name}"`);
  console.log('  textSecondary: #7a6b5e  (was default #9ca3af)');
  console.log('  textMuted:     #8a7b6e  (was default #6b7280)');
  console.log('  headerBg:      rgba(248,244,237,0.92) warm ivory (was dark rgba(0,0,0,0.9))');
}

main().catch(console.error).finally(() => db.$disconnect());
