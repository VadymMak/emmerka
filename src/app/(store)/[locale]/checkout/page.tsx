import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import CheckoutPage from '@/components/checkout/CheckoutPage/CheckoutPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return { title: t('title') };
}

export default async function CheckoutRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CheckoutPage />;
}
