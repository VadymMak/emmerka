import { db } from '@/lib/db';
import { DEFAULT_THEME, type ThemeConfig } from '@/lib/theme';
import { getVerticalConfig, type VerticalConfig } from '@/lib/verticals';

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

export type StoreMode = 'PHYSICAL' | 'ONLINE' | 'HYBRID';

export interface StorePresence {
  primaryMode: StoreMode;
  hasPhysicalLocation: boolean;
  hasDelivery: boolean;
  hasPickup: boolean;
  address?: string;
  city?: string;
  openingHours?: string;
  phone?: string;
  email?: string;
  mapCoords?: { lat: number; lng: number };
}

export interface StoreConfig {
  id: string;
  name: string;
  slug: string;
  theme: ThemeConfig;
  vertical: VerticalConfig;
  presence: StorePresence;
}

/** Fetch merged store config (theme + vertical + presence). Server components only. */
export async function getStoreConfig(): Promise<StoreConfig> {
  const store = await db.store.findUniqueOrThrow({
    where: { slug: STORE_SLUG },
    select: {
      id: true,
      name: true,
      slug: true,
      vertical: true,
      themeConfig: true,
      primaryMode: true,
      address: true,
      city: true,
      openingHours: true,
      phone: true,
      email: true,
      mapLat: true,
      mapLng: true,
    },
  });

  const dbTheme = store.themeConfig as Partial<ThemeConfig> | null;
  const theme: ThemeConfig = {
    colors: { ...DEFAULT_THEME.colors, ...(dbTheme?.colors ?? {}) },
    layout: { ...DEFAULT_THEME.layout, ...(dbTheme?.layout ?? {}) },
  };

  const mode = store.primaryMode as StoreMode;

  const presence: StorePresence = {
    primaryMode: mode,
    hasPhysicalLocation: !!store.address,
    hasDelivery: mode !== 'PHYSICAL',
    hasPickup: mode !== 'ONLINE',
    address: store.address ?? undefined,
    city: store.city ?? undefined,
    openingHours: store.openingHours ?? undefined,
    phone: store.phone ?? undefined,
    email: store.email ?? undefined,
    mapCoords:
      store.mapLat && store.mapLng
        ? { lat: store.mapLat, lng: store.mapLng }
        : undefined,
  };

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    theme,
    vertical: getVerticalConfig(store.vertical),
    presence,
  };
}
