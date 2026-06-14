import { db } from './db';

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: OPENAI_EMBEDDING_MODEL, input: text }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI embeddings error: ${response.status}`);
  }

  const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
  return data.data[0].embedding;
}

type SemanticTable = 'products' | 'knowledge_entries' | 'customers';

interface SemanticFilters {
  categoryId?: string;
  inStock?: boolean;
  maxPrice?: number;
}

export async function semanticSearch(
  table: SemanticTable,
  queryEmbedding: number[],
  storeId: string,
  limit = 5,
  filters?: SemanticFilters,
) {
  const vectorStr = `[${queryEmbedding.join(',')}]`;

  const categoryFilter = filters?.categoryId ? `AND "categoryId" = '${filters.categoryId}'` : '';
  const stockFilter =
    filters?.inStock !== undefined ? `AND "inStock" = ${filters.inStock}` : '';
  const priceFilter = filters?.maxPrice ? `AND price <= ${filters.maxPrice}` : '';

  const results = await db.$queryRawUnsafe<Record<string, unknown>[]>(`
    SELECT id, slug, "nameKey", brand, image, price, "oldPrice", currency,
           "inStock", "isHit", "isNew", rating, "reviewCount", metadata,
           embedding <=> '${vectorStr}'::vector AS distance
    FROM "Product"
    WHERE "storeId" = '${storeId}'
    ${categoryFilter}
    ${stockFilter}
    ${priceFilter}
    ORDER BY distance ASC
    LIMIT ${limit}
  `);

  return results;
}

export async function ragSearch(storeId: string, queryEmbedding: number[], limit = 3) {
  const vectorStr = `[${queryEmbedding.join(',')}]`;

  const results = await db.$queryRawUnsafe<Record<string, unknown>[]>(`
    SELECT id, title, content, category,
           embedding <=> '${vectorStr}'::vector AS distance
    FROM "KnowledgeEntry"
    WHERE "storeId" = '${storeId}'
    ORDER BY distance ASC
    LIMIT ${limit}
  `);

  return results;
}
