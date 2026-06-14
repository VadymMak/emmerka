import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const store = await db.store.findUnique({ where: { slug: 'emmerka' }, select: { id: true } });
  const cats = await db.category.findMany({ where: { storeId: store!.id }, orderBy: { sortOrder: 'asc' } });
  console.log(JSON.stringify(cats, null, 2));
}

main().catch(console.error).finally(() => db.$disconnect());
