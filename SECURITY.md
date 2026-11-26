# Security review — OWASP Top 10 (2021)

Study Desk is a static front end (HTML, CSS, JavaScript) served by a small Node server (`server.js`, no dependencies). The server handles **accounts and sessions**. Study progress, notes and discussions stay in each browser's `localStorage`.

Automated checks: `tests/app.test.js` (the `auth:`, `server API:` and `security:` tests, plus the community XSS test).

| # | Category | Status | Notes |
|---|----------|--------|-------|
| A01 | Broken Access Control | Addressed for accounts | Roles come from the server session, not the browser. Only an admin session can use admin features; the admin password cannot be changed through the website. The static file server serves only an allowlist (pages, `css/`, `js/`), so `server.js`, `.env`, `data/` and tests are never served; path traversal is refused. Discussions are still stored per browser, so the admin "delete any post" feature only affects that browser. |
| A02 | Cryptographic Failures | Addressed | Member passwords are hashed with scrypt (random 16-byte salt) and compared in constant time. The admin password is read from server settings and only held in memory as a hash; it is never written to disk or Git. Session tokens are 256-bit random values. |
| A03 | Injection | Addressed | No database queries or shell commands. All user content is escaped with `esc()` before it is inserted into HTML. The server accepts only JSON bodies up to 10 KB and validates every field. Regression tests post `<img onerror>` / `<script>` payloads and check they stay inert. |
| A04 | Insecure Design | Addressed | Learner code runs in a time-limited Web Worker with no page access. Login failures are rate limited (10 per 15 minutes per address). |
| A05 | Security Misconfiguration | Addressed | The server sends `Content-Security-Policy` (including `frame-ancestors 'none'`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` and `Cross-Origin-Opener-Policy`. API responses are `Cache-Control: no-store`. The admin account is disabled unless both settings are present and the password is at least 12 characters. |
| A06 | Vulnerable and Outdated Components | Addressed | No third-party runtime code on the server or in the browser. Playwright is a test-only dependency. |
| A07 | Identification and Authentication Failures | Addressed | Generic "incorrect username or password" message, with a dummy hash check for unknown users to reduce timing differences. Sessions use `HttpOnly`, `SameSite=Strict` cookies (add `Secure` with `COOKIE_SECURE=1` on HTTPS) and expire after 7 days of inactivity. Changing a password signs out the user's other sessions. No MFA yet. |
| A08 | Software and Data Integrity Failures | Addressed | No auto-updates or untrusted deserialisation into code. Account data is written atomically. |
| A09 | Security Logging and Monitoring Failures | Partial | The server logs start-up state and unexpected errors, but not individual login attempts. Add request logging if the site is made public. |
| A10 | Server-Side Request Forgery | N/A | The server makes no outbound requests. |

## Before putting the site on the internet

- Serve it over HTTPS (behind a reverse proxy or hosting platform) and set `COOKIE_SECURE=1`; set `TRUST_PROXY=1` if the proxy sets `X-Forwarded-For`.
- Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the host's secret settings, not in a file in the repository.
- Sessions are kept in memory, so a restart signs everyone out, and a single server process is assumed.
- Progress, notes and discussions are still per browser. Moving them to the server would be the next step if they need to be shared or backed up.
