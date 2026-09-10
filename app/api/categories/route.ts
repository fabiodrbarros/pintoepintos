import { NextRequest, NextResponse } from 'next/server';
import { listCategories } from '@/lib/db';
import type { ContentKind } from '@/lib/cms-types';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get('kind') as ContentKind | null;
  if (kind && kind !== 'catalog' && kind !== 'project') {
    return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 });
  }
  return NextResponse.json(listCategories(kind || undefined));
}
