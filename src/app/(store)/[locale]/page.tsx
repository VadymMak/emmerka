import { unstable_cache } from 'next/cache';
import { setRequestLocale } from 'next-intl/server';
import HomeClient, { type ProductData } from '@/components/home/HomeClient/HomeClient';
import { db } from '@/lib/db';
import JsonLd from '@/components/seo/JsonLd';
import { getBaseUrl } from '@/lib/url';

export const revalidate = 60;

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

const getHitProducts = unstable_cache(
  (storeId: string) =>
    db.product.findMany({
      where: { storeId, isHit: true, inStock: true },
      orderBy: { rating: 'desc' },
      take: 3,
    }),
  ['daily-specials'],
  { tags: ['products'], revalidate: 60 },
);

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

  const [hitProducts, approvedTestimonials, testimonialsCount, dbCategories, dbSpecials] = await Promise.all([
    db.product.findMany({
      where: { storeId: store.id, isHit: true, inStock: true },
      orderBy: { reviewCount: 'desc' },
      take: 4,
    }),
    db.testimonial.findMany({
      where: { storeId: store.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { customer: { select: { name: true } } },
    }),
    db.testimonial.count({
      where: { storeId: store.id, status: 'APPROVED' },
    }),
    db.category.findMany({
      where: { storeId: store.id },
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    getHitProducts(store.id),
  ]);

  const testimonialItems = approvedTestimonials.map((t) => ({
    id: t.id,
    customerName: t.customer.name ?? 'Customer',
    text: t.text,
    rating: t.rating,
    locale: t.locale,
    createdAt: t.createdAt.toISOString(),
    adminReply: t.adminReply,
  }));

  const products: ProductData[] = hitProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    brand: p.brand ?? '',
    name: p.nameKey,
    image: p.image ?? '/placeholder-product.svg',
    price: p.price,
    oldPrice: p.oldPrice ?? undefined,
    currency: p.currency,
    rating: p.rating,
    reviewCount: p.reviewCount,
    inStock: p.inStock,
    isHit: p.isHit,
    isNew: p.isNew,
    metadata: p.metadata as Record<string, unknown> | null,
  }));

  const menuCategories = dbCategories.map((c) => ({
    slug: c.slug,
    nameKey: c.nameKey,
    image: c.image ?? undefined,
    productCount: c._count.products,
  }));

  const BADGE_MAP = ['chef', 'popular', 'new'] as const;
  const dailySpecials = dbSpecials.map((p, i) => ({
    id: p.id,
    slug: p.slug,
    name: p.nameKey,
    description: ((p.metadata as Record<string, unknown> | null)?.description as string) ?? '',
    price: p.price,
    currency: p.currency,
    image: p.image ?? undefined,
    badge: BADGE_MAP[i % 3],
  }));

  const baseUrl = getBaseUrl();
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: store.name,
    url: `${baseUrl}/${locale}`,
    address: store.address ? { '@type': 'PostalAddress', streetAddress: store.address } : undefined,
    telephone: store.phone ?? undefined,
    email: store.email ?? undefined,
  };

  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <HomeClient
        products={products}
        storeName={store.name}
        menuCategories={menuCategories.length > 0 ? menuCategories : undefined}
        dailySpecials={dailySpecials.length > 0 ? dailySpecials : undefined}
        testimonials={testimonialItems}
        testimonialsCount={testimonialsCount}
      />
    </>
  );
}
