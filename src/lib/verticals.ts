import type { Vertical } from '@prisma/client';

// ── Feature flags per vertical ────────────────────────────────────────────

export interface VerticalConfig {
  vertical: string;
  label: string;

  product: {
    metadataFields: MetadataField[];
    showBrand: boolean;
    showSku: boolean;
    cardVariant: 'standard' | 'food' | 'menu-item' | 'bulk';
    priceUnit?: string;
  };

  delivery: {
    modes: DeliveryModeConfig[];
    showEstimatedTime: boolean;
    showZonesMap: boolean;
    defaultMinOrder: number;
  };

  checkout: {
    showCompanyFields: boolean;
    showTimeSlots: boolean;
    showTableNumber: boolean;
    paymentMethods: PaymentMethod[];
  };

  ui: {
    homeSections: HomeSection[];
    catalogStyle: 'grid' | 'list' | 'menu';
    categoryDisplay: 'sidebar' | 'tabs' | 'chips';
    addToCartLabel: string;
  };

  store: {
    showHours: boolean;
    showReservation: boolean;
    defaultCurrency: string;
    defaultRegion: string;
  };
}

// ── Sub-types ─────────────────────────────────────────────────────────────

export interface MetadataField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'tags';
  options?: string[];
  required?: boolean;
  group?: string;
}

export interface DeliveryModeConfig {
  mode: 'SHIPPING' | 'COURIER' | 'PICKUP' | 'DINE_IN';
  label: string;
  enabled: boolean;
  icon?: string;
}

export type PaymentMethod = 'card' | 'cod' | 'invoice' | 'liqpay' | 'wayforpay' | 'at_table';

export type HomeSection =
  | 'hero'
  | 'trust-strip'
  | 'delivery-zones'
  | 'menu-categories'
  | 'daily-specials'
  | 'reservations'
  | 'gallery'
  | 'about'
  | 'testimonials';

// ── Default configs ───────────────────────────────────────────────────────

export const VERTICAL_CONFIGS: Record<Vertical, VerticalConfig> = {
  RESTAURANT: {
    vertical: 'RESTAURANT',
    label: 'Restaurant',
    product: {
      metadataFields: [
        { key: 'portionSize', label: 'Portion (g/ml)',  type: 'text',   required: true, group: 'Menu' },
        { key: 'cookTime',    label: 'Cook time (min)', type: 'number', group: 'Menu' },
        { key: 'spiceLevel',  label: 'Spice level',     type: 'select', options: ['mild', 'medium', 'hot', 'extra-hot'], group: 'Menu' },
        { key: 'allergens',   label: 'Allergens',       type: 'tags',   group: 'Nutrition' },
        { key: 'calories',    label: 'Calories (kcal)', type: 'number', group: 'Nutrition' },
        { key: 'vegetarian',  label: 'Vegetarian',      type: 'boolean', group: 'Nutrition' },
        { key: 'vegan',       label: 'Vegan',           type: 'boolean', group: 'Nutrition' },
      ],
      showBrand: false,
      showSku: false,
      cardVariant: 'menu-item',
      priceUnit: '/ portion',
    },
    delivery: {
      modes: [
        { mode: 'DINE_IN', label: 'Dine in',  enabled: true, icon: '🍽️' },
        { mode: 'PICKUP',  label: 'Takeaway',  enabled: true, icon: '🥡' },
      ],
      showEstimatedTime: true,
      showZonesMap: false,
      defaultMinOrder: 0,
    },
    checkout: {
      showCompanyFields: false,
      showTimeSlots: true,
      showTableNumber: true,
      paymentMethods: ['card', 'at_table'],
    },
    ui: {
      homeSections: ['hero', 'menu-categories', 'daily-specials', 'trust-strip', 'reservations', 'gallery', 'about', 'testimonials'],
      catalogStyle: 'menu',
      categoryDisplay: 'tabs',
      addToCartLabel: 'Order',
    },
    store: {
      showHours: true,
      showReservation: true,
      defaultCurrency: 'EUR',
      defaultRegion: 'SK',
    },
  },
};

// ── Helper ────────────────────────────────────────────────────────────────

export function getVerticalConfig(vertical: Vertical): VerticalConfig {
  return VERTICAL_CONFIGS[vertical];
}
