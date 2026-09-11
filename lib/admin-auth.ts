import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const adminCookieName = 'pintos_admin';
const sessionDuration = 60 * 60 * 12;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET deve ter pelo menos 32 caracteres.');
  }
  return value;
}

function signature(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createAdminToken() {
  const payload = String(Math.floor(Date.now() / 1000) + sessionDuration);
  return `${payload}.${signature(payload)}`;
}

export function verifyAdminToken(token?: string) {
  if (!token) return false;
  const [expires, suppliedSignature] = token.split('.');
  if (!expires || !suppliedSignature || Number(expires) < Date.now() / 1000) {
    return false;
  }
  const expected = Buffer.from(signature(expires));
  const supplied = Buffer.from(suppliedSignature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export async function isAdmin() {
  const store = await cookies();
  return verifyAdminToken(store.get(adminCookieName)?.value);
}

export function passwordMatches(password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    throw new Error('ADMIN_PASSWORD não está configurada.');
  }
  const expected = Buffer.from(expectedPassword);
  const supplied = Buffer.from(password);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function usernameMatches(username: string) {
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expected = Buffer.from(expectedUsername);
  const supplied = Buffer.from(username);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
