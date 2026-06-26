import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

export async function GET() {
  try {
    const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
    if (!store) return NextResponse.json({ images: [] });

    const images = await db.galleryImage.findMany({
      where: { storeId: store.id, active: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, url: true, alt: true },
    });

    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
