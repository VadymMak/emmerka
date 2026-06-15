import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import { cookies } from 'next/headers';
import { revalidateCatalog } from '@/lib/revalidate';

type Params = { params: Promise<{ id: string }> };

// GET /api/products/[id] — single product by DB id or slug
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const product = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { category: true },
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error('[GET /api/products/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/products/[id] — update (admin only)
export async function PATCH(request: Request, { params }: Params) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const product = await db.product.update({
      where: { id },
      data: {
        ...(body.slug !== undefined ? { slug: String(body.slug) } : {}),
        ...(body.nameKey !== undefined ? { nameKey: String(body.nameKey) } : {}),
        ...(body.brand !== undefined ? { brand: body.brand ? String(body.brand) : null } : {}),
        ...(body.image !== undefined ? { image: body.image ? String(body.image) : null } : {}),
        ...(body.price !== undefined ? { price: Number(body.price) } : {}),
        ...(body.oldPrice !== undefined ? { oldPrice: body.oldPrice ? Number(body.oldPrice) : null } : {}),
        ...(body.inStock !== undefined ? { inStock: Boolean(body.inStock) } : {}),
        ...(body.isHit !== undefined ? { isHit: Boolean(body.isHit) } : {}),
        ...(body.isNew !== undefined ? { isNew: Boolean(body.isNew) } : {}),
        ...(body.metadata !== undefined
          ? {
              metadata:
                body.metadata !== null
                  ? (body.metadata as Prisma.InputJsonValue)
                  : Prisma.JsonNull,
            }
          : {}),
        ...(body.categoryId !== undefined && body.categoryId !== null
          ? { categoryId: String(body.categoryId) }
          : {}),
      },
    });
    revalidateCatalog();
    return NextResponse.json(product);
  } catch (error) {
    console.error('[PATCH /api/products/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/products/[id] — delete (admin only)
export async function DELETE(_request: Request, { params }: Params) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    revalidateCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/products/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
