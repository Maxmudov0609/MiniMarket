// Validation shared by authentication endpoints. Keep this dependency-free for fast tests.
export function validRegistration({ name, email, password, role } = {}) {
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') return false;
  const cleanName = name.trim();
  const cleanEmail = email.trim();
  return cleanName.length >= 2 &&
    cleanName.length <= 100 &&
    !/[\u0000-\u001f\u007f]/.test(cleanName) &&
    cleanEmail.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) &&
    password.length >= 12 &&
    Buffer.byteLength(password, 'utf8') <= 72 &&
    !password.includes('\0') &&
    (role === 'buyer' || role === 'seller');
}

export function validGoogleCredential(credential) {
  return typeof credential === 'string' &&
    credential.length > 0 &&
    credential.length <= 8192 &&
    /^[A-Za-z0-9._-]+$/.test(credential);
}
