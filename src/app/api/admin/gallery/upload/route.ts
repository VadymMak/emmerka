import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

// DEPRECATED: use /api/admin/upload with purpose=gallery instead
// This endpoint proxies to the new universal upload for backward compat.

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminToken(token, getAdminSecret()))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  formData.set('purpose', 'gallery');

  const baseUrl = new URL(request.url).origin;
  const res = await fetch(`${baseUrl}/api/admin/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      cookie: `${ADMIN_COOKIE}=${token ?? ''}`,
    },
  });

  const data = await res.json() as Record<string, unknown>;
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
