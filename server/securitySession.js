import { createHmac, timingSafeEqual } from 'node:crypto';

// Vercel's /api rewrite keeps authentication on the browser's own origin.
// The __Host- prefix prevents cookies from being scoped to parent domains.
export const SESSION_COOKIE = process.env.NODE_ENV === 'production'
  ? '__Host-mm_session' : 'mm_session';
export const SESSION_AGE_MS = 2 * 60 * 60 * 1000;

export function cookieToken(req) {
  const cookieHeader = req.headers?.cookie;
  if (typeof cookieHeader !== 'string' || cookieHeader.length > 16384) return '';
  const raw = cookieHeader.split(';').map(x => x.trim())
    .find(x => x.startsWith(SESSION_COOKIE + '='));
  if (!raw) return '';
  const value = raw.slice(SESSION_COOKIE.length + 1);
  return value.length > 0 && value.length <= 8192 &&
    /^[A-Za-z0-9._-]+$/.test(value) ? value : '';
}

export function csrfFor(token, secret) {
  return createHmac('sha256', secret)
    .update('minimarket-csrf-v1:' + token).digest('base64url');
}

export function verifyCsrf(supplied, token, secret) {
  if (typeof supplied !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(supplied)) return false;
  const actual = csrfFor(token, secret);
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(actual));
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
};

export function issueSession(res, token, secret) {
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_AGE_MS });
  res.set({
    'X-CSRF-Token': csrfFor(token, secret),
    'Cache-Control': 'private, no-store'
  });
}

export function endSession(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
  res.set('Cache-Control', 'private, no-store');
}
