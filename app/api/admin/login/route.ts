import { NextResponse } from 'next/server';
import {
  adminCookieName,
  createAdminToken,
  passwordMatches,
  usernameMatches,
} from '@/lib/admin-auth';

const attempts = new Map<string, { count: number; resetAt: number }>();
const windowMs = 15 * 60 * 1000;

function clientAddress(request: Request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(request: Request) {
  try {
    const address = clientAddress(request);
    const now = Date.now();
    const current = attempts.get(address);
    if (current && current.resetAt > now && current.count >= 8) {
      return NextResponse.json({ error: 'Demasiadas tentativas. Tente novamente dentro de alguns minutos.' }, { status: 429 });
    }
    const { username, password } = (await request.json()) as { username?: string; password?: string };
    if (!username || !password || !usernameMatches(username) || !passwordMatches(password)) {
      attempts.set(address, current && current.resetAt > now ? { ...current, count: current.count + 1 } : { count: 1, resetAt: now + windowMs });
      return NextResponse.json({ error: 'Utilizador ou palavra-passe incorretos.' }, { status: 401 });
    }
    attempts.delete(address);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminCookieName, createAdminToken(), {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Não foi possível iniciar sessão.' },
      { status: 500 },
    );
  }
}
