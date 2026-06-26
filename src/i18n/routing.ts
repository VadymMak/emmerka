import { defineRouting } from 'next-intl/routing';

/**
 * The single source of truth for locale routing — shared by the middleware,
 * the navigation helpers (`src/i18n/navigation.ts`) and the request config.
 * All six locales are always routable; `REGION_BUNDLE` (see `src/config.ts`)
 * only influences a UI language switcher, never which routes exist.
 */
export const routing = defineRouting({
  locales: ['sk', 'de'],
  defaultLocale: 'sk',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
