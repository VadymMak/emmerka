import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

async function main() {
  const store = await prisma.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) throw new Error(`Store "${STORE_SLUG}" not found`);

  const testimonials = await prisma.testimonial.findMany({
    where: { storeId: store.id },
    select: {
      id: true,
      status: true,
      adminReply: true,
      customer: { select: { name: true } },
    },
  });

  console.log('=== Testimonials in DB ===');
  for (const t of testimonials) {
    console.log(`  [${t.status}] ${t.customer.name} | adminReply: ${JSON.stringify(t.adminReply)}`);
  }

  const maria = testimonials.find((t) => t.customer.name === 'Maria Schmidt');
  if (!maria) {
    console.log('\n❌ Maria Schmidt not found');
    return;
  }

  if (maria.adminReply) {
    console.log('\n✅ Maria already has adminReply — no fix needed');
    return;
  }

  console.log('\n⚠️  Maria has NULL adminReply — fixing...');
  await prisma.testimonial.update({
    where: { id: maria.id },
    data: { adminReply: 'Thank you for your kind words, Maria! We appreciate your feedback.' },
  });
  console.log('✅ adminReply set for Maria Schmidt');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
