import { PrismaClient, Vertical, StoreMode } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const categoryData = [
  { slug: 'kava',    nameKey: 'Káva',       sortOrder: 1 },
  { slug: 'napoje',  nameKey: 'Nápoje',     sortOrder: 2 },
  { slug: 'ranajky', nameKey: 'Raňajky',    sortOrder: 3 },
  { slug: 'obedy',   nameKey: 'Obedy',      sortOrder: 4 },
  { slug: 'dezerty', nameKey: 'Dezerty',    sortOrder: 5 },
  { slug: 'vino',    nameKey: 'Vínna karta', sortOrder: 6 },
];

const products = [
  // ── KÁVA ──
  { slug: 'espresso',    nameKey: 'Espresso',    price: 2.50, category: 'kava',    metadata: { portionSize: '30ml',  cookTime: 2 } },
  { slug: 'cappuccino',  nameKey: 'Cappuccino',  price: 3.00, category: 'kava',    metadata: { portionSize: '200ml', cookTime: 3 } },
  { slug: 'latte',       nameKey: 'Latte',       price: 3.50, category: 'kava',    metadata: { portionSize: '300ml', cookTime: 3 } },
  { slug: 'mocha',       nameKey: 'Mocha',       price: 3.75, category: 'kava',    metadata: { portionSize: '300ml', cookTime: 4 } },
  { slug: 'flat-white',  nameKey: 'Flat White',  price: 3.50, category: 'kava',    metadata: { portionSize: '200ml', cookTime: 3 } },

  // ── NÁPOJE ──
  { slug: 'domaca-limonada', nameKey: 'Domáca limonáda', price: 3.50, category: 'napoje', metadata: { portionSize: '400ml' } },
  { slug: 'caj',             nameKey: 'Čaj',              price: 2.50, category: 'napoje', metadata: { portionSize: '300ml' } },
  { slug: 'fresh-juice',     nameKey: 'Čerstvá šťava',   price: 4.00, category: 'napoje', metadata: { portionSize: '300ml' } },
  { slug: 'smoothie',        nameKey: 'Smoothie',         price: 4.50, category: 'napoje', metadata: { portionSize: '400ml' } },

  // ── RAŇAJKY ──
  { slug: 'emmerka-ranajky', nameKey: 'Emmerka Raňajky',     price: 8.90,  category: 'ranajky', isHit: true, metadata: { portionSize: '350g', cookTime: 10, allergens: ['gluten', 'eggs', 'dairy'], description: 'Vajíčka, avokádo, toast, maslo, džem' } },
  { slug: 'croissant-losos', nameKey: 'Croissant s lososom', price: 7.50,  category: 'ranajky', metadata: { portionSize: '250g', cookTime: 8,  allergens: ['gluten', 'fish', 'dairy'] } },
  { slug: 'granola-jogurt',  nameKey: 'Granola s jogurtom',  price: 6.50,  category: 'ranajky', metadata: { portionSize: '300g', cookTime: 3,  vegetarian: true } },
  { slug: 'french-toast',    nameKey: 'French Toast',        price: 7.90,  category: 'ranajky', isNew: true, metadata: { portionSize: '280g', cookTime: 10, allergens: ['gluten', 'eggs', 'dairy'] } },

  // ── OBEDY ──
  { slug: 'carpaccio',       nameKey: 'Hovädzie Carpaccio', price: 11.90, category: 'obedy', metadata: { portionSize: '180g', cookTime: 10 } },
  { slug: 'caesar-salat',    nameKey: 'Caesar šalát',       price: 9.50,  category: 'obedy', metadata: { portionSize: '300g', cookTime: 12, allergens: ['gluten', 'eggs', 'dairy'] } },
  { slug: 'pasta-carbonara', nameKey: 'Pasta Carbonara',    price: 10.90, category: 'obedy', isHit: true, metadata: { portionSize: '350g', cookTime: 15, allergens: ['gluten', 'eggs', 'dairy'] } },
  { slug: 'grilovany-losos', nameKey: 'Grilovaný losos',    price: 14.90, category: 'obedy', metadata: { portionSize: '280g', cookTime: 20, allergens: ['fish'] } },
  { slug: 'risotto-funghi',  nameKey: 'Risotto ai funghi',  price: 11.50, category: 'obedy', metadata: { portionSize: '320g', cookTime: 18, vegetarian: true } },

  // ── DEZERTY ──
  { slug: 'tiramisu',    nameKey: 'Tiramisu',     price: 6.90, category: 'dezerty', isHit: true, metadata: { portionSize: '150g', cookTime: 0, allergens: ['gluten', 'eggs', 'dairy'] } },
  { slug: 'cheesecake',  nameKey: 'Cheesecake',   price: 5.90, category: 'dezerty', metadata: { portionSize: '160g', cookTime: 0, allergens: ['gluten', 'dairy'] } },
  { slug: 'creme-brulee',nameKey: 'Crème Brûlée', price: 6.50, category: 'dezerty', isNew: true, metadata: { portionSize: '140g', cookTime: 0, allergens: ['eggs', 'dairy'] } },
  { slug: 'panna-cotta', nameKey: 'Panna Cotta',  price: 5.50, category: 'dezerty', metadata: { portionSize: '140g', cookTime: 0, allergens: ['dairy'] } },

  // ── VÍNO ──
  { slug: 'prosecco',    nameKey: 'Prosecco (0.1l)',     price: 4.50, category: 'vino' },
  { slug: 'pinot-grigio',nameKey: 'Pinot Grigio (0.15l)',price: 5.50, category: 'vino' },
  { slug: 'merlot',      nameKey: 'Merlot (0.15l)',      price: 5.50, category: 'vino' },
  { slug: 'rose',        nameKey: 'Rosé (0.15l)',        price: 5.00, category: 'vino' },
];

const tables = [
  // Terasa (letná záhrada vily)
  { number: 'T1', seats: 2, zone: 'terrace', x: 60,  y: 60,  type: 'round', active: true },
  { number: 'T2', seats: 2, zone: 'terrace', x: 160, y: 60,  type: 'round', active: true },
  { number: 'T3', seats: 4, zone: 'terrace', x: 60,  y: 180, type: 'rect',  active: true },
  { number: 'T4', seats: 4, zone: 'terrace', x: 160, y: 180, type: 'rect',  active: true },
  // Hlavná sála (rokoko interiér)
  { number: 'H1', seats: 4, zone: 'main', x: 340, y: 60,  type: 'round', active: true },
  { number: 'H2', seats: 6, zone: 'main', x: 460, y: 60,  type: 'rect',  active: true },
  { number: 'H3', seats: 4, zone: 'main', x: 340, y: 180, type: 'round', active: true },
  { number: 'H4', seats: 8, zone: 'main', x: 460, y: 180, type: 'rect',  active: true },
  // Kaviareň (menšia miestnosť)
  { number: 'K1', seats: 2, zone: 'private', x: 580, y: 60,  type: 'round', active: true },
  { number: 'K2', seats: 4, zone: 'private', x: 580, y: 180, type: 'round', active: true },
];

const testimonials = [
  { name: 'Martina K.', email: 'martina@example.com', rating: 5, text: 'Nádherný priestor v historickej vile. Káva výborná, dezerty úžasné. Odporúčam každému!' },
  { name: 'Peter S.',   email: 'peter@example.com',   rating: 5, text: 'Konečne kvalitná kaviareň v Trnave. Interiér je dych berúci, rokoko fresky sú nádherné.' },
  { name: 'Jana M.',    email: 'jana@example.com',    rating: 4, text: 'Krásne miesto na raňajky alebo obed. Jedlo čerstvé, personál milý a pozorný.' },
  { name: 'Tomáš R.',   email: 'tomas@example.com',   rating: 5, text: 'Najlepšie tiramisu v meste! A cappuccino je úžasné. Terasa v lete je ako raj.' },
];

const knowledgeEntries = [
  { title: 'Otváracie hodiny', content: 'Pondelok-Piatok: 8:00-22:00, Sobota: 9:00-23:00, Nedeľa: 9:00-21:00', category: 'faq' },
  { title: 'Rezervácie', content: 'Rezerváciu stola je možné vykonať cez web, telefonicky na +421 900 000 000, alebo emailom na info@emmerka.sk. Odporúčame rezervovať minimálne 2 hodiny vopred.', category: 'faq' },
  { title: 'So sebou (takeaway)', content: 'Ponúkame jedlo a nápoje so sebou. Objednajte telefonicky alebo priamo v kaviarni. Balenie v ekologických obaloch Emmerka.', category: 'faq' },
  { title: 'Alergény', content: 'Informácie o alergénoch sú uvedené pri každom jedle v menu. Ak máte špeciálne diétne požiadavky, informujte nás pri objednávke.', category: 'faq' },
  { title: 'Súkromné akcie', content: 'Ponúkame priestory pre súkromné akcie, firemné večierky a oslavy. Hlavná sála pojme až 30 hostí, kaviareň až 12. Kontaktujte nás pre individuálnu ponuku.', category: 'faq' },
];

async function main() {
  console.log('🌱 Seeding Emmerka...');

  // 1. Store
  const storeData = {
    name: 'Emmerka',
    description: 'Kaviareň & Reštaurácia v Emmerovej vile',
    vertical: Vertical.RESTAURANT,
    regionBundle: 'EU',
    primaryMode: StoreMode.PHYSICAL,
    address: 'Emmerova Vila, Hlavná ulica',
    city: 'Trnava',
    openingHours: JSON.stringify({
      mon: { open: '08:00', close: '22:00' },
      tue: { open: '08:00', close: '22:00' },
      wed: { open: '08:00', close: '22:00' },
      thu: { open: '08:00', close: '22:00' },
      fri: { open: '08:00', close: '22:00' },
      sat: { open: '09:00', close: '23:00' },
      sun: { open: '09:00', close: '21:00' },
    }),
    phone: '+421 900 000 000',
    email: 'info@emmerka.sk',
    themeConfig: {
      colors: {
        primary:       '#C68A6F',
        primaryDark:   '#5C4638',
        primaryLight:  '#F8F4ED',
        text:          '#5C4638',
        textSecondary: '#8B7355',
        textMuted:     '#D9D0C3',
        border:        '#EDE4D5',
        bgSubtle:      '#F8F4ED',
        bgDark:        '#3A2E25',
        headerBg:      '#F8F4ED',
        success:       '#A3B9C9',
        error:         '#b91c1c',
        warning:       '#D4B48C',
        successLight:  '#E8F0F5',
        errorLight:    '#FEE2E2',
        infoLight:     '#EDE4D5',
        contrast:      '#FFFFFF',
        overlay:       '#5C4638',
        overlayAlpha:  'rgba(92,70,56,0.6)',
      },
      layout: {
        heroType:     'full-width',
        cardStyle:    'border',
        navPosition:  'top',
        borderRadius: 'rounded',
      },
    },
  };

  const store = await db.store.upsert({
    where: { slug: 'emmerka' },
    update: storeData,
    create: {
      slug: 'emmerka',
      ...storeData,
    },
  });
  console.log('✅ Store:', store.name);

  // 2. Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await db.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: cat.slug } },
      update: { nameKey: cat.nameKey, sortOrder: cat.sortOrder },
      create: { storeId: store.id, slug: cat.slug, nameKey: cat.nameKey, sortOrder: cat.sortOrder },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log('✅ Categories:', categoryData.length);

  // 3. Products
  for (const p of products) {
    await db.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: p.slug } },
      update: { price: p.price },
      create: {
        storeId: store.id,
        slug: p.slug,
        nameKey: p.nameKey,
        price: p.price,
        currency: 'EUR',
        inStock: true,
        isHit: (p as { isHit?: boolean }).isHit ?? false,
        isNew: (p as { isNew?: boolean }).isNew ?? false,
        rating: 0,
        reviewCount: 0,
        image: '/placeholder-product.svg',
        categoryId: categoryMap[p.category],
        metadata: (p as { metadata?: object }).metadata ?? null,
      },
    });
  }
  console.log('✅ Products:', products.length);

  // 4. Tables
  for (const t of tables) {
    await db.restaurantTable.upsert({
      where: { storeId_number: { storeId: store.id, number: t.number } },
      update: {},
      create: { storeId: store.id, ...t },
    });
  }
  console.log('✅ Tables:', tables.length);

  // 5. Delivery zone (takeaway only)
  await db.deliveryZone.upsert({
    where: { id: 'emmerka-pickup' },
    update: {},
    create: {
      id: 'emmerka-pickup',
      storeId: store.id,
      name: 'So sebou (takeaway)',
      fee: 0,
      minOrder: 0,
      estimatedMin: 15,
      estimatedMax: 25,
      active: true,
    },
  });
  console.log('✅ DeliveryZone: takeaway');

  // 6. Gallery images (6 placeholders)
  const galleryCount = await db.galleryImage.count({ where: { storeId: store.id } });
  if (galleryCount === 0) {
    for (let i = 0; i < 6; i++) {
      await db.galleryImage.create({
        data: { storeId: store.id, url: '/placeholder-product.svg', alt: `Emmerka foto ${i + 1}`, sortOrder: i, active: true },
      });
    }
    console.log('✅ Gallery: 6 placeholders');
  }

  // 7. Testimonials
  for (const t of testimonials) {
    const customer = await db.customer.upsert({
      where: { storeId_email: { storeId: store.id, email: t.email } },
      update: {},
      create: { storeId: store.id, email: t.email, name: t.name, isVerified: true },
    });
    const exists = await db.testimonial.findFirst({ where: { storeId: store.id, customerId: customer.id } });
    if (!exists) {
      await db.testimonial.create({
        data: { storeId: store.id, customerId: customer.id, text: t.text, rating: t.rating, status: 'APPROVED', locale: 'sk' },
      });
    }
  }
  console.log('✅ Testimonials:', testimonials.length);

  // 8. KnowledgeBase
  for (const e of knowledgeEntries) {
    const exists = await db.knowledgeEntry.findFirst({ where: { storeId: store.id, title: e.title } });
    if (!exists) {
      await db.knowledgeEntry.create({ data: { storeId: store.id, ...e } });
    }
  }
  console.log('✅ KnowledgeBase:', knowledgeEntries.length);

  // 9. Admin user
  const passwordHash = await bcrypt.hash('emmerka2026', 10);
  await db.adminUser.upsert({
    where: { email: 'admin@emmerka.sk' },
    update: {},
    create: { email: 'admin@emmerka.sk', name: 'Admin', role: 'superadmin', passwordHash, storeId: store.id },
  });
  console.log('✅ Admin: admin@emmerka.sk');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); await pool.end(); });
