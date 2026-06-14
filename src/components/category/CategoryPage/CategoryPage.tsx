'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ProductCard, {
  type ProductCardProps,
} from '@/components/catalog/ProductCard/ProductCard';
import FilterSidebar from '@/components/catalog/FilterSidebar/FilterSidebar';
import type { CatalogProduct } from '@/components/catalog/CatalogPage/CatalogPage';
import styles from './CategoryPage.module.css';

export interface CategoryPageProps {
  slug: string;
  products: CatalogProduct[];
}

const onAddToCart = (id: string) => console.log('[addToCart]', id);
const onCompare = (id: string) => console.log('[compare]', id);
const onFavorite = (id: string) => console.log('[favorite]', id);

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const CATEGORY_ICONS: Record<string, ReactNode> = {
  kava: (
    <svg {...iconProps}><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
  ),
  napoje: (
    <svg {...iconProps}><path d="M8 2h8l1 9H7L8 2z"/><path d="M5 11h14"/><path d="M7 15h10l-1 6H8L7 15z"/></svg>
  ),
  ranajky: (
    <svg {...iconProps}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
  ),
  obedy: (
    <svg {...iconProps}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
  ),
  dezerty: (
    <svg {...iconProps}><path d="M12 2a6 6 0 0 0-6 6c0 3.3 6 14 6 14s6-10.7 6-14a6 6 0 0 0-6-6z"/></svg>
  ),
  vino: (
    <svg {...iconProps}><path d="M8 22h8"/><path d="M12 11v11"/><path d="M20 2H4l2 13h12L20 2z"/></svg>
  ),
};

export default function CategoryPage({ slug, products }: CategoryPageProps) {
  const t = useTranslations('category');
  const tc = useTranslations('categories');
  const tb = useTranslations('product'); // breadcrumb labels
  const name = tc(slug);

  return (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label={tb('breadcrumbCatalog')}>
        <Link href="/">{tb('breadcrumbHome')}</Link>
        <span className={styles.sep}>/</span>
        <Link href="/catalog">{tb('breadcrumbCatalog')}</Link>
        <span className={styles.sep}>/</span>
        <span className={styles.current}>{name}</span>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <span className={styles.icon} aria-hidden="true">
          {CATEGORY_ICONS[slug] ?? null}
        </span>
        <div className={styles.heroInfo}>
          <h1 className={styles.title}>{name}</h1>
          <span className={styles.count}>{t('productsCount', { count: products.length })}</span>
        </div>
      </section>

      <h2 className={styles.gridTitle}>{t('allProducts')}</h2>

      <div className={styles.body}>
        <FilterSidebar />
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...(product as ProductCardProps)}
              onAddToCart={onAddToCart}
              onCompare={onCompare}
              onFavorite={onFavorite}
            />
          ))}
        </div>
      </div>

      {/* SEO text block (GEO strategy) */}
      <section className={styles.seo}>{t('seoText', { category: name })}</section>
    </div>
  );
}
