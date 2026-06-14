import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import OrderSuccess from '@/components/checkout/OrderSuccess/OrderSuccess';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return { title: t('successTitle') };
}

export default async function CheckoutSuccessRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OrderSuccess />;
}
