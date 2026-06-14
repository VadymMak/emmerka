import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import { cookies } from 'next/headers';
import { OrderStatus, PaymentStatus } from '@prisma/client';

type Params = { params: Promise<{ id: string }> };

// GET /api/orders/[id] — single order (admin or guest by orderNumber)
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const order = await db.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        items: { include: { product: true } },
        customer: true,
        deliveryZone: true,
      },
    });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.error('[GET /api/orders/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — update status (admin only)
export async function PATCH(request: Request, { params }: Params) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const body = (await request.json()) as {
      status?: string;
      paymentStatus?: string;
      trackingNumber?: string;
      internalNote?: string;
    };

    const order = await db.order.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status as OrderStatus } : {}),
        ...(body.paymentStatus ? { paymentStatus: body.paymentStatus as PaymentStatus } : {}),
        ...(body.trackingNumber !== undefined ? { trackingNumber: body.trackingNumber } : {}),
        ...(body.internalNote !== undefined ? { internalNote: body.internalNote } : {}),
      },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error('[PATCH /api/orders/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
