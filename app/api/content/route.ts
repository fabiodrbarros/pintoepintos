import { NextRequest, NextResponse } from 'next/server';
import { getItem, listItems } from '@/lib/db';
import type { ContentKind } from '@/lib/cms-types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get('kind') as ContentKind | null;
  const slug = request.nextUrl.searchParams.get('slug');
  if (kind && !['catalog', 'project'].includes(kind)) {
    return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 });
  }
  if (kind && slug) {
    const item = getItem(kind, slug);
    return item
      ? NextResponse.json(item)
      : NextResponse.json({ error: 'Conteúdo não encontrado.' }, { status: 404 });
  }
  return NextResponse.json(listItems(kind || undefined));
}
