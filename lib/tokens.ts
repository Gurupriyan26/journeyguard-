/**
 * Generates a cryptographically secure random URL-safe token.
 * Example: 32 bytes hex or base64url string.
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments where crypto is under require('crypto')
    const nodeCrypto = require('crypto');
    const bytes = nodeCrypto.randomBytes(length);
    return bytes.toString('hex');
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes SHA-256 hash of a string token for secure storage/lookup.
 * Uses Web Crypto API when available, or Node crypto.
 */
export async function hashToken(token: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(token);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    const nodeCrypto = require('crypto');
    return nodeCrypto.createHash('sha256').update(token).digest('hex');
  }
}
