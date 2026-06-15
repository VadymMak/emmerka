/**
 * One-off script: set image paths on Emmerka menu categories.
 * Run: npx tsx prisma/update-category-images.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const CATEGORY_IMAGES: Record<string, string> = {
  ranajky:         '/categories/ranajky.webp',
  obedy:           '/categories/obedy.webp',
  'kava-napoje':   '/categories/kava.webp',
  kava:            '/categories/kava.webp',
  dezerty:         '/categories/dezerty.webp',
  'snack-salaty':  '/categories/snack.webp',
  snack:           '/categories/snack.webp',
  'vino-koktaily': '/categories/vino.webp',
  vino:            '/categories/vino.webp',
};

async function main() {
  const store = await db.store.findFirst({ where: { slug: 'emmerka' } });

  if (!store) {
    console.error('❌ Store "emmerka" not found');
    process.exit(1);
  }

  console.log(`✅ Store found: ${store.name} (${store.id})`);

  const categories = await db.category.findMany({
    where: { storeId: store.id },
    orderBy: { sortOrder: 'asc' },
  });

  console.log(`📂 Found ${categories.length} categories:`);

  for (const cat of categories) {
    const imagePath = CATEGORY_IMAGES[cat.slug];
    if (imagePath) {
      await db.category.update({ where: { id: cat.id }, data: { image: imagePath } });
      console.log(`  ✅ ${cat.slug} → ${imagePath}`);
    } else {
      console.log(`  ⚠️  ${cat.slug} — no image mapping`);
    }
  }

  console.log('\n🎉 Done! Category images updated.');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect().then(() => pool.end()));
