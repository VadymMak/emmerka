import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import { cookies } from 'next/headers';
import { Prisma, DeliveryMode, OrderStatus, PaymentStatus } from '@prisma/client';

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

interface CartItem {
  id: string;
  slug: string;
  brand: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  currency: string;
  quantity: number;
}

interface CheckoutBody {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  deliveryMethod: 'branch' | 'courier' | 'pickup' | 'dine_in';
  city: string;
  branch: string;
  paymentMethod: string;
  comment: string;
  items: CartItem[];
  tableNumber?: string;
  timeSlot?: string;
}

// GET /api/orders — admin only list
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20', 10));

  try {
    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });
    const where: Prisma.OrderWhereInput = {
      storeId: store.id,
      ...(status ? { status: status as OrderStatus } : {}),
    };

    const [total, orders] = await Promise.all([
      db.order.count({ where }),
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      }),
    ]);

    return NextResponse.json({ orders, total, page, pageSize });
  } catch (error) {
    console.error('[GET /api/orders]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/orders — create order from checkout
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;

    if (!body.firstName || !body.lastName || !body.phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    // Verify products exist and get current prices
    const productIds = body.items.map((i) => i.id);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds }, storeId: store.id },
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 400 });
    }

    // Calculate totals using DB prices (not client-sent prices — security)
    const subtotal = body.items.reduce((sum, item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.id);
      return sum + (dbProduct?.price ?? item.price) * item.quantity;
    }, 0);

    const deliveryFee = body.deliveryMethod === 'pickup' ? 0 : 0; // TODO: calculate by zone
    const total = subtotal + deliveryFee;

    // Generate human-readable order number
    const orderCount = await db.order.count({ where: { storeId: store.id } });
    const slugPrefix = store.slug.substring(0, 2).toUpperCase();
    const orderNumber = `${slugPrefix}-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;

    // Upsert customer by email
    let customerId: string | null = null;
    if (body.email) {
      const customer = await db.customer.upsert({
        where: { storeId_email: { storeId: store.id, email: body.email } },
        update: {
          name: `${body.firstName} ${body.lastName}`,
          phone: body.phone,
        },
        create: {
          email: body.email,
          name: `${body.firstName} ${body.lastName}`,
          phone: body.phone,
          storeId: store.id,
        },
      });
      customerId = customer.id;
    }

    const deliveryModeMap: Record<CheckoutBody['deliveryMethod'], DeliveryMode> = {
      branch:  DeliveryMode.SHIPPING,
      courier: DeliveryMode.COURIER,
      pickup:  DeliveryMode.PICKUP,
      dine_in: DeliveryMode.DINE_IN,
    };

    const order = await db.order.create({
      data: {
        orderNumber,
        storeId: store.id,
        customerId,
        guestEmail: customerId ? null : body.email,
        guestName: customerId ? null : `${body.firstName} ${body.lastName}`,
        guestPhone: customerId ? null : body.phone,
        deliveryMode: deliveryModeMap[body.deliveryMethod],
        deliveryAddress: {
          city: body.city || null,
          branch: body.branch || null,
          country: store.vertical === 'RESTAURANT' ? 'IT' : 'UA',
          ...(body.tableNumber ? { tableNumber: body.tableNumber } : {}),
          ...(body.timeSlot ? { timeSlot: body.timeSlot } : {}),
        },
        paymentMethod: body.paymentMethod,
        paymentStatus: PaymentStatus.UNPAID,
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        currency: store.vertical === 'RESTAURANT' ? '€' : 'грн',
        customerNote: body.comment || null,
        items: {
          create: body.items.map((item) => {
            const dbProduct = dbProducts.find((p) => p.id === item.id);
            return {
              productId: item.id,
              quantity: item.quantity,
              price: dbProduct?.price ?? item.price,
            };
          }),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/orders]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
