import { getBaseUrl } from '@/lib/url';

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export function buildBreadcrumbSchema(locale: string, items: BreadcrumbItem[]) {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url
        ? { item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}` }
        : {}),
    })),
  };
}
