// MIKHLAFI LABS — Enterprise Session Management & Secure Cookie Engine
// Implements server-managed, cryptographically hashed sessions with HttpOnly cookies

import crypto from 'node:crypto';
import { query } from '../db/connection.js';

export const SESSION_COOKIE_NAME = 'ml_session';
export const SESSION_DURATION_DAYS = 7;

export function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      cookies[name] = decodeURIComponent(val);
    }
  });

  return cookies;
}

export function serializeSessionCookie(token, options = {}) {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = options.maxAge ?? (SESSION_DURATION_DAYS * 24 * 60 * 60);

  let cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
  if (isProd || options.secure) {
    cookie += '; Secure';
  }
  return cookie;
}

export function clearSessionCookie() {
  const isProd = process.env.NODE_ENV === 'production';
  let cookie = `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  if (isProd) {
    cookie += '; Secure';
  }
  return cookie;
}

export async function createSession(userId, { ipAddress = null, userAgent = null } = {}) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const res = await query(
    `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, expires_at, created_at`,
    [userId, tokenHash, ipAddress, userAgent, expiresAt]
  );

  return {
    rawToken,
    session: res.rows[0]
  };
}

export async function verifySession(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') return null;

  const tokenHash = hashSessionToken(rawToken);

  const res = await query(
    `SELECT
       s.id AS session_id,
       s.user_id,
       s.expires_at,
       s.is_revoked,
       u.email,
       u.name_en,
       u.name_ar,
       u.phone,
       u.status AS user_status,
       u.is_verified,
       u.is_platform_admin,
       u.created_at AS user_created_at
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1
       AND s.is_revoked = false
       AND s.expires_at > now()
       AND u.status = 'active'`,
    [tokenHash]
  );

  if (res.rows.length === 0) {
    return null;
  }

  const row = res.rows[0];

  return {
    session: {
      id: row.session_id,
      userId: row.user_id,
      expiresAt: row.expires_at
    },
    user: {
      id: row.user_id,
      email: row.email,
      nameEn: row.name_en,
      nameAr: row.name_ar,
      phone: row.phone,
      status: row.user_status,
      isVerified: row.is_verified,
      isPlatformAdmin: !!row.is_platform_admin,
      createdAt: row.user_created_at
    }
  };
}

export async function revokeSession(rawToken) {
  if (!rawToken) return false;
  const tokenHash = hashSessionToken(rawToken);

  const res = await query(
    `UPDATE user_sessions
     SET is_revoked = true
     WHERE token_hash = $1`,
    [tokenHash]
  );

  return res.rowCount > 0;
}

export async function revokeAllUserSessions(userId) {
  const res = await query(
    `UPDATE user_sessions
     SET is_revoked = true
     WHERE user_id = $1`,
    [userId]
  );
  return res.rowCount;
}
