import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import {
  processImageVariants,
  validateImageFile,
  GALLERY_VARIANTS,
  PRODUCT_VARIANTS,
  type ImageVariant,
} from '@/lib/image-utils';
import path from 'path';
import fs from 'fs/promises';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

const PURPOSE_VARIANTS: Record<string, ImageVariant[]> = {
  gallery: GALLERY_VARIANTS,
  product: PRODUCT_VARIANTS,
};

async function saveToBlob(
  processed: Array<{ suffix: string; processed: { buffer: Buffer; contentType: string } }>,
  purpose: string,
  baseName: string,
  timestamp: number,
): Promise<Record<string, string>> {
  const { put } = await import('@vercel/blob');
  const urls: Record<string, string> = {};
  for (const { suffix, processed: img } of processed) {
    const blobPath = `${purpose}/${STORE_SLUG}/${timestamp}-${baseName}${suffix}.webp`;
    const blob = await put(blobPath, img.buffer, {
      access: 'public',
      contentType: img.contentType,
    });
    urls[suffix] = blob.url;
  }
  return urls;
}

async function saveLocally(
  processed: Array<{ suffix: string; processed: { buffer: Buffer; contentType: string } }>,
  purpose: string,
  baseName: string,
  timestamp: number,
): Promise<Record<string, string>> {
  const dir = path.join(process.cwd(), 'public', 'uploads', purpose, STORE_SLUG);
  await fs.mkdir(dir, { recursive: true });
  const urls: Record<string, string> = {};
  for (const { suffix, processed: img } of processed) {
    const fileName = `${timestamp}-${baseName}${suffix}.webp`;
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, img.buffer);
    urls[suffix] = `/uploads/${purpose}/${STORE_SLUG}/${fileName}`;
  }
  return urls;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminToken(token, getAdminSecret()))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const purpose = (formData.get('purpose') as string) ?? 'gallery';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const variants = PURPOSE_VARIANTS[purpose] ?? GALLERY_VARIANTS;

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const processed = await processImageVariants(inputBuffer, variants);

    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();

    const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const urls = useBlob
      ? await saveToBlob(processed, purpose, baseName, timestamp)
      : await saveLocally(processed, purpose, baseName, timestamp);

    return NextResponse.json({
      urls,
      url: urls[variants[0].suffix],
      thumbnailUrl: urls[variants.at(-1)!.suffix],
      storage: useBlob ? 'blob' : 'local',
    });
  } catch (error) {
    console.error('[admin upload]', error);
    return NextResponse.json({ error: 'Upload processing failed' }, { status: 500 });
  }
}
