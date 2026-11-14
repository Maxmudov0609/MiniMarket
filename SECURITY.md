# MiniMarket security rollout (2026-11-14)

This branch is a *first hardening stage*, not a penetration-test certificate. Do not merge until CI and a production-like staging deployment pass.

## Changes proposed
- Validate registration names, emails and new passwords (12–72 UTF-8 bytes for bcrypt); do not change existing users' password hashes.
- Use asynchronous bcrypt hashing/comparison, with cost 12 for newly created accounts.
- Bound Google ID-token input length and format before verification.
- Require a 32-byte minimum JWT signing secret and verify JWT issuer, audience and algorithm. New sessions last 2 hours.
- Add response security headers and per-IP write rate limiting; existing login/signup and photo upload limiters remain.
- Enforce PostgreSQL TLS server-certificate validation (no `rejectUnauthorized: false`).
- Align the active React signup form with the new password minimum.
- Issue new JWT sessions in HttpOnly/SameSite=Strict browser cookies and require session-bound CSRF headers for authenticated writes.
- Keep a bearer-token fallback for API compatibility; active React UI no longer persists JWTs or user data in localStorage.
- Provide a same-origin session bootstrap and logout endpoint, and restrict browser mutation requests by Origin and Fetch Metadata.

## Deploy prerequisites and compatibility
1. BACK UP Supabase PostgreSQL and check recovery can restore the data.
2. Verify that Vercel's reverse proxy forwards `Set-Cookie` and `X-CSRF-Token` from Render, preserves client `Cookie` on subsequent same-origin calls, and honors `__Host-mm_session; Secure; HttpOnly; SameSite=Strict; Path=/`. Browser login and checkout MUST be tested on the real staging domain (not only mocked API tests).
3. On Render set `JWT_SECRET` to a randomly generated **at least 32-byte** secret. Do not paste it into code, chat, logs or GitHub. Existing users will need to sign in again if the secret changes. Confirm `GOOGLE_CLIENT_ID` and `DATABASE_URL` are set. Test database connection with certificate validation in staging; if Supabase requires a custom CA, install the trusted CA instead of disabling checks.
4. On a staging backend, run `node --test server/tests/*.test.js` and `node --check server/index.js`; then test signup, old-user password login, Google login/linking, seller updates, checkout, order history, image upload, mobile login, rate limits and 401/403 behavior.
5. Verify that the Vercel frontend and Render backend remain on HTTPS and the existing authorized CORS origins.
6. After successful staging, deploy gradually, monitor error-rate and failed logins; prepare a rollback to the prior commit.
7. Rotate any credentials that appeared in screenshots or logs. Enable MFA on GitHub, Vercel, Render, Supabase, and the Google account.

## Still required before claiming a mature security posture
- Finish removing legacy bearer-token compatibility after all clients migrate, and add integration tests for session-cookie/CSRF enforcement.
- Introduce session revocation, refresh rotation, password reset / email verification, and MFA or step-up verification for admins.
- Use a shared rate-limit store when running multiple backend instances.
- Review remote product images for content policy and supply a tested CSP before enabling a restrictive policy.
- Set up dependency vulnerability scanning, secret scanning, audit logs, backups/restore drills and incident response.
- Validate admin-only endpoints and seller ownership with integration tests; commission an authorized penetration test.

Never expose secrets or credentials to run these checks.
