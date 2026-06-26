import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LegalConfig" (
      "id"          TEXT NOT NULL DEFAULT (gen_random_uuid()::text),
      "storeId"     TEXT NOT NULL,
      "enabled"     BOOLEAN NOT NULL DEFAULT false,
      "companyName" TEXT NOT NULL DEFAULT '',
      "street"      TEXT NOT NULL DEFAULT '',
      "zip"         TEXT NOT NULL DEFAULT '',
      "city"        TEXT NOT NULL DEFAULT '',
      "country"     TEXT NOT NULL DEFAULT 'Deutschland',
      "email"       TEXT NOT NULL DEFAULT '',
      "phone"       TEXT NOT NULL DEFAULT '',
      "vatId"       TEXT NOT NULL DEFAULT '',
      "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT now(),

      CONSTRAINT "LegalConfig_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "LegalConfig_storeId_key" UNIQUE ("storeId"),
      CONSTRAINT "LegalConfig_storeId_fkey" FOREIGN KEY ("storeId")
        REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `);
  console.log('LegalConfig table created (or already exists).');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
