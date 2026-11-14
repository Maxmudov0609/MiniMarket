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

## Deploy prerequisites and compatibility
1. BACK UP Supabase PostgreSQL and check recovery can restore the data.
2. On Render set `JWT_SECRET` to a randomly generated **at least 32-byte** secret. Do not paste it into code, chat, logs or GitHub. Existing users will need to sign in again if the secret changes. Confirm `GOOGLE_CLIENT_ID` and `DATABASE_URL` are set. Test database connection with certificate validation in staging; if Supabase requires a custom CA, install the trusted CA instead of disabling checks.
3. On a staging backend, run `node --test server/tests/*.test.js` and `node --check server/index.js`; then test signup, old-user password login, Google login/linking, seller updates, checkout, order history, image upload, mobile login, rate limits and 401/403 behavior.
4. Verify that the Vercel frontend and Render backend remain on HTTPS and the existing authorized CORS origins.
5. After successful staging, deploy gradually, monitor error-rate and failed logins; prepare a rollback to the prior commit.
6. Rotate any credentials that appeared in screenshots or logs. Enable MFA on GitHub, Vercel, Render, Supabase, and the Google account.

## Still required before claiming a mature security posture
- Replace browser `localStorage` JWT persistence with an HttpOnly Secure SameSite session strategy and CSRF controls where applicable.
- Introduce session revocation, refresh rotation, password reset / email verification, and MFA or step-up verification for admins.
- Use a shared rate-limit store when running multiple backend instances.
- Review remote product images for content policy and supply a tested CSP before enabling a restrictive policy.
- Set up dependency vulnerability scanning, secret scanning, audit logs, backups/restore drills and incident response.
- Validate admin-only endpoints and seller ownership with integration tests; commission an authorized penetration test.

Never expose secrets or credentials to run these checks.
