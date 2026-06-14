import { db } from '@/lib/db';
import DeliveryZonesClient from './DeliveryZonesClient';

export default async function DeliveryZonesPage() {
  const zones = await db.deliveryZone.findMany({
    orderBy: { name: 'asc' },
  });

  return <DeliveryZonesClient zones={zones} />;
}
