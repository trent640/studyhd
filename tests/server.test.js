// Server security and code-runner tests. Run with: npm test
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../server.js');

const ADMIN_USER = 'owner_srv';
const ADMIN_PASS = 'server-test-admin-password';
let server, base, runner, dataDir;

before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studydesk-srv-'));
  ({ server, runner } = await createApp({ dataDir, adminUsername: ADMIN_USER, adminPassword: ADMIN_PASS, log: () => {}, reportMinAgeMs: 60 * 60 * 1000, runRateLimit: 1000, maxRegistrationsPerHour: 1000 }));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); fs.rmSync(dataDir, { recursive: true, force: true }); });

// A tiny client that keeps its own session cookie and pretends to come from its own IP address.
function client(ip) {
  let cookie = '';
  const call = async (method, p, body, extra = {}) => {
    const res = await fetch(base + p, {
      method, headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-Forwarded-For': ip || '', ...extra },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const sc = res.headers.get('set-cookie');
    if (sc) cookie = sc.split(';')[0];
    let data = null;
    try { data = await res.json(); } catch (e) { /* not JSON */ }
    return { status: res.status, data, headers: res.headers };
  };
  return { post: (p, b, h) => call('POST', p, b, h), get: (p) => call('GET', p) };
}

test('usernames like __proto__ and constructor are ordinary accounts', async () => {
  const c = client();
  for (const name of ['__proto__', 'constructor', 'hasOwnProperty']) {
    const r = await c.post('/api/register', { username: name, password: 'password123' });
    assert.equal(r.status, 201, name);
  }
  const again = await c.post('/api/register', { username: 'constructor', password: 'password123' });
  assert.equal(again.status, 409);
  const stored = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'));
  assert.ok(Object.prototype.hasOwnProperty.call(stored, '__proto__'));
});

test('a malformed cookie does not crash the request', async () => {
  const res = await fetch(base + '/api/me', { headers: { Cookie: 'sd_session=%E0%A4%A; other=%%%' } });
  assert.equal(res.status, 200);
});

test('security headers are sent on every response', async () => {
  const res = await fetch(base + '/');
  assert.match(res.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.match(res.headers.get('content-security-policy'), /script-src 'self'/);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.match(res.headers.get('permissions-policy'), /camera=\(\)/);
  const font = await fetch(base + '/fonts/opendyslexic-latin-400-normal.woff2');
  assert.equal(font.headers.get('content-type'), 'font/woff2');
  const wasm = await fetch(base + '/js/vendor/sqljs/sql-wasm.wasm');
  assert.equal(wasm.headers.get('content-type'), 'application/wasm');
  for (const f of ['/server.js', '/.env', '/data/users.json', '/js/vendor/codemirror/LICENSE.txt', '/tools/build-pages.py', '/js/../server.js']) {
    assert.equal((await fetch(base + f)).status, 404, f);
  }
});

test('HSTS is sent when the site runs over HTTPS', async () => {
  const { server: s2 } = await createApp({ dataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'sd-hsts-')), cookieSecure: true, codeRunner: 'off', log: () => {} });
  await new Promise((r) => s2.listen(0, '127.0.0.1', r));
  const res = await fetch(`http://127.0.0.1:${s2.address().port}/`);
  assert.match(res.headers.get('strict-transport-security'), /max-age=31536000/);
  s2.close();
});

test('registrations are limited per network address', async () => {
  const { server: s2 } = await createApp({ dataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'sd-reg-')), trustProxy: true, maxRegistrationsPerHour: 3, codeRunner: 'off', log: () => {} });
  await new Promise((r) => s2.listen(0, '127.0.0.1', r));
  const reg = (name, ip) => fetch(`http://127.0.0.1:${s2.address().port}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip }, body: JSON.stringify({ username: name, password: 'password123' }) });
  for (const n of ['a_one', 'a_two', 'a_three']) assert.equal((await reg(n, '10.0.0.1')).status, 201);
  assert.equal((await reg('a_four', '10.0.0.1')).status, 429);
  assert.equal((await reg('b_one', '10.0.0.2')).status, 201, 'other addresses are not affected');
  s2.close();
});

test('login failures are limited per account, even from many addresses', async () => {
  const { server: s2 } = await createApp({ dataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'sd-login-')), trustProxy: true, codeRunner: 'off', log: () => {} });
  await new Promise((r) => s2.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${s2.address().port}`;
  const post = (p, body, ip) => fetch(url + p, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip }, body: JSON.stringify(body) });
  await post('/api/register', { username: 'target_user', password: 'password123' }, '10.9.9.9');
  let last;
  for (let i = 0; i < 21; i++) last = await post('/api/login', { username: 'target_user', password: 'wrong-' + i }, '10.1.' + i + '.1');
  assert.equal(last.status, 429);
  s2.close();
});

test('forum reports from brand-new accounts cannot hide a post; established ones and moderators can', async () => {
  const author = client('10.5.0.1');
  await author.post('/api/register', { username: 'poster_one', password: 'password123' });
  const created = await author.post('/api/posts', { title: 'Question', body: 'Hello', agreed: true });
  assert.equal(created.status, 201);
  for (const [i, ip] of ['10.5.0.2', '10.5.0.3', '10.5.0.4'].entries()) {
    const r = client(ip);
    await r.post('/api/register', { username: 'fresh_reporter_' + i, password: 'password123' });
    const rep = await r.post(`/api/posts/${created.data.id}/report`, {});
    assert.equal(rep.data.hidden, false, 'new accounts do not hide posts');
  }
  const mod = client();
  await mod.post('/api/login', { username: ADMIN_USER, password: ADMIN_PASS });
  const modRep = await mod.post(`/api/posts/${created.data.id}/report`, {});
  assert.equal(modRep.data.hidden, true, 'a moderator report hides the post');
});

test('the code runner: policy, validation and limits', async (t) => {
  const guest = client();
  assert.equal((await guest.get('/api/runner')).data.java, false);
  assert.equal((await guest.post('/api/run', { files: { 'Main.java': 'class Main {}' } })).status, 403);
  const { server: off } = await createApp({ dataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'sd-off-')), adminUsername: 'off_admin', adminPassword: 'off-admin-password', codeRunner: 'off', log: () => {} });
  await new Promise((r) => off.listen(0, '127.0.0.1', r));
  const offUrl = `http://127.0.0.1:${off.address().port}`;
  const login = await fetch(offUrl + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'off_admin', password: 'off-admin-password' }) });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const info = await (await fetch(offUrl + '/api/runner', { headers: { Cookie: cookie } })).json();
  assert.equal(info.java, false, 'CODE_RUNNER=off disables it even for the admin');
  off.close();
  if (!runner.java) { t.skip('no JDK on this machine'); return; }
  const admin = client();
  await admin.post('/api/login', { username: ADMIN_USER, password: ADMIN_PASS });
  assert.equal((await admin.post('/api/run', { files: { 'Main.java': 'x', '../Evil.java': 'x' } })).status, 400);
  assert.equal((await admin.post('/api/run', { files: { 'Other.java': 'x' } })).status, 400, 'Main.java is required');
  assert.equal((await admin.post('/api/run', { files: { 'Main.java': 'x'.repeat(50 * 1024) } })).status, 413);
});

test('sandbox: runs cannot read the project, reach the network, or run forever', async (t) => {
  if (!runner.java || !runner.sandbox) { t.skip('sandbox not available on this machine'); return; }
  const member = client('10.7.0.1');
  await member.post('/api/register', { username: 'sandbox_tester', password: 'password123' });
  const main = `import java.nio.file.*;
public class Main { public static void main(String[] a) throws Exception {
  for (String f : new String[] { "${path.join(__dirname, '..', 'server.js')}", "${path.join(dataDir, 'users.json')}" }) {
    try { Files.readString(Path.of(f)); System.out.println("READ " + f); } catch (Exception e) { System.out.println("hidden"); }
  }
  try { new java.net.Socket("example.com", 80); System.out.println("NETWORK"); } catch (Exception e) { System.out.println("offline"); }
}}`;
  const r = await member.post('/api/run', { files: { 'Main.java': main } });
  assert.equal(r.status, 200);
  assert.equal(r.data.stdout.trim(), 'hidden\nhidden\noffline');
  // It cannot change the host's files, see other runs in /tmp, or fill the disk; it can write in its own folder.
  const writes = `import java.nio.file.*;
public class Main { public static void main(String[] a) throws Exception {
  for (String f : new String[] { "/etc/sd-escape", "/usr/sd-escape", "/tmp/sd-escape", "/var/tmp/sd-escape", "/sd-escape", "own.txt" }) {
    try { Files.writeString(Path.of(f), "x"); System.out.println("wrote " + f); } catch (Exception e) { System.out.println("blocked"); }
  }
  try (var s = Files.list(Path.of("/tmp"))) { System.out.println("tmp:" + s.count()); }
  try { Files.write(Path.of("big.bin"), new byte[40 * 1024 * 1024]); System.out.println("big written"); } catch (Throwable e) { System.out.println("big blocked"); }
}}`;
  const w = await member.post('/api/run', { files: { 'Main.java': writes } });
  assert.equal(w.data.stdout.trim(), 'blocked\nblocked\nblocked\nblocked\nblocked\nwrote own.txt\ntmp:0\nbig blocked');
  for (const f of ['/etc/sd-escape', '/usr/sd-escape', '/sd-escape']) assert.equal(fs.existsSync(f), false, f);
  const loop = await member.post('/api/run', { files: { 'Main.java': 'public class Main { public static void main(String[] a) { while (true) {} } }' } });
  assert.equal(loop.data.timedOut, true);
  // A fork bomb hits the process limit instead of taking over the machine.
  const bomb = `public class Main { public static void main(String[] a) throws Exception {
  int n = 0;
  try { for (; n < 5000; n++) { Thread t = new Thread(() -> { try { Thread.sleep(60000); } catch (Exception e) {} }); t.setDaemon(true); t.start(); } } catch (Throwable e) { System.out.println("limited"); }
  System.out.println(n < 5000 ? "capped" : "unlimited");
}}`;
  const b = await member.post('/api/run', { files: { 'Main.java': bomb } });
  assert.match(b.data.stdout, /capped/);
});

test('every Java challenge: the reference solution passes and the starter fails (real javac + java)', async (t) => {
  if (!runner.java) { t.skip('no JDK on this machine'); return; }
  global.window = {};
  const dir = path.join(__dirname, '..', 'js', 'content');
  for (const f of fs.readdirSync(dir).sort()) { delete require.cache[path.join(dir, f)]; require(path.join(dir, f)); }
  const admin = client();
  await admin.post('/api/login', { username: ADMIN_USER, password: ADMIN_PASS });
  const javaChallenges = window.SD_CHALLENGES.filter((c) => c.javaTests);
  assert.ok(javaChallenges.length >= 15);
  // Use the exact harness the browser sends, taken from js/app.js, so the test cannot drift from the app.
  const appSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  const start = appSrc.indexOf('function javaHarness(');
  let depth = 0, end = appSrc.indexOf('{', start);
  for (; end < appSrc.length; end++) { if (appSrc[end] === '{') depth++; else if (appSrc[end] === '}' && --depth === 0) break; }
  const harness = new Function(appSrc.slice(start, end + 1) + '\nreturn javaHarness;')();
  const passes = async (c, src) => {
    const pub = src.match(/^\s*public\s+(?:class|record|interface|enum)\s+(\w+)/m);
    const file = (pub ? pub[1] : (c.kind === 'java' ? c.fn : 'Solution')) + '.java';
    const r = await admin.post('/api/run', { files: { 'Main.java': harness(c.javaTests, '@@T@@'), [file]: src } });
    if (!r.data || !r.data.compiled) return -1;
    const got = r.data.stdout.split('\n').filter((l) => l.startsWith('@@T@@')).map((l) => l.split('\t')[1]);
    return c.javaTests.filter((x, i) => got[i] === 'R' + x.expected).length;
  };
  for (const c of javaChallenges) {
    assert.ok(c.javaStarter && c.javaSolution, c.id + ' has starter and solution');
    assert.equal(await passes(c, c.javaSolution), c.javaTests.length, c.id + ' reference solution');
    assert.ok(await passes(c, c.javaStarter) < c.javaTests.length, c.id + ' starter must not pass');
  }
});

test('every SQL challenge: the reference query passes and the starter fails (real SQLite)', async () => {
  global.window = {};
  const dir = path.join(__dirname, '..', 'js', 'content');
  for (const f of fs.readdirSync(dir).sort()) { delete require.cache[path.join(dir, f)]; require(path.join(dir, f)); }
  const initSqlJs = require('../js/vendor/sqljs/sql-wasm.js');
  const SQL = await initSqlJs({ locateFile: (f) => path.join(__dirname, '..', 'js', 'vendor', 'sqljs', f) });
  const check = (c, q) => {
    const db = new SQL.Database();
    db.run(c.schema);
    let res;
    try { res = db.exec(q); } catch (e) { return false; }
    const last = res[res.length - 1] || { columns: [], values: [] };
    const key = (r) => JSON.stringify(r.map(String));
    const got = last.values.map(key), want = c.expected.rows.map(key);
    if (!c.ordered) { got.sort(); want.sort(); }
    return JSON.stringify(last.columns.map((x) => x.toLowerCase())) === JSON.stringify(c.expected.columns.map((x) => x.toLowerCase())) && JSON.stringify(got) === JSON.stringify(want);
  };
  const sql = window.SD_CHALLENGES.filter((c) => c.kind === 'sql');
  assert.ok(sql.length >= 4);
  for (const c of sql) {
    assert.equal(check(c, c.solution), true, c.id + ' solution');
    assert.equal(check(c, c.starter), false, c.id + ' starter');
  }
});

test('projects link only to real challenges', () => {
  global.window = {};
  const dir = path.join(__dirname, '..', 'js', 'content');
  for (const f of fs.readdirSync(dir).sort()) { delete require.cache[path.join(dir, f)]; require(path.join(dir, f)); }
  const ids = new Set(window.SD_CHALLENGES.map((c) => c.id));
  const withChecks = window.SD_PROJECTS.filter((p) => p.checks);
  assert.ok(withChecks.length >= 7);
  for (const p of withChecks) for (const id of p.checks) assert.ok(ids.has(id), p.id + ' -> ' + id);
});

test('behind a proxy, only the address the proxy added is trusted (a faked X-Forwarded-For does not dodge limits)', async () => {
  const { server: s2 } = await createApp({ dataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'sd-xff-')), trustProxy: true, maxRegistrationsPerHour: 2, codeRunner: 'off', log: () => {} });
  await new Promise((r) => s2.listen(0, '127.0.0.1', r));
  const reg = (name, fake) => fetch(`http://127.0.0.1:${s2.address().port}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': fake + ', 10.0.0.9' }, body: JSON.stringify({ username: name, password: 'password123' }) });
  assert.equal((await reg('x_one', '1.1.1.1')).status, 201);
  assert.equal((await reg('x_two', '2.2.2.2')).status, 201);
  assert.equal((await reg('x_three', '3.3.3.3')).status, 429);
  s2.close();
});

test('wrong current passwords on the change-password form are rate limited', async () => {
  const c = client('10.8.0.1');
  await c.post('/api/register', { username: 'pw_guess_target', password: 'password123' });
  let last;
  for (let i = 0; i < 12; i++) last = await c.post('/api/password', { currentPassword: 'guess-' + i, newPassword: 'newpassword123' });
  assert.equal(last.status, 429);
});
