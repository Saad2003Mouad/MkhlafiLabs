// MIKHLAFI LABS — Enterprise Password Security & Cryptographic Hashing
// Uses Node.js crypto.scrypt with cryptographically secure random salt and timing-safe equality

import crypto from 'node:crypto';

const KEY_LEN = 64;

export async function hashPassword(password) {
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const salt = crypto.randomBytes(16).toString('hex');

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, salt, expectedHashHex] = parts;
  const expectedBuffer = Buffer.from(expectedHashHex, 'hex');

  return new Promise((resolve) => {
    crypto.scrypt(password, salt, KEY_LEN, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const isMatch = crypto.timingSafeEqual(derivedKey, expectedBuffer);
        resolve(isMatch);
      } catch {
        resolve(false);
      }
    });
  });
}
