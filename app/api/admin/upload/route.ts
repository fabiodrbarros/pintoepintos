import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

const allowedTypes: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Imagem em falta.' }, { status: 400 });
  }
  if (!allowedTypes[file.type] || file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Use JPG, PNG ou WebP até 10 MB.' },
      { status: 400 },
    );
  }
  const uploadDirectory = process.env.UPLOAD_DIR || './data/uploads';
  await mkdir(uploadDirectory, { recursive: true });
  const extension = allowedTypes[file.type] || extname(file.name);
  const filename = `${randomUUID()}${extension}`;
  await writeFile(
    join(/* turbopackIgnore: true */ uploadDirectory, filename),
    Buffer.from(await file.arrayBuffer()),
  );
  return NextResponse.json({ url: `/api/media/${filename}` });
}
