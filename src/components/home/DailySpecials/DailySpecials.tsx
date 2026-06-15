'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/useCartStore';
import { useVerticalConfig } from '@/lib/vertical-context';
import ScrollReveal from '@/components/ui/ScrollReveal/ScrollReveal';
import styles from './DailySpecials.module.css';

interface SpecialItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  currency: string;
  image?: string;
  badge?: 'chef' | 'popular' | 'new';
  dietaryLabels?: string[];
}

interface DailySpecialsProps {
  items?: SpecialItem[];
}

const RESTAURANT_SPECIALS: SpecialItem[] = [
  {
    id: 'special-1',
    slug: 'spaghetti-carbonara',
    name: 'Spaghetti Carbonara',
    description: 'Classic Roman pasta with guanciale, egg, pecorino, and black pepper',
    price: 12.90,
    currency: 'EUR',
    badge: 'chef',
  },
  {
    id: 'special-2',
    slug: 'osso-buco',
    name: 'Osso Buco',
    description: 'Slow-braised veal shank with gremolata and saffron risotto',
    price: 24.50,
    currency: 'EUR',
    badge: 'popular',
  },
  {
    id: 'special-3',
    slug: 'tiramisu',
    name: 'Tiramisù',
    description: 'Our signature dessert — mascarpone, espresso, and cocoa',
    price: 8.90,
    currency: 'EUR',
    badge: 'new',
  },
];

const FOOD_MARKET_SPECIALS: SpecialItem[] = [
  {
    id: 'special-1',
    slug: 'strawberries',
    name: 'Fresh Strawberries',
    description: 'Organic, hand-picked this morning — limited daily supply',
    price: 3.49,
    currency: 'EUR',
    badge: 'new',
  },
  {
    id: 'special-2',
    slug: 'sourdough-bread',
    name: 'Sourdough Bread',
    description: 'Freshly baked today — artisan recipe with 48h fermentation',
    price: 3.49,
    currency: 'EUR',
    badge: 'popular',
  },
  {
    id: 'special-3',
    slug: 'greek-yogurt',
    name: 'Greek Yogurt',
    description: 'Organic, high-protein — perfect for breakfast',
    price: 2.29,
    currency: 'EUR',
    badge: 'new',
  },
];

const BADGE_CLASS: Record<NonNullable<SpecialItem['badge']>, string> = {
  chef:    styles.badgeChef,
  popular: styles.badgePopular,
  new:     styles.badgeNew,
};

const DIETARY_EMOJI: Record<string, string> = {
  vegan:        '🌱',
  vegetarian:   '🥬',
  'gluten-free': '🌾',
  'dairy-free':  '🥛',
  'nut-free':    '🥜',
  spicy:        '🌶️',
};

const DIETARY_SHORT: Record<string, string> = {
  vegan:        'Vegan',
  vegetarian:   'Veg',
  'gluten-free': 'GF',
  'dairy-free':  'DF',
  'nut-free':    'NF',
  spicy:        'Spicy',
};

export default function DailySpecials({ items }: DailySpecialsProps) {
  const t = useTranslations('dailySpecials');
  const addItem = useCartStore((s) => s.addItem);
  const vConfig = useVerticalConfig();
  const isRestaurant = vConfig.vertical === 'RESTAURANT';

  const specials = items ?? (isRestaurant ? RESTAURANT_SPECIALS : FOOD_MARKET_SPECIALS);

  const BADGE_LABEL: Record<NonNullable<SpecialItem['badge']>, string> = isRestaurant
    ? {
        chef:    `⭐ ${t('chefPick')}`,
        popular: `🔥 ${t('popular')}`,
        new:     `✨ ${t('new')}`,
      }
    : {
        chef:    `⭐ ${t('staffPick')}`,
        popular: `🔥 ${t('popular')}`,
        new:     `✨ ${t('freshToday')}`,
      };

  return (
    <section className={styles.section}>
      {/* Section header */}
      <div className={styles.header}>
        <p className={styles.tagline}>{isRestaurant ? t('tagline') : t('taglineFood')}</p>
        <h2 className={styles.title}>{isRestaurant ? t('title') : t('titleFood')}</h2>
        <p className={styles.subtitle}>{isRestaurant ? t('subtitle') : t('subtitleFood')}</p>
      </div>

      {/* Cards grid */}
      <div className={styles.grid}>
        {specials.map((item, i) => (
          <ScrollReveal key={item.id} animation="fadeUp" delay={i * 150}>
          <div className={styles.card}>
            {/* Image area */}
            <div className={styles.imageWrap}>
              {item.image && !item.image.endsWith('.svg') ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className={styles.dishImage}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className={styles.imagePlaceholder} />
              )}
              {item.badge && (
                <span className={`${styles.badge} ${BADGE_CLASS[item.badge]}`}>
                  {BADGE_LABEL[item.badge]}
                </span>
              )}
            </div>

            {/* Card body */}
            <div className={styles.cardBody}>
              <p className={styles.dishName}>{item.name}</p>
              <p className={styles.dishDesc}>{item.description}</p>

              {item.dietaryLabels && item.dietaryLabels.length > 0 && (
                <div className={styles.dietaryRow}>
                  {item.dietaryLabels.map((tag) => (
                    <span key={tag} className={styles.dietaryTag}>
                      {DIETARY_EMOJI[tag] ?? ''} {DIETARY_SHORT[tag] ?? tag}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.cardFooter}>
                <div className={styles.priceBlock}>
                  {item.oldPrice != null && item.oldPrice > item.price && (
                    <span className={styles.oldPrice}>
                      {new Intl.NumberFormat('sk-SK', { style: 'currency', currency: item.currency, minimumFractionDigits: 2 }).format(item.oldPrice)}
                    </span>
                  )}
                  <span className={styles.price}>
                    {new Intl.NumberFormat('sk-SK', { style: 'currency', currency: item.currency, minimumFractionDigits: 2 }).format(item.price)}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.orderBtn}
                  onClick={() =>
                    addItem({
                      id: item.id,
                      slug: item.slug,
                      name: item.name,
                      brand: '',
                      image: item.image ?? '/placeholder-product.svg',
                      price: item.price,
                      currency: item.currency,
                    })
                  }
                >
                  {isRestaurant ? t('order') : t('orderFood')}
                </button>
              </div>
            </div>
          </div>
          </ScrollReveal>
        ))}
      </div>

      <p className={styles.updatedNote}>{isRestaurant ? t('updatedAt') : t('updatedAtFood')}</p>
    </section>
  );
}
