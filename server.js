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
     CODE_RUNNER      who may compile and run Java on this server:
                        auto (default) - the admin always; members only when the Linux sandbox works
                        off            - nobody
                        all            - every logged-in user, even without a sandbox (not recommended)
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

// Only the practice page runs learner code (JavaScript in a Worker, SQLite as WebAssembly), so only it is allowed
// 'unsafe-eval', WebAssembly and blob: workers. Every other page gets the strict policy.
const CSP_BASE = [
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:", "connect-src 'self'", "form-action 'self'", "base-uri 'none'",
  "object-src 'none'", "frame-ancestors 'none'",
];
const CSP = ["default-src 'self'", "script-src 'self'", "worker-src 'none'", ...CSP_BASE].join('; ');
const CSP_PRACTICE = ["default-src 'self'", "script-src 'self' blob: 'unsafe-eval' 'wasm-unsafe-eval'", 'worker-src blob:', ...CSP_BASE].join('; ');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.wasm': 'application/wasm', '.woff2': 'font/woff2' };

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
  const users = Object.create(null);
  try {
    const loaded = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const k of Object.keys(loaded)) users[k] = loaded[k];
  } catch (e) { /* new store */ }
  const save = () => {
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(users, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, file);
  };
  return {
    get: (name) => (Object.prototype.hasOwnProperty.call(users, name.toLowerCase()) ? users[name.toLowerCase()] : null),
    add(user) { users[user.username.toLowerCase()] = user; save(); },
    update(name, patch) { Object.assign(users[name.toLowerCase()], patch); save(); },
  };
}

/* ---------- Forum store: posts with replies, JSON file, written atomically ---------- */
const REPORTS_TO_HIDE = 3;
function createForumStore(dataDir) {
  const file = path.join(dataDir, 'posts.json');
  let posts = [];
  try { posts = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { posts = []; }
  const save = () => {
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(posts, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, file);
  };
  return {
    all: () => posts,
    get: (id) => posts.find((p) => p.id === id) || null,
    add(post) { posts.unshift(post); save(); },
    remove(id) { posts = posts.filter((p) => p.id !== id); save(); },
    save,
  };
}

/* ---------- Java code runner ----------
   Learners' Java is compiled and run in a throw-away folder. On Linux it runs inside a sandbox made with
   unshare: its own user, process and network namespaces (so no network, and every child process dies with it),
   with this project folder, the data folder and the home folder hidden behind empty tmpfs mounts.
   prlimit caps CPU time and file size, the JVM heap is capped, and a wall-clock timeout kills the whole run. */
const { spawn, spawnSync } = require('node:child_process');
const os = require('node:os');
const RUN_TIMEOUT_MS = 15000;
const RUN_OUTPUT_LIMIT = 64 * 1024;
const JVM_LIMITS = '-XX:+UseSerialGC -XX:TieredStopAtLevel=1 -XX:MaxMetaspaceSize=128m -XX:ReservedCodeCacheSize=48m -XX:CompressedClassSpaceSize=64m -XX:MaxDirectMemorySize=32m';
// Sandbox set-up, run inside the new namespaces before any learner code:
//  1. a small private tmpfs at /mnt becomes the working folder, and the sources are copied into it
//     (so runs never write to the host disk, and cannot fill it);
//  2. the project, data and home folders, plus /tmp, /var/tmp and /dev/shm, are hidden behind empty tmpfs mounts
//     (so a run cannot see the site's files or other learners' runs);
//  3. every other mount, including /, is made read-only (so a run cannot change the host's files).
// Any failure stops the run (fail closed). "$@" holds the folders to hide.
const SANDBOX_PREP = 'mount -t tmpfs -o size=32m,mode=700 none /mnt || exit 97; '
  + 'if [ -n "$SD_WORK" ]; then cp "$SD_WORK"/*.java /mnt/ || exit 97; fi; '
  + 'for d in "$@" /tmp /var/tmp /dev/shm; do if [ -d "$d" ]; then mount -t tmpfs -o size=1m,mode=700 none "$d" || exit 97; fi; done; '
  + 'while read -r _ _ _ _ m _; do case "$m" in /mnt|/proc|/proc/*) ;; *) mount -o remount,bind,ro "$m" 2>/dev/null ;; esac; done < /proc/self/mountinfo; '
  + 'mount -o remount,bind,ro / || exit 96; touch /sd-ro-check 2>/dev/null && exit 96; cd /mnt || exit 98; ';
const COMPILE_AND_RUN = 'javac -J-Xmx256m -J-XX:+UseSerialGC -J-XX:ReservedCodeCacheSize=48m -J-XX:CompressedClassSpaceSize=64m -d . -proc:none -Xlint:none -encoding UTF-8 *.java || exit 90; '
  + `exec java -Xmx256m -Xss1m ${JVM_LIMITS} -Dfile.encoding=UTF-8 -Djava.io.tmpdir=. -cp . Main`;
// Unsandboxed (CODE_RUNNER=all on a host without namespaces, or the admin there): run in the work folder.
const PLAIN_RUN = 'cd "$SD_WORK" || exit 98; ' + COMPILE_AND_RUN;
// Kernel limits for the whole run: CPU seconds, largest file, processes/threads (stops fork bombs) and memory.
const PRLIMIT = ['prlimit', '--cpu=10', '--fsize=10485760', '--nproc=256', '--as=2500000000'];
const NOBODY = 65534;
function probe(cmd, args) {
  try { return spawnSync(cmd, args, { timeout: 8000, stdio: 'ignore', env: { PATH: process.env.PATH } }).status === 0; } catch (e) { return false; }
}
// The command that starts a sandboxed run. When the server itself runs as root, the run also drops to the
// unprivileged "nobody" user first, because the kernel does not apply process limits to root.
function sandboxCommand(script, hideDirs, dropRoot) {
  const inner = ['unshare', '-rmn', '--pid', '--fork', '--mount-proc', '--kill-child', ...PRLIMIT, 'sh', '-c', script, 'sh', ...hideDirs];
  return dropRoot ? ['setpriv', `--reuid=${NOBODY}`, `--regid=${NOBODY}`, '--clear-groups', ...inner] : inner;
}
function detectRunner() {
  const java = probe('javac', ['-version']) && probe('java', ['-version']) && probe('sh', ['-c', 'true']);
  const dropRoot = typeof process.getuid === 'function' && process.getuid() === 0;
  let sandbox = false;
  if (java && process.platform === 'linux') {
    // Probe the full set-up (hiding, read-only remount, limits), so the sandbox is only used if every step works.
    const [cmd, ...args] = sandboxCommand(SANDBOX_PREP + `java -Xmx256m ${JVM_LIMITS} -version`, [os.homedir()].filter((d) => d && d !== '/'), dropRoot);
    sandbox = probe(cmd, args);
  }
  return { java, sandbox, dropRoot };
}
function runJava(files, hideDirs, sandboxed, dropRoot) {
  return new Promise((resolve) => {
    const work = fs.mkdtempSync(path.join(os.platform() === 'win32' ? os.tmpdir() : '/tmp', 'sd-run-'));
    // The sandbox only reads the sources (it copies them into its own tmpfs). If it runs as "nobody",
    // the folder must be readable by it; it is removed as soon as the run ends.
    if (sandboxed && dropRoot) fs.chmodSync(work, 0o755);
    for (const [name, code] of Object.entries(files)) fs.writeFileSync(path.join(work, name), code, { mode: sandboxed && dropRoot ? 0o644 : 0o600 });
    const env = { PATH: process.env.PATH, LANG: 'C.UTF-8', HOME: sandboxed ? '/mnt' : work, SD_WORK: work };
    const cmd = sandboxed ? sandboxCommand(SANDBOX_PREP + COMPILE_AND_RUN, hideDirs, dropRoot) : ['sh', '-c', PLAIN_RUN, 'sh'];
    const args = [cmd[0], cmd.slice(1)];
    const started = Date.now();
    const child = spawn(args[0], args[1], { cwd: work, env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false, finished = false;
    const take = (buf, add) => (buf.length >= RUN_OUTPUT_LIMIT ? buf : (buf + add).slice(0, RUN_OUTPUT_LIMIT));
    child.stdout.on('data', (d) => { stdout = take(stdout, d.toString('utf8')); });
    child.stderr.on('data', (d) => { stderr = take(stderr, d.toString('utf8')); });
    const kill = () => { try { process.kill(-child.pid, 'SIGKILL'); } catch (e) { try { child.kill('SIGKILL'); } catch (e2) { /* gone */ } } };
    const timer = setTimeout(() => { timedOut = true; kill(); }, RUN_TIMEOUT_MS);
    const done = (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      kill();
      fs.rm(work, { recursive: true, force: true }, () => {});
      const clean = (t) => t.split(work + path.sep).join('').split(work).join('.').split('/mnt/').join('').replace(/^Picked up .*\n/gm, '');
      const ms = Date.now() - started;
      if (code === 96 || code === 97) stderr = 'The sandbox could not be set up, so the code was not run.';
      resolve({ compiled: code !== 90, exitCode: code, timedOut: timedOut || (code !== 0 && ms >= 9500), timeMs: ms, stdout: clean(stdout), stderr: clean(stderr) });
    };
    child.on('error', () => done(-1));
    child.on('close', (code) => done(code));
  });
}

/* ---------- App ---------- */
async function createApp(options = {}) {
  const adminUsername = (options.adminUsername ?? process.env.ADMIN_USERNAME ?? '').trim();
  const adminPassword = options.adminPassword ?? process.env.ADMIN_PASSWORD ?? '';
  const cookieSecure = options.cookieSecure ?? process.env.COOKIE_SECURE === '1';
  const trustProxy = options.trustProxy ?? process.env.TRUST_PROXY === '1';
  const dataDir = options.dataDir || process.env.DATA_DIR || path.join(ROOT, 'data');
  const store = createUserStore(dataDir);
  const forum = createForumStore(dataDir);
  const postTimes = new Map(); // username -> [timestamps] for posting rate limits
  const runPolicy = String(options.codeRunner ?? process.env.CODE_RUNNER ?? 'auto').toLowerCase();
  const runner = runPolicy === 'off' ? { java: false, sandbox: false } : (options.runnerDetect || detectRunner)();
  const runTimes = new Map(); // username -> [timestamps]
  let activeRuns = 0;
  const runningUsers = new Set(); // one run at a time per account
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
  if (runner.java) log(`Java runner: ${runner.sandbox ? 'sandboxed' + (runner.dropRoot ? ' (runs as nobody)' : '') : 'NOT sandboxed'}; policy "${runPolicy}" (${runPolicy === 'all' ? 'all logged-in users' : runner.sandbox ? 'admin and members' : 'admin only'}).`);
  else log('Java runner: unavailable (' + (runPolicy === 'off' ? 'CODE_RUNNER=off' : 'no JDK found') + ').');
  const isAdminName = (name) => !!adminUsername && name.toLowerCase() === adminUsername.toLowerCase();
  const dummyHash = await hashPassword(crypto.randomBytes(16).toString('hex'));

  const sessions = new Map(); // token -> { username, role, expires }
  const failures = new Map(); // ip -> [timestamps]
  const userFailures = new Map(); // lowercased username -> [timestamps]
  const registrations = new Map(); // ip -> [timestamps]
  const reportMinAgeMs = options.reportMinAgeMs ?? 10 * 60 * 1000;
  const recent = (map, key, windowMs) => {
    const now = Date.now();
    const list = (map.get(key) || []).filter((t) => now - t < windowMs);
    if (list.length) map.set(key, list); else map.delete(key);
    return list;
  };
  // Periodically drop expired sessions and old rate-limit entries so memory cannot grow without bound.
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [t, sess] of sessions) if (sess.expires < now) sessions.delete(t);
    for (const map of [failures, userFailures, registrations, postTimes, runTimes]) for (const k of [...map.keys()]) recent(map, k, 60 * 60 * 1000);
  }, 10 * 60 * 1000);
  sweeper.unref();

  function clientIp(req) {
    // Use the LAST address: it is the one the trusted proxy added. Earlier entries are sent by the client and can be faked.
    if (trustProxy && req.headers['x-forwarded-for']) return String(req.headers['x-forwarded-for']).split(',').pop().trim() || 'unknown';
    return req.socket.remoteAddress || 'unknown';
  }
  function tooManyFailures(ip, username) {
    return recent(failures, ip, LOGIN_WINDOW_MS).length >= LOGIN_MAX_FAILS
      || recent(userFailures, username.toLowerCase(), LOGIN_WINDOW_MS).length >= LOGIN_MAX_FAILS * 2;
  }
  function recordFailure(ip, username) {
    failures.set(ip, [...recent(failures, ip, LOGIN_WINDOW_MS), Date.now()]);
    const u = username.toLowerCase();
    userFailures.set(u, [...recent(userFailures, u, LOGIN_WINDOW_MS), Date.now()]);
  }

  function parseCookies(req) {
    const out = Object.create(null);
    for (const part of String(req.headers.cookie || '').split(';')) {
      const i = part.indexOf('=');
      if (i <= 0) continue;
      try { out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim()); } catch (e) { /* ignore malformed cookie */ }
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
    const mine = [...sessions].filter(([, sess]) => sess.username === username).sort((a, b) => a[1].expires - b[1].expires);
    while (mine.length >= 20) sessions.delete(mine.shift()[0]);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { username, role, expires: Date.now() + SESSION_TTL_MS });
    res.setHeader('Set-Cookie', sessionCookie(token, SESSION_TTL_MS / 1000));
  }
  function endSessionsFor(username, exceptToken) {
    for (const [t, s] of sessions) if (s.username === username && t !== exceptToken) sessions.delete(t);
  }

  function securityHeaders(res, pathname) {
    res.setHeader('Content-Security-Policy', pathname === '/practice.html' ? CSP_PRACTICE : CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (cookieSecure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  function sendJson(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
  }
  function readJson(req, limit = MAX_BODY) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on('data', (c) => {
        size += c.length;
        if (size > limit) { reject(Object.assign(new Error('Request too large.'), { status: 413 })); req.destroy(); return; }
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
    if (req.method === 'GET' && route === '/api/runner') return sendJson(res, 200, runnerInfo(session));
    if (req.method === 'GET' && route === '/api/posts') return sendJson(res, 200, { posts: listPosts(session), guidelinesVersion: 1 });

    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });
    if (!sameOrigin(req)) return sendJson(res, 403, { error: 'Cross-site request refused.' });
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) return sendJson(res, 415, { error: 'Send JSON.' });
    const body = await readJson(req, route === '/api/run' ? 64 * 1024 : MAX_BODY);
    const str = (v) => (typeof v === 'string' ? v : '');

    if (route === '/api/login') {
      const ip = clientIp(req);
      const username = str(body.username).trim().slice(0, 64);
      const password = str(body.password);
      if (tooManyFailures(ip, username)) return sendJson(res, 429, { error: 'Too many failed attempts. Try again in 15 minutes.' });
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
      if (!ok) { recordFailure(ip, username); return sendJson(res, 401, { error: 'Incorrect username or password.' }); }
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
      const regIp = clientIp(req);
      if (recent(registrations, regIp, 60 * 60 * 1000).length >= (options.maxRegistrationsPerHour ?? 5)) return sendJson(res, 429, { error: 'Too many new accounts from this network. Try again later.' });
      registrations.set(regIp, [...recent(registrations, regIp, 60 * 60 * 1000), Date.now()]);
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
      // Wrong current passwords count as failed logins, so a stolen session cannot be used to guess the password.
      const ip = clientIp(req);
      if (tooManyFailures(ip, session.username)) return sendJson(res, 429, { error: 'Too many failed attempts. Try again in 15 minutes.' });
      if (!user || !(await verifyPassword(current, user.passwordHash))) { recordFailure(ip, session.username); return sendJson(res, 400, { error: 'Current password is incorrect.' }); }
      if (next.length < MIN_PASSWORD) return sendJson(res, 400, { error: `New password must be at least ${MIN_PASSWORD} characters.` });
      if (next.length > 200) return sendJson(res, 400, { error: 'Password is too long.' });
      if (next === current) return sendJson(res, 400, { error: 'Choose a password different from the current one.' });
      store.update(user.username, { passwordHash: await hashPassword(next) });
      endSessionsFor(user.username, session.token); // sign out other devices
      return sendJson(res, 200, { ok: true });
    }

    if (route.startsWith('/api/posts')) return forumApi(req, res, route, session, body);
    if (route === '/api/run') return runApi(res, session, body);
    return sendJson(res, 404, { error: 'Not found.' });
  }

  /* ---------- Java runner API ---------- */
  function runnerInfo(sess) {
    if (!runner.java) return { java: false, reason: runPolicy === 'off' ? 'Running Java is switched off on this server.' : 'This server has no Java Development Kit (JDK) installed.' };
    if (!sess) return { java: false, reason: 'Log in to run Java code.' };
    const allowed = isAdminSession(sess) || runPolicy === 'all' || runner.sandbox;
    return allowed ? { java: true, sandboxed: runner.sandbox } : { java: false, reason: 'Running Java needs a sandbox this server does not have, so it is limited to the admin.' };
  }
  async function runApi(res, sess, body) {
    const info = runnerInfo(sess);
    if (!info.java) return sendJson(res, 403, { error: info.reason });
    const files = body && typeof body.files === 'object' && body.files ? body.files : {};
    const names = Object.keys(files);
    if (!names.length || names.length > 4 || !names.includes('Main.java')) return sendJson(res, 400, { error: 'Send Main.java and up to three other files.' });
    let total = 0;
    for (const n of names) {
      if (!/^[A-Z][A-Za-z0-9]{0,40}\.java$/.test(n) || typeof files[n] !== 'string') return sendJson(res, 400, { error: 'Invalid file name.' });
      total += files[n].length;
    }
    if (total > 48 * 1024) return sendJson(res, 413, { error: 'The code is too long (48 KB maximum).' });
    const recentRuns = (runTimes.get(sess.username) || []).filter((t) => Date.now() - t < 60000);
    if (recentRuns.length >= (options.runRateLimit ?? 15)) return sendJson(res, 429, { error: 'You are running code very often. Wait a minute and try again.' });
    if (activeRuns >= (options.maxActiveRuns ?? 2)) return sendJson(res, 503, { error: 'The code runner is busy. Try again in a few seconds.' });
    if (runningUsers.has(sess.username)) return sendJson(res, 429, { error: 'Your previous run is still going. Wait for it to finish.' });
    runTimes.set(sess.username, [...recentRuns, Date.now()]);
    activeRuns++;
    runningUsers.add(sess.username);
    try {
      const hide = [...new Set([ROOT, path.resolve(dataDir), os.homedir()])].filter((d) => d && d !== '/' && !'/tmp'.startsWith(d));
      return sendJson(res, 200, await runJava(files, hide, runner.sandbox, runner.dropRoot));
    } finally { activeRuns--; runningUsers.delete(sess.username); }
  }

  /* ---------- Forum ---------- */
  const isAdminSession = (sess) => !!sess && sess.role === 'admin';
  function viewItem(item, sess) {
    const mine = !!sess && item.author === sess.username;
    return {
      id: item.id, body: item.body, createdAt: item.createdAt,
      author: item.anonymous ? 'Anonymous' : item.author,
      anonymous: !!item.anonymous, mine,
      canDelete: mine || isAdminSession(sess),
    };
  }
  function listPosts(sess) {
    const admin = isAdminSession(sess);
    return forum.all().filter((p) => !p.hidden || admin || (sess && p.author === sess.username)).map((p) => ({
      ...viewItem(p, sess),
      title: p.title, module: p.module || '',
      hidden: !!p.hidden,
      reportedByMe: !!sess && (p.reports || []).includes(sess.username),
      reports: admin ? (p.reports || []).length : undefined,
      replies: (p.replies || []).map((r) => viewItem(r, sess)),
    }));
  }
  function postLimitReached(username) {
    const now = Date.now();
    const list = (postTimes.get(username) || []).filter((t) => now - t < 60 * 60 * 1000);
    postTimes.set(username, list);
    if (list.length >= 20) return true;
    list.push(now);
    return false;
  }
  async function forumApi(req, res, route, session, body) {
    if (!session) return sendJson(res, 401, { error: 'Log in to take part in discussions.' });
    const str = (v) => (typeof v === 'string' ? v.trim() : '');
    let m;
    if (route === '/api/posts') {
      const title = str(body.title), text = str(body.body), module = str(body.module);
      if (!title || !text) return sendJson(res, 400, { error: 'Add a title and a little context.' });
      if (title.length > 90 || text.length > 2000) return sendJson(res, 400, { error: 'Titles are up to 90 characters and posts up to 2000.' });
      if (module && !/^[a-z0-9-]{1,40}$/.test(module)) return sendJson(res, 400, { error: 'Unknown module.' });
      if (body.agreed !== true) return sendJson(res, 400, { error: 'Please agree to the community guidelines first.' });
      if (postLimitReached(session.username)) return sendJson(res, 429, { error: 'You are posting very quickly. Please wait a while.' });
      if (forum.all().length >= 5000) return sendJson(res, 507, { error: 'The forum is full. Ask a moderator to tidy up old discussions.' });
      const post = { id: crypto.randomBytes(8).toString('hex'), title, body: text, module, author: session.username,
        anonymous: body.anonymous === true, createdAt: Date.now(), reports: [], hidden: false, replies: [] };
      forum.add(post);
      return sendJson(res, 201, { ok: true, id: post.id });
    }
    if ((m = route.match(/^\/api\/posts\/([a-f0-9]{16})\/(replies|report|delete|restore)$/))) {
      const post = forum.get(m[1]);
      if (!post) return sendJson(res, 404, { error: 'That discussion no longer exists.' });
      const action = m[2];
      if (action === 'replies') {
        const text = str(body.body);
        if (!text || text.length > 2000) return sendJson(res, 400, { error: 'Replies are 1 to 2000 characters.' });
        if (body.agreed !== true) return sendJson(res, 400, { error: 'Please agree to the community guidelines first.' });
        if (postLimitReached(session.username)) return sendJson(res, 429, { error: 'You are posting very quickly. Please wait a while.' });
        post.replies = post.replies || [];
        if (post.replies.length >= 300) return sendJson(res, 400, { error: 'This discussion has reached its reply limit. Start a new one.' });
        post.replies.push({ id: crypto.randomBytes(8).toString('hex'), body: text, author: session.username, anonymous: body.anonymous === true, createdAt: Date.now() });
        forum.save();
        return sendJson(res, 201, { ok: true });
      }
      if (action === 'report') {
        if (post.author === session.username) return sendJson(res, 400, { error: 'You cannot report your own post.' });
        post.reports = post.reports || [];
        if (!post.reports.includes(session.username)) post.reports.push(session.username);
        // Only established accounts count towards automatic hiding, so new throwaway accounts cannot hide posts.
        const established = post.reports.filter((u) => { const acc = store.get(u); return isAdminName(u) || (acc && Date.now() - acc.createdAt >= reportMinAgeMs); });
        if (isAdminSession(session) || established.length >= REPORTS_TO_HIDE) post.hidden = true;
        forum.save();
        return sendJson(res, 200, { ok: true, hidden: post.hidden });
      }
      if (action === 'delete') {
        if (post.author !== session.username && !isAdminSession(session)) return sendJson(res, 403, { error: 'Only the author or a moderator can delete this.' });
        forum.remove(post.id);
        return sendJson(res, 200, { ok: true });
      }
      if (action === 'restore') {
        if (!isAdminSession(session)) return sendJson(res, 403, { error: 'Only a moderator can restore posts.' });
        post.hidden = false; post.reports = [];
        forum.save();
        return sendJson(res, 200, { ok: true });
      }
    }
    if ((m = route.match(/^\/api\/posts\/([a-f0-9]{16})\/replies\/([a-f0-9]{16})\/delete$/))) {
      const post = forum.get(m[1]);
      const reply = post && (post.replies || []).find((r) => r.id === m[2]);
      if (!reply) return sendJson(res, 404, { error: 'That reply no longer exists.' });
      if (reply.author !== session.username && !isAdminSession(session)) return sendJson(res, 403, { error: 'Only the author or a moderator can delete this.' });
      post.replies = post.replies.filter((r) => r.id !== reply.id);
      forum.save();
      return sendJson(res, 200, { ok: true });
    }
    return sendJson(res, 404, { error: 'Not found.' });
  }

  /* ---------- Static files: only the site's own pages, CSS and JS ---------- */
  function serveStatic(req, res, pathname) {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    if (pathname === '/') pathname = '/index.html';
    const allowed = /^\/[a-z-]+\.html$/.test(pathname)
      || /^\/(css|js\/vendor\/codemirror)\/[a-z0-9-]+\.css$/.test(pathname)
      || /^\/js\/(content\/|vendor\/codemirror\/|vendor\/sqljs\/)?[a-z0-9-]+\.js$/.test(pathname)
      || pathname === '/js/vendor/sqljs/sql-wasm.wasm'
      || /^\/fonts\/[a-z0-9-]+\.woff2$/.test(pathname);
    const file = path.join(ROOT, pathname);
    if (!allowed || !file.startsWith(ROOT + path.sep)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)], 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  }

  const server = http.createServer(async (req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch (e) { securityHeaders(res, ''); res.writeHead(400); return res.end(); }
    securityHeaders(res, pathname);
    try {
      if (pathname.startsWith('/api/')) return await api(req, res, pathname);
      return serveStatic(req, res, pathname);
    } catch (err) {
      if (!res.headersSent) sendJson(res, err.status || 500, { error: err.status ? err.message : 'Server error.' });
      if (!err.status) log('Error: ' + err.message);
    }
  });
  server.headersTimeout = 20000;
  server.requestTimeout = 30000;
  server.keepAliveTimeout = 5000;
  server.on('close', () => clearInterval(sweeper));
  return { server, adminEnabled: !!adminHash, runner: { ...runner, policy: runPolicy } };
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
