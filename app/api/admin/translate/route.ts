import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { translateContent } from '@/lib/translate';

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  try {
    const source = (await request.json()) as {
      title?: string;
      description?: string;
      materials?: string;
    };
    if (!source.title) {
      return NextResponse.json({ error: 'O título em português é obrigatório.' }, { status: 400 });
    }
    const translations = await translateContent({
      title: source.title,
      description: source.description || '',
      materials: source.materials || '',
    });
    return NextResponse.json(translations);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'A tradução falhou.' },
      { status: 500 },
    );
  }
}
