export type PromoStatus = 'active' | 'scheduled' | 'finished';
export type PromoType = 'brand' | 'category' | 'promocode' | 'freeDelivery';

export const PROMO_TYPES: PromoType[] = ['brand', 'category', 'promocode', 'freeDelivery'];

export const PROMO_TYPE_LABEL: Record<PromoType, string> = {
  brand: 'Zľava na značku',
  category: 'Zľava na kategóriu',
  promocode: 'Promokód',
  freeDelivery: 'Bezplatné doručenie',
};

export const PROMO_STATUS_LABEL: Record<PromoStatus, string> = {
  active: 'Aktívna',
  scheduled: 'Naplánovaná',
  finished: 'Dokončená',
};

export interface PromoFormData {
  title: string;
  type: PromoType;
  discount: string;
  target: string;
  startDate: string;
  endDate: string;
  announcement: string;
}
