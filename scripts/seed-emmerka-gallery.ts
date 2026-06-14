import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

const GALLERY_IMAGES = [
  {
    url: '/gallery/emmerka-hlavna-sala.webp',
    alt: 'Hlavná sála kaviarne Emmerka s freskami a nábytkom Thonet',
    sortOrder: 0,
  },
  {
    url: '/gallery/emmerka-barovy-pult.webp',
    alt: 'Barový pult s espresso strojom a domácimi koláčmi',
    sortOrder: 1,
  },
  {
    url: '/gallery/emmerka-servirovanie.webp',
    alt: 'Servírovanie na mramorovom stolíku — káva a koláč',
    sortOrder: 2,
  },
  {
    url: '/gallery/emmerka-terasa.webp',
    alt: 'Terasa Emmerovej vily s výhľadom do záhrady',
    sortOrder: 3,
  },
  {
    url: '/gallery/emmerka-fresky-strop.webp',
    alt: 'Rokokové fresky na strope historickej Emmerovej vily',
    sortOrder: 4,
  },
  {
    url: '/gallery/emmerka-vecerna-atmosfera.webp',
    alt: 'Večerná atmosféra v kaviarni Emmerka pri sviečkach',
    sortOrder: 5,
  },
];

async function main() {
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) {
    console.error(`Store "${STORE_SLUG}" not found!`);
    const stores = await db.store.findMany({ select: { slug: true, name: true } });
    console.log('Available stores:', stores);
    process.exit(1);
  }

  const deleted = await db.galleryImage.deleteMany({ where: { storeId: store.id } });
  console.log(`Deleted ${deleted.count} old gallery images`);

  for (const img of GALLERY_IMAGES) {
    await db.galleryImage.create({
      data: {
        storeId: store.id,
        url: img.url,
        alt: img.alt,
        sortOrder: img.sortOrder,
        active: true,
      },
    });
  }

  console.log(`✅ Created ${GALLERY_IMAGES.length} gallery images for "${store.name}"`);
  GALLERY_IMAGES.forEach((img, i) => console.log(`  ${i + 1}. ${img.url}`));
}

main().catch(console.error).finally(() => db.$disconnect());
