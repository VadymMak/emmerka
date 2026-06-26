import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import ProductPage, { type ResolvedProduct } from '@/components/product/ProductPage/ProductPage';
import type { ProductSpec } from '@/components/product/ProductTabs/ProductTabs';
import { db } from '@/lib/db';
import { getBaseUrl } from '@/lib/url';
import { routing } from '@/i18n/routing';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/breadcrumbs';

export const revalidate = 60;

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

interface ProductMetadata {
  sku?: string;
  stockQty?: number;
  images?: string[];
  specs?: Record<string, ProductSpec[]>;
  description?: Record<string, string>;
  // Restaurant fields:
  portionSize?: string;
  cookTime?: number;
  spiceLevel?: string;
  allergens?: string[];
  calories?: number;
  vegetarian?: boolean;
  vegan?: boolean;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = getBaseUrl();
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return {};
  const product = await db.product.findFirst({ where: { storeId: store.id, slug } });
  if (!product) return {};
  const ts = await getTranslations({ locale, namespace: 'sampleProducts' });
  const tp = await getTranslations({ locale, namespace: 'product' });
  const name = ts.has(product.nameKey) ? ts(product.nameKey) : product.nameKey;
  const meta = (product.metadata ?? {}) as Record<string, unknown>;
  const description =
    (meta.description as Record<string, string> | undefined)?.[locale] ??
    (meta.description as Record<string, string> | undefined)?.['en'] ??
    `${name} — ${store.name}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${baseUrl}/${loc}/product/${slug}`;
  }

  return {
    title: `${name} | ${tp('breadcrumbCatalog')}`,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/product/${slug}`,
      languages,
    },
    openGraph: {
      type: 'website',
      title: name,
      description,
      url: `${baseUrl}/${locale}/product/${slug}`,
      images: product.image ? [{ url: product.image, width: 600, height: 400, alt: name }] : [],
      siteName: store.name,
    },
    twitter: {
      card: product.image ? 'summary_large_image' : 'summary',
      title: name,
      description,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) notFound();

  const product = await db.product.findFirst({
    where: { storeId: store.id, slug },
  });
  if (!product) notFound();

  const ts = await getTranslations('sampleProducts');
  const tp = await getTranslations('product');
  const name = ts.has(product.nameKey) ? ts(product.nameKey) : product.nameKey;

  const meta = (product.metadata ?? {}) as ProductMetadata;
  const isRestaurant = store.vertical === 'RESTAURANT';

  // Resolve locale-aware specs and description
  const specs: ProductSpec[] =
    meta.specs?.[locale] ?? meta.specs?.['en'] ?? meta.specs?.['uk'] ?? [];

  const description: string =
    meta.description?.[locale] ??
    meta.description?.['en'] ??
    meta.description?.['uk'] ??
    tp('genericDescription', { name });

  const resolved: ResolvedProduct = {
    id: product.id,
    slug: product.slug,
    brand: product.brand ?? '',
    name,
    description,
    price: product.price,
    oldPrice: product.oldPrice ?? undefined,
    currency: product.currency,
    rating: product.rating,
    reviewCount: product.reviewCount,
    inStock: product.inStock,
    stockQty: isRestaurant ? 0 : (meta.stockQty ?? 10),
    sku: isRestaurant ? '' : (meta.sku ?? product.slug.toUpperCase()),
    images: meta.images ?? [product.image ?? '/placeholder-product.svg'],
    specs,
    // Restaurant fields
    portionSize: meta.portionSize,
    cookTime: meta.cookTime !== undefined ? String(meta.cookTime) + ' min' : undefined,
    allergens: meta.allergens,
    calories: meta.calories,
    vegetarian: meta.vegetarian,
    vegan: meta.vegan,
  };

  const baseUrl = getBaseUrl();

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: meta.images?.[0] ?? product.image ?? undefined,
    sku: isRestaurant ? undefined : (meta.sku ?? product.slug.toUpperCase()),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency === 'грн' ? 'UAH' : product.currency === '€' ? 'EUR' : product.currency,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/${locale}/product/${slug}`,
    },
    ...(product.rating > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 1,
        bestRating: 5,
      },
    } : {}),
  };

  const category = await db.category.findFirst({
    where: { id: product.categoryId ?? '' },
    select: { nameKey: true, slug: true },
  });

  const catName = category
    ? (ts.has(category.nameKey) ? ts(category.nameKey) : category.nameKey)
    : null;

  const breadcrumbs = buildBreadcrumbSchema(locale, [
    { name: store.name, url: `/${locale}` },
    { name: tp('breadcrumbCatalog'), url: `/${locale}/catalog` },
    ...(catName && category ? [{ name: catName, url: `/${locale}/category/${category.slug}` }] : []),
    { name },
  ]);

  return (
    <>
      <JsonLd data={[productSchema, breadcrumbs]} />
      <ProductPage product={resolved} vertical={store.vertical} />
    </>
  );
}
