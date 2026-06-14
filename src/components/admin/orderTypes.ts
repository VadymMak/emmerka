// Prisma-aligned order types for admin UI

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type DeliveryMode = 'SHIPPING' | 'COURIER' | 'PICKUP' | 'DINE_IN';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  deliveryAddress: { city?: string; address?: string; zip?: string } | null;
  deliveryZone: { name: string; fee: number; estimatedMin?: number; estimatedMax?: number } | null;
  deliveryFee: number;
  trackingNumber: string | null;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  subtotal: number;
  total: number;
  currency: string;
  customerNote: string | null;
  internalNote: string | null;
  createdAt: string;
  customer: { name: string; email: string; phone: string | null } | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { nameKey: string; image: string | null } | null;
  }[];
}

export const STATUS_ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export const STATUS_LABELS_ECOMMERCE: Record<OrderStatus, string> = {
  PENDING: 'Nový',
  CONFIRMED: 'Potvrdený',
  PROCESSING: 'V spracovaní',
  SHIPPED: 'Odoslaný',
  DELIVERED: 'Doručený',
  CANCELLED: 'Zrušený',
  REFUNDED: 'Vrátenie',
};

export const STATUS_LABELS_FOOD: Record<OrderStatus, string> = {
  PENDING: 'Nový',
  CONFIRMED: 'Potvrdený',
  PROCESSING: 'Pripravuje sa',
  SHIPPED: 'Doručuje sa',
  DELIVERED: 'Doručený',
  CANCELLED: 'Zrušený',
  REFUNDED: 'Vrátenie',
};

export const STATUS_LABELS_FOOD_PICKUP: Record<OrderStatus, string> = {
  PENDING: 'Nový',
  CONFIRMED: 'Potvrdený',
  PROCESSING: 'Balí sa',
  SHIPPED: 'Pripravený na výdaj',
  DELIVERED: 'Vydané',
  CANCELLED: 'Zrušený',
  REFUNDED: 'Vrátenie',
};

export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  SHIPPING: 'Pošta',
  COURIER: 'Kuriér',
  PICKUP: 'Vyzdvihnutie',
  DINE_IN: 'V reštaurácii',
};

export function getStatusLabels(
  vertical: string,
  deliveryMode?: DeliveryMode | null,
): Record<OrderStatus, string> {
  if (vertical === 'FOOD_MARKET') {
    return deliveryMode === 'PICKUP' ? STATUS_LABELS_FOOD_PICKUP : STATUS_LABELS_FOOD;
  }
  return STATUS_LABELS_ECOMMERCE;
}

export const fmtPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat('sk-SK', { style: 'currency', currency: currency || 'EUR', minimumFractionDigits: 2 }).format(amount);
