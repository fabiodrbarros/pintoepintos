import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { categoryExists, deleteItem, listItems, saveItem } from '@/lib/db';
import type { CmsItem, ContentKind } from '@/lib/cms-types';
import { slugify } from '@/lib/slug';

export const dynamic = 'force-dynamic';

async function unauthorized() {
  return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const kind = request.nextUrl.searchParams.get('kind') as ContentKind | null;
  return NextResponse.json(listItems(kind || undefined, true));
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const item = (await request.json()) as CmsItem;
    if (!['catalog', 'project'].includes(item.kind) || !item.title?.pt) {
      return NextResponse.json(
        { error: 'Tipo e título em português são obrigatórios.' },
        { status: 400 },
      );
    }
    if (!categoryExists(item.kind, item.category)) {
      return NextResponse.json({ error: 'Selecione uma categoria válida.' }, { status: 400 });
    }
    if (item.published && !item.coverImage) {
      return NextResponse.json(
        { error: 'Adicione uma imagem principal antes de publicar.' },
        { status: 400 },
      );
    }
    if (item.kind === 'catalog' && !item.category) {
      return NextResponse.json(
        { error: 'A categoria é obrigatória nos elementos do catálogo.' },
        { status: 400 },
      );
    }
    const normalized: CmsItem = {
      ...item,
      id: item.id || randomUUID(),
      slug: slugify(item.title.pt),
      images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
      sortOrder: Number(item.sortOrder) || 0,
      published: Boolean(item.published),
    };
    saveItem(normalized);
    return NextResponse.json(normalized);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Não foi possível guardar.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID em falta.' }, { status: 400 });
  deleteItem(id);
  return NextResponse.json({ ok: true });
}
