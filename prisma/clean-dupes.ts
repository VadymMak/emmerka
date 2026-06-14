import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

async function main() {
  const store = await prisma.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) throw new Error(`Store "${STORE_SLUG}" not found`);

  const all = await prisma.testimonial.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'asc' },
    include: { customer: { select: { name: true, email: true } } },
  });

  console.log(`Total testimonials: ${all.length}`);
  console.log('---');
  for (const t of all) {
    console.log(
      `  [${t.status}] ${t.customer.name} | ${t.rating}★ | reply: ${t.adminReply ? 'YES' : 'null'} | ${t.createdAt.toISOString().slice(0, 19)} | ${t.id.slice(0, 8)}`,
    );
  }

  // Dedup: customerId + first 60 chars of text → keep oldest (with adminReply preferred)
  const seen = new Map<string, string>(); // key → id to keep
  const toDelete: string[] = [];

  for (const t of all) {
    const key = `${t.customerId}|${t.text.slice(0, 60)}`;
    if (seen.has(key)) {
      toDelete.push(t.id);
      console.log(`\nDELETE dupe: ${t.customer.name} | ${t.rating}★ | ${t.id.slice(0, 8)}`);
    } else {
      seen.set(key, t.id);
    }
  }

  if (toDelete.length === 0) {
    console.log('\n✅ No duplicates found');
  } else {
    const result = await prisma.testimonial.deleteMany({ where: { id: { in: toDelete } } });
    console.log(`\n✅ Deleted ${result.count} duplicates`);
  }

  // Verify Maria has adminReply
  const maria = await prisma.testimonial.findFirst({
    where: {
      storeId: store.id,
      customer: { name: 'Maria Schmidt' },
      status: 'APPROVED',
    },
    include: { customer: { select: { name: true } } },
  });

  if (!maria) {
    console.log('\n⚠️  Maria Schmidt APPROVED not found');
  } else if (!maria.adminReply) {
    await prisma.testimonial.update({
      where: { id: maria.id },
      data: { adminReply: 'Thank you for your kind words, Maria! We appreciate your feedback.' },
    });
    console.log('\n✅ adminReply set for Maria Schmidt');
  } else {
    console.log(`\n✅ Maria Schmidt adminReply OK: "${maria.adminReply.slice(0, 50)}..."`);
  }

  const remaining = await prisma.testimonial.count({ where: { storeId: store.id } });
  console.log(`\nRemaining testimonials: ${remaining}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
