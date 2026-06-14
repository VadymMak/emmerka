import { type Locale } from './i18n/routing';

/**
 * Region bundles.
 *
 * The template bundles all six locales (see `src/i18n/routing.ts`), but a given
 * deployment only *activates* a subset. The active subset is chosen at runtime
 * via the `REGION_BUNDLE` server env var — no rebuild required, so one image
 * can serve every region.
 *
 * - `UA`  → Ukrainian-first store: uk, ru, en
 * - `EU`  → EU store: de (default), en, plus sk / cs where the country needs them
 */
export type RegionBundle = 'EU';

interface BundleConfig {
  locales: Locale[];
  defaultLocale: Locale;
}

export const REGION_BUNDLES = {
  EU: { locales: ['sk'], defaultLocale: 'sk' },
} satisfies Record<RegionBundle, BundleConfig>;

export const activeBundle: RegionBundle = 'EU';

/** Locales exposed to users for the active bundle (e.g. for a language switcher). */
export function getActiveLocales(): Locale[] {
  return REGION_BUNDLES[activeBundle].locales;
}

/** Default locale for the active bundle. */
export function getDefaultLocale(): Locale {
  return REGION_BUNDLES[activeBundle].defaultLocale;
}

/** Whether a locale is active for this deployment. */
export function isLocaleActive(locale: string): locale is Locale {
  return (getActiveLocales() as string[]).includes(locale);
}
