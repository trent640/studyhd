/* Study Desk server: serves the static site and provides server-side accounts.
   No third-party dependencies (Node 18+).

   Settings (environment variables, or a git-ignored .env file next to this one):
     ADMIN_USERNAME   admin login name (required to enable the admin account)
     ADMIN_PASSWORD   admin password, at least 12 characters (never stored in code or Git)
     PORT             default 8000
     HOST             default 127.0.0.1 (set 0.0.0.0 to listen on all interfaces)
     DATA_DIR         where member accounts are stored, default ./data
     COOKIE_SECURE    "1" to mark session cookies Secure (set when served over HTTPS)
     TRUST_PROXY      "1" when behind a reverse proxy that sets X-Forwarded-For/-Proto
*/
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const ROOT = __dirname;
const SESSION_COOKIE = 'sd_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_BODY = 10 * 1024;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;
const MIN_PASSWORD = 8;
const MIN_ADMIN_PASSWORD = 12;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILS = 10;

const CSP = [
  "default-src 'self'", "script-src 'self' blob: 'unsafe-eval'", 'worker-src blob:',
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", 'font-src https://fonts.gstatic.com',
  "img-src 'self' data:", "connect-src 'self'", "form-action 'self'", "base-uri 'none'",
  "object-src 'none'", "frame-ancestors 'none'",
].join('; ');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

/* ---------- .env loading (simple KEY=VALUE lines; real environment wins) ---------- */
function loadEnvFile(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { return; }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    let value = m[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

/* ---------- Password hashing (scrypt, random salt, constant-time compare) ---------- */
async function hashPassword(password, salt = crypto.randomBytes(16)) {
  const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return 'scrypt$' + salt.toString('hex') + '$' + key.toString('hex');
}
async function verifyPassword(password, stored) {
  const [scheme, saltHex, keyHex] = String(stored).split('$');
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(actual, expected);
}

/* ---------- Member store: JSON file, written atomically ---------- */
function createUserStore(dataDir) {
  const file = path.join(dataDir, 'users.json');
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  let users = {};
  try { users = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { users = {}; }
  const save = () => {
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(users, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, file);
  };
  return {
    get: (name) => users[name.toLowerCase()] || null,
    add(user) { users[user.username.toLowerCase()] = user; save(); },
    update(name, patch) { Object.assign(users[name.toLowerCase()], patch); save(); },
  };
}

/* ---------- App ---------- */
async function createApp(options = {}) {
  const adminUsername = (options.adminUsername ?? process.env.ADMIN_USERNAME ?? '').trim();
  const adminPassword = options.adminPassword ?? process.env.ADMIN_PASSWORD ?? '';
  const cookieSecure = options.cookieSecure ?? process.env.COOKIE_SECURE === '1';
  const trustProxy = options.trustProxy ?? process.env.TRUST_PROXY === '1';
  const store = createUserStore(options.dataDir || process.env.DATA_DIR || path.join(ROOT, 'data'));
  const log = options.log || ((msg) => console.log(msg));

  // The admin password is hashed in memory at start-up and never written anywhere.
  let adminHash = null;
  if (adminUsername && adminPassword.length >= MIN_ADMIN_PASSWORD && USERNAME_RE.test(adminUsername)) {
    adminHash = await hashPassword(adminPassword);
  } else if (adminUsername || adminPassword) {
    log(`Admin account DISABLED: ADMIN_USERNAME must match ${USERNAME_RE} and ADMIN_PASSWORD must be at least ${MIN_ADMIN_PASSWORD} characters.`);
  } else {
    log('Admin account disabled: set ADMIN_USERNAME and ADMIN_PASSWORD to enable it.');
  }
  const isAdminName = (name) => !!adminUsername && name.toLowerCase() === adminUsername.toLowerCase();
  const dummyHash = await hashPassword(crypto.randomBytes(16).toString('hex'));

  const sessions = new Map(); // token -> { username, role, expires }
  const failures = new Map(); // ip -> [timestamps]

  function clientIp(req) {
    if (trustProxy && req.headers['x-forwarded-for']) return String(req.headers['x-forwarded-for']).split(',')[0].trim();
    return req.socket.remoteAddress || 'unknown';
  }
  function tooManyFailures(ip) {
    const now = Date.now();
    const list = (failures.get(ip) || []).filter((t) => now - t < LOGIN_WINDOW_MS);
    failures.set(ip, list);
    return list.length >= LOGIN_MAX_FAILS;
  }
  function recordFailure(ip) { (failures.get(ip) || failures.set(ip, []).get(ip)).push(Date.now()); }

  function parseCookies(req) {
    const out = {};
    for (const part of String(req.headers.cookie || '').split(';')) {
      const i = part.indexOf('=');
      if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    }
    return out;
  }
  function getSession(req) {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (!token) return null;
    const s = sessions.get(token);
    if (!s || s.expires < Date.now()) { sessions.delete(token); return null; }
    s.expires = Date.now() + SESSION_TTL_MS; // sliding expiry
    return { token, ...s };
  }
  function sessionCookie(token, maxAgeSec) {
    return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSec}` + (cookieSecure ? '; Secure' : '');
  }
  function startSession(res, username, role) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { username, role, expires: Date.now() + SESSION_TTL_MS });
    res.setHeader('Set-Cookie', sessionCookie(token, SESSION_TTL_MS / 1000));
  }
  function endSessionsFor(username, exceptToken) {
    for (const [t, s] of sessions) if (s.username === username && t !== exceptToken) sessions.delete(t);
  }

  function securityHeaders(res) {
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  }
  function sendJson(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
  }
  function readJson(req) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on('data', (c) => {
        size += c.length;
        if (size > MAX_BODY) { reject(Object.assign(new Error('Request too large.'), { status: 413 })); req.destroy(); return; }
        chunks.push(c);
      });
      req.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
        catch (e) { reject(Object.assign(new Error('Invalid JSON.'), { status: 400 })); }
      });
      req.on('error', reject);
    });
  }
  // Cross-site request protection on top of SameSite=Strict cookies.
  function sameOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return true; // same-origin fetches from older browsers may omit it; cookies are SameSite=Strict
    try { return new URL(origin).host === req.headers.host; } catch (e) { return false; }
  }
  const publicUser = (s) => ({ username: s.username, role: s.role });

  /* ---------- API ---------- */
  async function api(req, res, route) {
    const session = getSession(req);
    if (req.method === 'GET' && route === '/api/me') return sendJson(res, 200, { user: session ? publicUser(session) : null });

    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });
    if (!sameOrigin(req)) return sendJson(res, 403, { error: 'Cross-site request refused.' });
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) return sendJson(res, 415, { error: 'Send JSON.' });
    const body = await readJson(req);
    const str = (v) => (typeof v === 'string' ? v : '');

    if (route === '/api/login') {
      const ip = clientIp(req);
      if (tooManyFailures(ip)) return sendJson(res, 429, { error: 'Too many failed attempts. Try again in 15 minutes.' });
      const username = str(body.username).trim();
      const password = str(body.password);
      if (!username || !password) return sendJson(res, 400, { error: 'Enter your username and password.' });
      let ok = false, role = 'member', name = username;
      if (isAdminName(username) && adminHash) {
        ok = await verifyPassword(password, adminHash);
        role = 'admin'; name = adminUsername;
      } else {
        const user = isAdminName(username) ? null : store.get(username);
        ok = await verifyPassword(password, user ? user.passwordHash : dummyHash) && !!user;
        if (user) name = user.username;
      }
      if (!ok) { recordFailure(ip); return sendJson(res, 401, { error: 'Incorrect username or password.' }); }
      startSession(res, name, role);
      return sendJson(res, 200, { user: { username: name, role } });
    }

    if (route === '/api/register') {
      const username = str(body.username).trim();
      const password = str(body.password);
      if (!USERNAME_RE.test(username)) return sendJson(res, 400, { error: 'Usernames are 3–32 letters, numbers, dots, dashes or underscores.' });
      if (isAdminName(username) || username.toLowerCase() === 'admin') return sendJson(res, 400, { error: 'That username is not available.' });
      if (store.get(username)) return sendJson(res, 409, { error: 'That username is taken.' });
      if (password.length < MIN_PASSWORD) return sendJson(res, 400, { error: `Password must be at least ${MIN_PASSWORD} characters.` });
      if (password.length > 200) return sendJson(res, 400, { error: 'Password is too long.' });
      store.add({ username, role: 'member', passwordHash: await hashPassword(password), createdAt: Date.now() });
      startSession(res, username, 'member');
      return sendJson(res, 201, { user: { username, role: 'member' } });
    }

    if (route === '/api/logout') {
      if (session) sessions.delete(session.token);
      res.setHeader('Set-Cookie', sessionCookie('', 0));
      return sendJson(res, 200, { ok: true });
    }

    if (route === '/api/password') {
      if (!session) return sendJson(res, 401, { error: 'Log in first.' });
      if (session.role === 'admin') return sendJson(res, 400, { error: 'The admin password is managed in the server settings.' });
      const user = store.get(session.username);
      const current = str(body.currentPassword), next = str(body.newPassword);
      if (!user || !(await verifyPassword(current, user.passwordHash))) return sendJson(res, 400, { error: 'Current password is incorrect.' });
      if (next.length < MIN_PASSWORD) return sendJson(res, 400, { error: `New password must be at least ${MIN_PASSWORD} characters.` });
      if (next.length > 200) return sendJson(res, 400, { error: 'Password is too long.' });
      if (next === current) return sendJson(res, 400, { error: 'Choose a password different from the current one.' });
      store.update(user.username, { passwordHash: await hashPassword(next) });
      endSessionsFor(user.username, session.token); // sign out other devices
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 404, { error: 'Not found.' });
  }

  /* ---------- Static files: only the site's own pages, CSS and JS ---------- */
  function serveStatic(req, res, pathname) {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    if (pathname === '/') pathname = '/index.html';
    const allowed = /^\/[a-z-]+\.html$/.test(pathname) || /^\/css\/[a-z0-9-]+\.css$/.test(pathname) || /^\/js\/(content\/)?[a-z0-9-]+\.js$/.test(pathname);
    const file = path.join(ROOT, pathname);
    if (!allowed || !file.startsWith(ROOT + path.sep)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)], 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  }

  const server = http.createServer(async (req, res) => {
    securityHeaders(res);
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch (e) { res.writeHead(400); return res.end(); }
    try {
      if (pathname.startsWith('/api/')) return await api(req, res, pathname);
      return serveStatic(req, res, pathname);
    } catch (err) {
      if (!res.headersSent) sendJson(res, err.status || 500, { error: err.status ? err.message : 'Server error.' });
      if (!err.status) log('Error: ' + err.message);
    }
  });
  return { server, adminEnabled: !!adminHash };
}

if (require.main === module) {
  loadEnvFile(path.join(ROOT, '.env'));
  createApp().then(({ server, adminEnabled }) => {
    const port = Number(process.env.PORT) || 8000;
    const host = process.env.HOST || '127.0.0.1';
    server.listen(port, host, () => {
      console.log(`Study Desk running at http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
      console.log(adminEnabled ? 'Admin account: enabled (from server settings).' : 'Admin account: disabled.');
    });
  });
}

module.exports = { createApp, hashPassword, verifyPassword };
