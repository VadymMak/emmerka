import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { DEFAULT_THEME, type ThemeConfig } from '@/lib/theme';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

export async function GET() {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { themeConfig: true },
  });

  const dbTheme = store?.themeConfig as Partial<ThemeConfig> | null;
  const theme: ThemeConfig = {
    colors: { ...DEFAULT_THEME.colors, ...(dbTheme?.colors ?? {}) },
    layout: { ...DEFAULT_THEME.layout, ...(dbTheme?.layout ?? {}) },
  };

  return Response.json(theme);
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as Partial<ThemeConfig>;

  const store = await db.store.findUniqueOrThrow({
    where: { slug: STORE_SLUG },
    select: { id: true, themeConfig: true },
  });

  const currentTheme = store.themeConfig as Partial<ThemeConfig> | null;

  const updatedTheme: ThemeConfig = {
    colors: {
      ...DEFAULT_THEME.colors,
      ...(currentTheme?.colors ?? {}),
      ...(body.colors ?? {}),
    },
    layout: {
      ...DEFAULT_THEME.layout,
      ...(currentTheme?.layout ?? {}),
      ...(body.layout ?? {}),
    },
  };

  await db.store.update({
    where: { id: store.id },
    data: { themeConfig: updatedTheme as object },
  });

  revalidatePath('/', 'layout');
  return Response.json({ success: true, theme: updatedTheme });
}
