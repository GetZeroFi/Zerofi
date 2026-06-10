// ── Zerofi Client-Side Encryption ─────────────────────────────────────────────
// AES-GCM encryption using the Web Crypto API (built into all modern browsers).
// Financial data is encrypted BEFORE it leaves the device.
// Even Supabase cannot read the encrypted values — only the user's key can decrypt.
//
// Key derivation: user's password → PBKDF2 → AES-256-GCM key
// This means:
//   - Data at rest in Supabase is encrypted ciphertext
//   - Data in transit is encrypted (HTTPS) AND encrypted (AES)
//   - Even a database breach exposes only ciphertext

const SALT_KEY   = 'zerofi_enc_salt_v1';
const IV_LENGTH  = 12;    // 96-bit IV for AES-GCM
const ITERATIONS = 100000; // PBKDF2 iterations

// Get or create a persistent salt for this device/user
function getSalt() {
  let salt = localStorage.getItem(SALT_KEY);
  if (!salt) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    salt = btoa(String.fromCharCode(...bytes));
    localStorage.setItem(SALT_KEY, salt);
  }
  return Uint8Array.from(atob(salt), c => c.charCodeAt(0));
}

// Derive an AES key from a password using PBKDF2
async function deriveKey(password) {
  const enc     = new TextEncoder();
  const keyMat  = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: getSalt(), iterations: ITERATIONS, hash: 'SHA-256' },
    keyMat,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a JavaScript value (serialized to JSON)
export async function encrypt(value, password) {
  try {
    const key  = await deriveKey(password);
    const iv   = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const enc  = new TextEncoder();
    const data = enc.encode(JSON.stringify(value));
    const ct   = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    // Combine IV + ciphertext, base64-encode
    const combined = new Uint8Array(IV_LENGTH + ct.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ct), IV_LENGTH);
    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error('Zerofi encrypt error:', e);
    return null;
  }
}

// Decrypt a previously encrypted value
export async function decrypt(ciphertext, password) {
  try {
    const key     = await deriveKey(password);
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv      = combined.slice(0, IV_LENGTH);
    const ct      = combined.slice(IV_LENGTH);
    const pt      = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(pt));
  } catch (e) {
    console.error('Zerofi decrypt error:', e);
    return null;
  }
}

// Quick test to verify a password can decrypt stored data
export async function verifyEncryptionKey(password) {
  const testKey = 'zerofi_enc_test_v1';
  const stored  = localStorage.getItem(testKey);
  if (!stored) {
    // First time — store an encrypted sentinel
    const ct = await encrypt({ ok: true, ts: Date.now() }, password);
    if (ct) localStorage.setItem(testKey, ct);
    return true;
  }
  const result = await decrypt(stored, password);
  return result?.ok === true;
}
