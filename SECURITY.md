# Security review — OWASP Top 10 (2021)

Study Desk is a static front end (HTML, CSS, JavaScript) served by a small Node server (`server.js`, no dependencies). The server handles **accounts, sessions, the forum and Java runs**. Study progress and notes stay in each browser's `localStorage`.

Automated checks: `tests/app.test.js` (the `auth:`, `server API:` and `security:` tests, plus the community XSS test) and `tests/server.test.js` (security regressions and the code runner).

| # | Category | Status | Notes |
|---|----------|--------|-------|
| A01 | Broken Access Control | Addressed for accounts | Roles come from the server session, not the browser. Only an admin session can use admin features; the admin password cannot be changed through the website. The static file server serves only an allowlist (pages, `css/`, `js/`, `fonts/`), so `server.js`, `.env`, `data/` and tests are never served; path traversal is refused. Forum moderation (hide, restore, delete, see anonymous authors) is checked on the server for every request. |
| A02 | Cryptographic Failures | Addressed | Member passwords are hashed with scrypt (random 16-byte salt) and compared in constant time. The admin password is read from server settings and only held in memory as a hash; it is never written to disk or Git. Session tokens are 256-bit random values. |
| A03 | Injection | Addressed | The server builds no database queries and runs no shell commands from user input: the Java runner passes file names (validated as `Name.java`) and fixed arguments to `spawn` without a shell. Learner SQL runs only in the learner's own browser, in an in-memory SQLite database. All user content is escaped with `esc()` before it is inserted into HTML. The server accepts only JSON bodies (10 KB, or 64 KB for code runs) and validates every field. Regression tests post `<img onerror>` / `<script>` payloads and check they stay inert. |
| A04 | Insecure Design | Addressed | JavaScript and SQL run in time-limited Web Workers with no page access. Java runs on the server only for logged-in members, one run at a time per account, inside a namespace sandbox: no network; the host file system is read-only; the project, data, home folder and `/tmp` are hidden; the run works in a private 32 MB tmpfs; CPU, memory, file-size, process/thread and time limits apply; all child processes are killed. When the server runs as root, runs drop to the `nobody` user. If any step fails, the run is refused; see the README. Login failures are rate limited per address and per account, registrations per address, Java runs per account, and forum reports from accounts younger than 10 minutes cannot hide posts. |
| A05 | Security Misconfiguration | Addressed | The server sends `Content-Security-Policy` (including `frame-ancestors 'none'`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` and `Cross-Origin-Opener-Policy`. API responses are `Cache-Control: no-store`. The admin account is disabled unless both settings are present and the password is at least 12 characters. |
| A06 | Vulnerable and Outdated Components | Addressed | No third-party code on the server. The browser uses vendored, pinned CodeMirror 5.65.21 and sql.js 1.17.0 (both MIT), served from this site. Playwright is a test-only dependency. Update the vendored copies when security fixes are released. |
| A07 | Identification and Authentication Failures | Addressed | Generic "incorrect username or password" message, with a dummy hash check for unknown users to reduce timing differences. Sessions use `HttpOnly`, `SameSite=Strict` cookies (add `Secure` with `COOKIE_SECURE=1` on HTTPS) and expire after 7 days of inactivity. Changing a password signs out the user's other sessions. No MFA yet. |
| A08 | Software and Data Integrity Failures | Addressed | No auto-updates or untrusted deserialisation into code. Account data is written atomically. |
| A09 | Security Logging and Monitoring Failures | Partial | The server logs start-up state and unexpected errors, but not individual login attempts. Add request logging if the site is made public. |
| A10 | Server-Side Request Forgery | N/A | The server makes no outbound requests. |

## Fixes from the latest review

- User accounts are kept in a prototype-free map, so names like `__proto__` or `constructor` cannot break lookups.
- Malformed cookies no longer crash a request.
- Per-account login limit (stops spraying one account from many addresses) and a per-address registration limit.
- Old sessions, rate-limit entries and expired data are swept regularly; each account keeps at most 20 sessions.
- Header and request time limits protect against slow-request attacks; forum posts and replies have size and count caps.
- `Strict-Transport-Security` is sent when `COOKIE_SECURE=1`, plus a `Permissions-Policy` that turns off camera, microphone and location.
- Only the practice page's CSP allows `'unsafe-eval'`, WebAssembly and `blob:` workers (needed to run learner JavaScript and the SQLite engine). Every other page uses `script-src 'self'; worker-src 'none'`.

## Full security check (November 2026)

Findings and fixes:

| Severity | Finding | Fix |
|---|---|---|
| High | The Java sandbox hid the project and data folders but left the rest of the host writable: learner code could write to `/etc`, `/usr` and `/tmp`, and list other learners' runs in `/tmp`. | The host file system is now remounted read-only inside the sandbox; `/tmp`, `/var/tmp` and `/dev/shm` are hidden; code runs in a private 32 MB tmpfs and never touches the host disk. The start-up check tests every step, and runs are refused if any step fails. Regression tests try all of these writes. |
| Medium | No process or memory limit on Java runs (a thread/fork bomb could exhaust the machine for up to 15 seconds). The kernel does not enforce process limits for root. | `--nproc=256` and a 2.5 GB address-space limit, JVM memory flags, one run at a time per account, and runs drop to the `nobody` user when the server runs as root. Tested with a thread bomb. |
| Medium | Learner JavaScript runs in a same-origin Worker, so pasted code could call the site's API (for example post to the forum) with the learner's login. | Before learner code runs, the Worker removes `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `importScripts`, `indexedDB`, `caches`, nested workers and similar APIs, including on the prototype chain. Tested in the browser. |
| Medium | Behind a proxy, the first `X-Forwarded-For` entry was trusted. Clients can fake it, which bypassed login and registration limits. | The last entry (added by the trusted proxy) is used. Tested. |
| Low | The change-password form allowed unlimited guesses of the current password with a stolen session. | Wrong current passwords count as failed logins and are rate limited. Tested. |
| Low | `'unsafe-eval'` and blob workers were allowed on every page. | Limited to the practice page (header and meta CSP). Tested. |

Also checked with no issues found: output escaping and URL parameters (all validated against known IDs), the HTML preview frame (scripts disabled), static file allowlist and path traversal, cookie flags, cross-site POST checks, forum permissions, session handling, `npm audit` (0 vulnerabilities; Playwright is test-only), vendored libraries, and Git history (no `.env` or data files were ever committed; an early commit contained the old built-in default admin password, which no longer works because the admin password now comes only from server settings and must be 12+ characters).

## Before putting the site on the internet

- Serve it over HTTPS (behind a reverse proxy or hosting platform) and set `COOKIE_SECURE=1`; set `TRUST_PROXY=1` if the proxy sets `X-Forwarded-For`.
- Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the host's secret settings, not in a file in the repository.
- Sessions are kept in memory, so a restart signs everyone out, and a single server process is assumed.
- Progress and notes are still per browser. Moving them to the server would be the next step if they need to be shared or backed up.
- Run the server as an ordinary user, not root (process limits then apply to the whole account as well).
- Keep `CODE_RUNNER=auto` (or `off`). The sandbox needs Linux user namespaces; on hosts without them, Java is limited to the admin. Running untrusted code is the highest-risk feature, so consider a separate machine or container for it on a busy public site.
