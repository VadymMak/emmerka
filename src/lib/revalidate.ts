import { revalidatePath, revalidateTag } from 'next/cache';

const LOCALES = ['en', 'de', 'sk', 'cs', 'uk', 'ru', 'pl'];

export function revalidateStorefront() {
  revalidatePath('/', 'layout');
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}`);
  }
  revalidateTag('products');
}

export function revalidateCatalog() {
  revalidateStorefront();
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}/catalog`);
  }
}
