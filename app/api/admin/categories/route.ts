import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { deleteCategory, listCategories, saveCategory } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { translateContent } from '@/lib/translate';
import type { CmsCategory, ContentKind } from '@/lib/cms-types';

async function unauthorized() {
  return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json(listCategories());
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const input = (await request.json()) as { kind?: ContentKind; name?: string };
    if (!input.name?.trim() || (input.kind !== 'catalog' && input.kind !== 'project')) {
      return NextResponse.json({ error: 'Indique o tipo e o nome da categoria.' }, { status: 400 });
    }
    const name = input.name.trim();
    let en = '';
    let fr = '';
    try {
      const translated = await translateContent({ title: name, description: '', materials: '' });
      en = translated.en.title;
      fr = translated.fr.title;
    } catch {
      // A categoria continua utilizável em PT mesmo se o tradutor estiver indisponível.
    }
    const category: CmsCategory = {
      id: randomUUID(), kind: input.kind, slug: slugify(name),
      name: { pt: name, en, fr }, sortOrder: listCategories(input.kind).length,
    };
    saveCategory(category);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível criar a categoria.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID em falta.' }, { status: 400 });
  try {
    deleteCategory(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível eliminar.' }, { status: 409 });
  }
}
