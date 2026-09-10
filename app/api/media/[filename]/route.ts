import { readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { NextResponse } from 'next/server';

const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  if (basename(filename) !== filename) {
    return NextResponse.json({ error: 'Ficheiro inválido.' }, { status: 400 });
  }
  try {
    const uploadDirectory = process.env.UPLOAD_DIR || './data/uploads';
    const data = await readFile(join(uploadDirectory, filename));
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentTypes[extname(filename).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Imagem não encontrada.' }, { status: 404 });
  }
}
