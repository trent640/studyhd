# Security review — OWASP Top 10 (2021)

Study Desk is a **static, client-side app**: HTML, CSS and JavaScript served as files, with all data in the browser's `localStorage`. There is no server, database or API of its own. That shapes the review below: some server-side risks do not apply, and "accounts" are a local convenience, not real authentication.

Reviewed commit: the current `claude/hopeful-lovelace-6m70ps` branch. Automated checks live in `tests/app.test.js` (`security:` test and the community XSS test).

| # | Category | Status | Notes |
|---|----------|--------|-------|
| A01 | Broken Access Control | N/A (no server) | Admin vs member is cosmetic and enforced only in the browser. Anyone can edit their own `localStorage`. No server means no cross-user data to protect. Documented as a limitation, not a vulnerability. |
| A02 | Cryptographic Failures | Addressed | Passwords are hashed with PBKDF2-HMAC-SHA-256, 100,000 iterations, a 16-byte random salt (Web Crypto). Hashes are never shown; the account object exposed to the UI omits the hash and salt. Still local-only, so this protects the stored value, not a login. |
| A03 | Injection | Addressed | No SQL/OS/server. The real risk is DOM XSS. All user-supplied content (note titles/bodies, discussion posts, usernames, saved answers, repo URLs, search text) is escaped with `esc()` before being inserted into HTML, and placed only in text nodes, double-quoted attributes or `<textarea>` bodies — never in an `href`, inline handler or `<script>`. Usernames are also restricted to `[A-Za-z0-9_.-]{3,32}`. Regression tests post `<img onerror>` / `<script>` payloads and assert they render as text and do not execute. |
| A04 | Insecure Design | Addressed | The code-challenge runner executes user JavaScript in a **Web Worker** (no DOM, no page access) with a 3-second timeout, so a malicious or infinite-loop snippet cannot touch the page or hang the tab. |
| A05 | Security Misconfiguration | Addressed | Every page sends a Content-Security-Policy: `default-src 'self'`, `script-src 'self' blob: 'unsafe-eval'`, `worker-src blob:`, `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`, `font-src https://fonts.gstatic.com`, `img-src 'self' data:`, `connect-src 'self'`, `form-action 'self'`, `base-uri 'none'`, `object-src 'none'`. This blocks injected inline scripts, event-handler attributes, external script origins and plugins. `'unsafe-eval'` is required because the sandboxed Worker must run the learner's code; it does not let an attacker introduce new script, and all other XSS vectors remain blocked. |
| A06 | Vulnerable and Outdated Components | Addressed | The app ships **no third-party runtime JavaScript**. The only external resources are Google Fonts (CSS + font files), pinned by origin in the CSP. The sole dependency, Playwright, is dev/test only and never served. |
| A07 | Identification and Authentication Failures | Addressed within the local model | Minimum 8-character passwords; accounts flagged with a temporary password are forced to set a new one on first login (cannot be dismissed); login messages do not reveal whether a username exists beyond what a local store allows. Rate limiting and MFA are not possible without a server and are out of scope for a local demo. |
| A08 | Software and Data Integrity Failures | Addressed | No auto-update, no deserialisation of untrusted data into code, no third-party scripts. `localStorage` reads are wrapped in `try/catch` and treated as untrusted (parsed as data, escaped on render). |
| A09 | Security Logging and Monitoring Failures | N/A (no server) | There is nothing server-side to log. |
| A10 | Server-Side Request Forgery | N/A (no server) | The app makes no outbound requests; the `fetch()` calls in lessons are example code shown as text, never executed. |

## Residual notes and real-deployment hardening

- **This is not a real authentication system.** Accounts, roles and progress live in one browser. Do not store anything sensitive; a real login needs a server.
- **Clickjacking:** `frame-ancestors` is ignored in a `<meta>` CSP. If hosted, send `Content-Security-Policy: frame-ancestors 'none'` (or `X-Frame-Options: DENY`) and `Referrer-Policy: no-referrer` as HTTP response headers.
- **Transport:** serve over HTTPS (also required for Web Crypto password hashing outside `localhost`).
- **Subresource Integrity:** the Google Fonts stylesheet is loaded by origin via CSP; pinning exact font files with SRI would harden it further.
