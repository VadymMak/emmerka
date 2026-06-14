import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateEmbedding, semanticSearch } from '@/lib/embeddings';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

// POST /api/products/search — hybrid semantic + filter search
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query: string;
      categoryId?: string;
      inStock?: boolean;
      maxPrice?: number;
      limit?: number;
    };

    if (!body.query?.trim()) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });
    const embedding = await generateEmbedding(body.query);
    const results = await semanticSearch(
      'products',
      embedding,
      store.id,
      body.limit ?? 5,
      {
        categoryId: body.categoryId,
        inStock: body.inStock,
        maxPrice: body.maxPrice,
      },
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[POST /api/products/search]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
