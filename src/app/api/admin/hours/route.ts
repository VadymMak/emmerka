import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUniqueOrThrow({
    where: { slug: STORE_SLUG },
    select: { metadata: true },
  });

  const metadata = (store.metadata ?? {}) as Record<string, unknown>;
  return NextResponse.json({ workingHours: metadata.workingHours ?? null });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as { workingHours: Record<string, unknown> };
  if (!body.workingHours) {
    return NextResponse.json({ error: 'workingHours required' }, { status: 400 });
  }

  const store = await db.store.findUniqueOrThrow({
    where: { slug: STORE_SLUG },
    select: { metadata: true },
  });

  const metadata = (store.metadata ?? {}) as Record<string, unknown>;
  metadata.workingHours = body.workingHours;

  await db.store.update({
    where: { slug: STORE_SLUG },
    data: { metadata: metadata as Prisma.InputJsonValue },
  });

  return NextResponse.json({ success: true });
}
