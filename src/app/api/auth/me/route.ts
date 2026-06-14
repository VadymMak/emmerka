import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentCustomer } from '@/lib/customerAuth';

export async function GET(request: Request) {
  const auth = await getCurrentCustomer(request);
  if (!auth) {
    return NextResponse.json({ customer: null });
  }

  const customer = await db.customer.findUnique({
    where: { id: auth.customerId },
    select: { id: true, email: true, name: true, phone: true, createdAt: true },
  });

  if (!customer) {
    return NextResponse.json({ customer: null });
  }

  return NextResponse.json({ customer });
}
