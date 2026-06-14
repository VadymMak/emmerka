import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware navigation APIs. These automatically prepend the active locale,
// so links use unprefixed hrefs (e.g. href="/cart", not `/${locale}/cart`).
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
