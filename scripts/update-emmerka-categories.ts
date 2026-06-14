import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

async function main() {
  const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });
  const sid = store.id;

  // Final desired state:
  // 1 ranajky  — Raňajky
  // 2 obedy    — Obedy
  // 3 kava     — Káva & Nápoje   (was "Káva", sortOrder 1)
  // 4 dezerty  — Dezerty
  // 5 snack    — Snack & Šaláty  (was slug "napoje" "Nápoje", sortOrder 2)
  // 6 vino     — Víno & Koktaily (was "Vínna karta")

  await db.category.updateMany({
    where: { storeId: sid, slug: 'ranajky' },
    data: { sortOrder: 1 },
  });
  await db.category.updateMany({
    where: { storeId: sid, slug: 'obedy' },
    data: { sortOrder: 2 },
  });
  await db.category.updateMany({
    where: { storeId: sid, slug: 'kava' },
    data: { nameKey: 'Káva & Nápoje', sortOrder: 3 },
  });
  await db.category.updateMany({
    where: { storeId: sid, slug: 'dezerty' },
    data: { sortOrder: 4 },
  });
  // rename napoje → snack (preserves product categoryId links)
  await db.category.updateMany({
    where: { storeId: sid, slug: 'napoje' },
    data: { slug: 'snack', nameKey: 'Snack & Šaláty', sortOrder: 5 },
  });
  await db.category.updateMany({
    where: { storeId: sid, slug: 'vino' },
    data: { nameKey: 'Víno & Koktaily', sortOrder: 6 },
  });

  const result = await db.category.findMany({
    where: { storeId: sid },
    orderBy: { sortOrder: 'asc' },
    select: { slug: true, nameKey: true, sortOrder: true, image: true },
  });

  console.log('✅ Emmerka categories updated:');
  result.forEach(c => console.log(`  ${c.sortOrder}. ${c.slug} — ${c.nameKey} ${c.image ? '🖼' : '(no image)'}`));
}

main().catch(console.error).finally(() => db.$disconnect());
