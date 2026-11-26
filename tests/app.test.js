// End-to-end tests for Study Desk. Run with: npm test
// Starts the real Study Desk server (server.js) with a temporary data folder and
// test-only admin settings, then drives Chromium with Playwright.
const { test, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { createApp } = require('../server.js');

// Generated per run: no admin credentials are stored in the repository.
const ADMIN_USER = 'owner_' + crypto.randomBytes(3).toString('hex');
const ADMIN_PASS = crypto.randomBytes(12).toString('base64url');
let server, browser, ctx, page, base, errors, dataDir, runner;

before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studydesk-test-'));
  ({ server, runner } = await createApp({ dataDir, adminUsername: ADMIN_USER, adminPassword: ADMIN_PASS, log: () => {},
    maxRegistrationsPerHour: 1000, reportMinAgeMs: 0, runRateLimit: 1000 }));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://localhost:${server.address().port}/`;
  browser = await chromium.launch();
});
after(async () => { await browser.close(); server.close(); fs.rmSync(dataDir, { recursive: true, force: true }); });

beforeEach(async () => {
  ctx = await browser.newContext({ acceptDownloads: true });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort()); // run offline
  page = await ctx.newPage();
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  await page.goto(base);
});
afterEach(async () => { await ctx.close(); });

const go = (url) => page.goto(base + url);
const noErrors = () => assert.deepEqual(errors, [], 'page errors: ' + errors.join('; '));
const count = (sel) => page.locator(sel).count();
// The challenge editor is CodeMirror; read and write its contents through its API.
const setCode = (code) => page.evaluate((v) => document.querySelector('.CodeMirror').CodeMirror.setValue(v), code);
const getCode = () => page.evaluate(() => document.querySelector('.CodeMirror').CodeMirror.getValue());
const PAGES = ['index.html', 'learn.html', 'lesson.html?m=oop&i=0', 'roadmap.html', 'practice.html', 'projects.html',
  'interview.html', 'career.html', 'community.html', 'notes.html'];

test('every page is its own HTML file and renders without errors', async () => {
  for (const p of PAGES) {
    await go(p);
    await page.waitForSelector('h1');
  }
  await go('roadmap.html?m=nope');
  assert.match(await page.textContent('.page-head h1'), /not found/i);
  const hrefs = await page.$$eval('.nav-links a', (as) => as.map((a) => a.getAttribute('href')));
  assert.deepEqual(hrefs, ['learn.html', 'roadmap.html', 'practice.html', 'projects.html', 'tasks.html', 'interview.html', 'career.html', 'community.html', 'notes.html']);
  await page.click('.nav-links a[data-nav="career"]');
  await page.waitForURL(/career\.html$/);
  assert.equal(await page.getAttribute('.nav-links a.active', 'data-nav'), 'career');
  noErrors();
});

test('home shows the next step, certifications and filterable module tiles', async () => {
  const total = await page.evaluate(() => window.StudyDesk.MODULES.length);
  assert.equal(await count('#moduleTiles .tile'), total);
  assert.equal(await count('.cert-tile'), await page.evaluate(() => window.StudyDesk.CERTS.length));
  assert.ok(await count('.path-tile') >= 2, 'job path tiles');
  await page.click('.chip[data-filter="Data"]');
  const n = await count('#moduleTiles .tile');
  assert.ok(n > 0 && n < total, 'filtered count ' + n);
  await page.click('#continueBtn');
  await page.waitForURL(/lesson\.html\?m=java-fundamentals&i=0/);
  noErrors();
});

test('learn page lists certifications with step squares and projects', async () => {
  await go('learn.html');
  assert.equal(await count('details.cert'), await page.evaluate(() => window.StudyDesk.CERTS.length));
  const steps = await page.evaluate(() => window.StudyDesk.MODULES.reduce((s, m) => s + m.lessons.length, 0));
  assert.equal(await count('details.cert .steps .step'), steps);
  // Open state is remembered.
  await page.click('#cert-dsa > summary');
  await page.waitForFunction(() => (localStorage.getItem('sd:openCerts') || '').includes('dsa'));
  await page.reload();
  await page.waitForSelector('#cert-dsa');
  assert.equal(await page.evaluate(() => document.querySelector('#cert-dsa').open), true);
  await page.click('#cert-dsa .block .step >> nth=0');
  await page.waitForURL(/lesson\.html\?m=data-structures&i=0/);
  noErrors();
});

test('lesson page: reveal answer, autosave, complete and next, keyboard, module review', async () => {
  await go('lesson.html?m=git&i=0');
  assert.match(await page.textContent('.step-count'), /Step 1 of 6/);
  assert.match(await page.textContent('#lessonStatus'), /In progress/, 'visiting marks a step in progress');
  assert.ok(!(await page.isVisible('#answerBox')));
  await page.click('#revealAnswer');
  assert.ok(await page.isVisible('#answerBox'));
  await page.click('[data-self="no"]');
  assert.match(await page.textContent('#selfFeedback'), /normal/);
  await page.fill('#lessonAnswer', 'git add -p is useful');
  await page.reload();
  assert.equal(await page.inputValue('#lessonAnswer'), 'git add -p is useful');

  await page.click('#completeNext');
  await page.waitForURL(/i=1/);
  assert.match(await page.getAttribute('.steps .step >> nth=0', 'class'), /done/);
  await page.keyboard.press('s');
  assert.match(await page.textContent('#lessonStatus'), /Skipped/);
  await page.keyboard.press('d');
  assert.match(await page.textContent('#lessonStatus'), /Done/);

  // Last step leads to the module review with a working quiz.
  await go('lesson.html?m=git&i=5');
  await page.click('#completeNext');
  await page.waitForURL(/review=1/);
  const answer = await page.getAttribute('.quiz', 'data-answer');
  await page.click(`.quiz-option:not([data-choice="${answer}"]) >> nth=0`);
  assert.match(await page.getAttribute('.quiz .feedback', 'class'), /bad/);
  await page.click(`.quiz-option[data-choice="${answer}"]`);
  assert.match(await page.getAttribute('.quiz .feedback', 'class'), /good/);
  assert.ok(await count('.skills li') > 0);

  // Save step to notes.
  await go('lesson.html?m=git&i=2');
  const title = await page.textContent('#lessonTitle');
  await page.click('[data-note]');
  await page.waitForSelector('#noteEditor');
  assert.equal(await page.inputValue('#noteTitle'), title);
  noErrors();
});

test('roadmap draws nodes and wires, drawer updates status and links to the full step', async () => {
  await go('roadmap.html');
  await page.waitForSelector('#roadmap .node');
  const total = await page.evaluate(() => window.StudyDesk.MODULES.reduce((s, m) => s + m.lessons.length, 0));
  assert.equal(await count('#roadmap .node.sub'), total);
  await page.waitForFunction(() => document.querySelectorAll('#roadmap svg.wires path').length > 18);

  await go('roadmap.html?m=oop');
  await page.click('[data-node="oop:0"]');
  await page.waitForSelector('#drawer.open');
  await page.selectOption('#drawerStatus', 'done');
  await page.keyboard.press('l');
  assert.match(await page.textContent('#drawerPill'), /In progress/);
  await page.keyboard.press('d');
  await page.keyboard.press('Escape');
  assert.equal(await count('#roadmap .node.sub.done'), 1);
  assert.match(await page.textContent('#progressLine'), /1 of 7 done/);
  await page.click('[data-action="resume"]');
  assert.match(await page.textContent('#drawerTitle'), /Inheritance/);
  await page.click('#drawerBody a:has-text("Open full step")');
  await page.waitForURL(/lesson\.html\?m=oop&i=1/);
  await go('roadmap.html?m=oop');
  await page.click('[data-action="reset-progress"]');
  assert.equal(await count('#roadmap .node.sub.done'), 0);
  noErrors();
});

test('every browser-run challenge (JavaScript, HTML/CSS, SQL): starter fails, reference solution passes', async () => {
  const ids = await page.evaluate(() => window.StudyDesk.CHALLENGES.filter((c) => c.kind !== 'java').map((c) => c.id));
  for (const id of ids) {
    await go('practice.html?c=' + id);
    await page.waitForSelector('.CodeMirror');
    const solution = await page.evaluate((cid) => window.StudyDesk.CHALLENGES.find((c) => c.id === cid).solution, id);
    await page.click('#runChallenge');
    await page.waitForFunction(() => /tests pass|✗/.test(document.querySelector('#testSummary').textContent));
    assert.ok(!/All \d+ tests pass/.test(await page.textContent('#testSummary')), id + ' starter should fail');
    await setCode(solution);
    await page.click('#runChallenge');
    await page.waitForFunction(() => /All \d+ tests pass/.test(document.querySelector('#testSummary').textContent), null, { timeout: 8000 });
  }
  await go('practice.html');
  assert.equal(await count('.challenge-row .proj-check.done'), ids.length);
  noErrors();
});

test('challenge runner handles syntax errors, infinite loops, drafts and solution tabs', async () => {
  await go('practice.html?c=fizzbuzz');
  await page.waitForSelector('.CodeMirror');
  await setCode('function fizzBuzz(n) {');
  await page.click('#runChallenge');
  await page.waitForFunction(() => /syntax error/.test(document.querySelector('#testSummary').textContent));
  await setCode('function fizzBuzz(n) { while (true) {} }');
  await page.click('#runChallenge');
  await page.waitForFunction(() => /Stopped after/.test(document.querySelector('#testSummary').textContent), null, { timeout: 6000 });
  await setCode('function wrongName() {}');
  await page.click('.CodeMirror');
  await page.keyboard.press('Control+Enter');
  await page.waitForFunction(() => /Define a function named fizzBuzz/.test(document.querySelector('#testSummary').textContent));
  await page.reload();
  await page.waitForSelector('.CodeMirror');
  assert.equal(await getCode(), 'function wrongName() {}');
  await page.click('#resetChallenge');
  assert.match(await getCode(), /your code here/);
  // Esc leaves the editor (no keyboard trap).
  await page.click('.CodeMirror');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'runChallenge');
  await page.click('#solutionBox summary');
  await page.click('.tab[data-tab="java"]');
  assert.ok(await page.isVisible('[data-panel="java"]'));
  assert.ok(!(await page.isVisible('[data-panel="js"]')));

  await go('practice.html');
  await page.click('.chip[data-level="Medium"]');
  const levels = await page.$$eval('.challenge-row .level', (els) => els.map((e) => e.textContent));
  assert.ok(levels.length > 0 && levels.every((l) => l === 'Medium'));
  await page.click('[data-quiz="oop-tax"] .quiz-option:has-text("TaxPolicy")');
  assert.match(await page.textContent('[data-quiz="oop-tax"] .feedback'), /Correct/);
  noErrors();
});

test('projects: user stories persist, complete a project, save repo link', async () => {
  await go('projects.html');
  assert.equal(await count('.project-card'), await page.evaluate(() => window.StudyDesk.PROJECTS.length));
  await go('projects.html?p=gradebook-cli');
  const n = await count('#stories input');
  for (let i = 0; i < n; i++) await page.check(`#story-${i}`);
  // Stories alone are not enough: the project's automated checks (linked challenges) must pass too.
  assert.match(await page.textContent('#projProgress'), /0\/2 automated checks passed/);
  await page.evaluate(() => {
    const u = window.StudyDesk.Auth.current();
    const key = 'sd:' + (u ? u.username : 'guest') + ':solved';
    const solved = JSON.parse(localStorage.getItem(key) || '{}');
    for (const id of ['gradebook-core', 'bank-account']) solved[id] = Date.now();
    localStorage.setItem(key, JSON.stringify(solved));
  });
  await page.reload();
  assert.match(await page.textContent('#projProgress'), /project complete/i);
  await page.fill('#repoUrl', 'https://github.com/me/gradebook');
  await page.press('#repoUrl', 'Tab');
  await page.reload();
  assert.equal(await page.inputValue('#repoUrl'), 'https://github.com/me/gradebook');
  assert.ok(await page.isChecked('#story-0'));
  await go('learn.html');
  assert.match(await page.textContent('#cert-foundations .cert-meta'), /1\/1 projects/);
  noErrors();
});

test('comfort settings apply, persist across pages and reset', async () => {
  await page.click('#settingsBtn');
  await page.waitForSelector('#settingsModal.open');
  await page.check('input[name="textSize"][value="xl"]');
  await page.check('input[name="font"][value="readable"]');
  await page.check('input[name="spacing"][value="relaxed"]');
  await page.check('input[name="theme"][value="dark"]');
  await page.check('input[name="calm"]');
  await page.check('input[name="reduceMotion"]');
  await page.uncheck('input[name="showTimes"]');
  await page.keyboard.press('Escape');
  await go('lesson.html?m=oop&i=0');
  const cls = await page.getAttribute('body', 'class');
  for (const c of ['text-xl', 'font-readable', 'spacing-relaxed', 'theme-dark', 'calm', 'reduce-motion', 'hide-times']) assert.ok(cls.includes(c), c);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.readable')).fontSize), '21px');
  assert.ok(!(await page.isVisible('.time-tag')));
  await page.click('#focusReading');
  assert.ok(!(await page.isVisible('.topnav')));
  await page.click('#focusReading');
  await page.click('#settingsBtn');
  await page.click('#settingsReset');
  assert.ok(!(await page.getAttribute('body', 'class')).includes('theme-dark'));
  noErrors();
});

test('daily goal counts completed steps and break reminder opens a break timer', async () => {
  await page.evaluate(() => { localStorage.setItem('sd:settings', JSON.stringify({ dailyGoal: 1, breakMinutes: 25 })); sessionStorage.setItem('sd:studyStart', String(Date.now() - 26 * 60000)); });
  await go('lesson.html?m=oop&i=0');
  await page.click('#completeNext');
  await go('index.html');
  assert.match(await page.textContent('.goal-line'), /Today: 1 of 1 step/);
  await page.waitForSelector('#breakModal.open', { timeout: 20000 });
  await page.click('#breakTake');
  await page.waitForSelector('#focusOverlay.open');
  assert.equal(await page.textContent('#focusLabel'), 'Break');
  await page.waitForFunction(() => document.querySelector('#focusTimer').textContent !== '05:00', null, { timeout: 3000 });
  await page.keyboard.press('Escape');
  assert.ok(!(await page.isVisible('#focusOverlay')));
  noErrors();
});

test('interview: technical and STAR decks, notes template, optional timer', async () => {
  await go('interview.html');
  await page.click('#showPrompt');
  assert.ok(!/Press/.test(await page.textContent('#promptCard')));
  await page.click('.tab[data-deck="star"]');
  assert.ok(await page.isVisible('#starHelp'));
  await page.click('#showPrompt');
  await page.click('#ivStart');
  await page.waitForFunction(() => document.querySelector('#ivTimer').textContent !== '15:00', null, { timeout: 3000 });
  await page.click('#ivStart');
  assert.match(await page.textContent('#ivStart'), /Resume/);
  await page.click('#ivReset');
  assert.equal(await page.textContent('#ivTimer'), '15:00');
  await page.click('#savePrompt');
  await page.waitForSelector('#noteEditor');
  assert.match(await page.inputValue('#noteBody'), /Situation:[\s\S]*Action:/);
  noErrors();
});

const login = async (username, password) => {
  await page.click('#loginBtn');
  await page.fill('#authUsername', username);
  await page.fill('#authPassword', password);
  await page.click('#authSubmit');
};

const signUp = async (username, password = 'password123') => {
  await page.click('#signupBtn');
  await page.fill('#authUsername', username);
  await page.fill('#authPassword', password);
  await page.fill('#authConfirm', password);
  await page.click('#authSubmit');
  await page.waitForSelector('#logoutBtn');
};

test('community: guidelines, anonymous posts, replies, escaping, reports and moderation', async () => {
  await go('community.html');
  // Guests can read but must log in to post on the shared server forum.
  await page.waitForSelector('#loginToPost');
  assert.ok(await page.isVisible('.guidelines ol'), 'guidelines are shown');
  await signUp('learner_one');
  await page.click('#emptyNewTopic');
  await page.click('#topicForm button[type="submit"]');
  assert.match(await page.textContent('#topicError'), /title/);
  await page.fill('#topicTitle', '<img src=x onerror=alert(1)> Binary search');
  await page.fill('#topicBody', 'Why must the list be sorted?');
  await page.selectOption('#topicModule', 'algorithms');
  await page.check('#topicAnon');
  await page.click('#topicForm button[type="submit"]');
  assert.match(await page.textContent('#topicError'), /guidelines/);
  await page.check('#topicAgree');
  await page.click('#topicForm button[type="submit"]');
  await page.waitForSelector('.topic');
  assert.equal(await count('.topic img'), 0);
  assert.match(await page.textContent('.topic h3'), /<img/);
  assert.match(await page.textContent('.topic .topic-meta'), /Anonymous \(you\)/);
  // Reply.
  await page.click('.reply-box summary');
  await page.fill('.reply-box textarea', 'Because it halves the range each time.');
  await page.click('.reply-box button[type="submit"]');
  await page.waitForSelector('.reply');
  await page.click('#logoutBtn');
  await page.waitForSelector('#loginBtn');
  // The anonymous author's name is not exposed to other learners.
  const listing = await page.evaluate(() => fetch('/api/posts').then((r) => r.json()));
  assert.equal(listing.posts[0].author, 'Anonymous', 'anonymous author hidden in API');
  assert.ok(!JSON.stringify(listing.posts[0]).replace(JSON.stringify(listing.posts[0].replies), '').includes('learner_one'), 'no name leaks on the post');
  // Three different learners report it -> hidden until a moderator restores it.
  for (const u of ['reporter_a', 'reporter_b', 'reporter_c']) {
    await signUp(u);
    await page.waitForSelector('[data-report]');
    await page.click('[data-report]');
    await page.waitForFunction(() => !document.querySelector('[data-report]'));
    await page.click('#logoutBtn');
    await page.waitForSelector('#loginBtn');
  }
  await page.waitForSelector('.empty');
  assert.equal(await count('.topic'), 0, 'reported post hidden from learners');
  await login(ADMIN_USER, ADMIN_PASS);
  await page.waitForSelector('[data-restore]');
  await page.click('[data-restore]');
  await page.waitForFunction(() => !document.querySelector('.topic.is-hidden'));
  await page.click('[data-delete]:not([data-reply])');
  await page.waitForSelector('.empty');
  await page.click('#logoutBtn');
  noErrors();
});

test('career checklist persists and downloads', async () => {
  await go('career.html');
  await page.check('#chk-ds');
  await page.check('#w1');
  assert.match(await page.textContent('#careerBadge'), /^2\//);
  await page.reload();
  assert.ok(await page.isChecked('#chk-ds'));
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#downloadChecklist')]);
  const text = fs.readFileSync(await dl.path(), 'utf8');
  assert.match(text, /\[x\] Data structures/);
  assert.match(text, /\[ \] Unit and integration testing/);
  noErrors();
});

test('notes: create, edit, search and delete', async () => {
  await go('notes.html');
  await page.click('#addNote');
  await page.waitForSelector('#noteEditor');
  await page.fill('#noteTitle', 'Big-O cheatsheet');
  await page.fill('#noteBody', 'binary search is O(log n)');
  await page.click('#noteEditor button[type="submit"]');
  await page.waitForSelector('.note-item:has-text("Big-O cheatsheet")');
  await page.fill('#noteSearch', 'zzz');
  assert.equal(await count('.note-item'), 0);
  await page.fill('#noteSearch', 'log n');
  assert.equal(await count('.note-item'), 1);
  await page.fill('#noteSearch', '');
  await page.click('#deleteNote');
  await page.waitForSelector('.empty');
  noErrors();
});


test('auth: admin login comes from server settings; members, sessions and per-user data', async () => {
  await go('lesson.html?m=oop&i=0');
  await page.click('#completeNext'); // guest progress

  // Wrong password is refused with a generic message.
  await login(ADMIN_USER, 'not-the-password');
  await page.waitForFunction(() => /Incorrect username or password/.test(document.querySelector('#authError').textContent));
  // Correct admin password from the server settings works.
  await page.fill('#authPassword', ADMIN_PASS);
  await page.click('#authSubmit');
  await page.waitForSelector('.role-badge');
  assert.doesNotMatch(await page.getAttribute('.steps .step >> nth=0', 'class'), /done/, 'admin has separate progress');
  // Session survives a reload (HttpOnly cookie, not readable from JS).
  await page.reload();
  await page.waitForSelector('.role-badge');
  assert.equal(await page.evaluate(() => document.cookie.includes('sd_session')), false, 'session cookie is HttpOnly');
  // The admin password cannot be changed from the website.
  await page.click('#accountBtn');
  assert.ok(!(await page.isVisible('#pwModal')));
  await page.click('#logoutBtn');
  await page.waitForSelector('#loginBtn');

  // Registration rules are enforced by the server.
  await page.click('#signupBtn');
  await page.fill('#authUsername', ADMIN_USER);
  await page.fill('#authPassword', 'password123');
  await page.fill('#authConfirm', 'password123');
  await page.click('#authSubmit');
  await page.waitForFunction(() => /not available/.test(document.querySelector('#authError').textContent));
  await page.fill('#authUsername', 'sosa');
  await page.fill('#authConfirm', 'different1');
  await page.click('#authSubmit');
  assert.match(await page.textContent('#authError'), /do not match/);
  await page.fill('#authConfirm', 'password123');
  await page.click('#authSubmit');
  await page.waitForSelector('#logoutBtn');

  // Nothing about accounts is kept in the browser any more.
  const local = await page.evaluate(() => JSON.stringify(localStorage));
  assert.ok(!local.includes('password123') && !local.includes(ADMIN_PASS) && !local.includes('sd:users'));
  // Passwords on disk are scrypt hashes; the admin is never written to disk.
  const onDisk = fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8');
  assert.ok(onDisk.includes('scrypt$') && !onDisk.includes('password123') && !onDisk.includes(ADMIN_USER));

  // Member changes their password.
  await page.click('#accountBtn');
  await page.fill('#pwCurrent', 'password123');
  await page.fill('#pwNew', 'newpassword456');
  await page.fill('#pwConfirm', 'newpassword456');
  await page.click('#pwSubmit');
  await page.waitForSelector('#pwModal:not(.open)', { state: 'attached' });

  // Member posts; guests cannot delete it; the admin can.
  await go('community.html');
  await page.click('#newTopic');
  await page.fill('#topicTitle', 'Member topic');
  await page.fill('#topicBody', 'Hello');
  await page.check('#topicAgree');
  await page.click('#topicForm button[type="submit"]');
  await page.waitForSelector('[data-delete]');
  await page.click('#logoutBtn');
  await page.waitForSelector('#loginBtn');
  await page.waitForSelector('.topic');
  assert.equal(await count('[data-delete]'), 0, 'guest cannot delete member post');
  await login('sosa', 'password123');
  await page.waitForFunction(() => /Incorrect/.test(document.querySelector('#authError').textContent));
  await page.fill('#authPassword', 'newpassword456');
  await page.click('#authSubmit');
  await page.waitForSelector('#logoutBtn');
  await page.click('#logoutBtn');
  await page.waitForSelector('#loginBtn');
  await login(ADMIN_USER, ADMIN_PASS);
  await page.waitForSelector('[data-delete]');
  await page.click('#logoutBtn');
  await go('lesson.html?m=oop&i=0');
  assert.match(await page.getAttribute('.steps .step >> nth=0', 'class'), /done/, 'guest progress kept');
  noErrors();
});

test('server API: rate limits, cross-site refusal, and no access to private files', async () => {
  const api = (p, body, headers = {}) => fetch(base + p.replace(/^\//, ''), { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const cross = await api('/api/login', { username: 'x', password: 'y' }, { Origin: 'https://evil.example' });
  assert.equal(cross.status, 403, 'cross-origin POST refused');
  const form = await fetch(base + 'api/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'username=a&password=b' });
  assert.equal(form.status, 415, 'non-JSON refused');
  for (const f of ['server.js', '.env', 'data/users.json', 'package.json', 'tests/app.test.js', '..%2fserver.js', 'js/../server.js']) {
    const r = await fetch(base + f);
    assert.equal(r.status, 404, f + ' must not be served');
  }
  const page1 = await fetch(base);
  assert.match(page1.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal(page1.headers.get('x-frame-options'), 'DENY');
  let last;
  for (let i = 0; i < 11; i++) last = await api('/api/login', { username: 'nobody_' + i, password: 'wrong-password' });
  assert.equal(last.status, 429, 'repeated failures are rate limited');
});

test('mobile layout: menu toggles and no page scrolls sideways', async () => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const p of [...PAGES, 'practice.html?c=two-sum', 'projects.html?p=task-api', 'lesson.html?m=rest-apis&i=2']) {
    await go(p);
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `${p} overflows by ${overflow}px`);
  }
  await page.click('#menuToggle');
  await page.click('#navLinks a[data-nav="practice"]');
  await page.waitForURL(/practice\.html$/);
  noErrors();
});

test('security: CSP present on every page, and stored content cannot inject script', async () => {
  for (const p of ['index.html', 'practice.html', 'notes.html']) {
    await go(p);
    const csp = await page.getAttribute('meta[http-equiv="Content-Security-Policy"]', 'content');
    assert.ok(csp && /script-src 'self'/.test(csp) && /object-src 'none'/.test(csp), p + ' CSP');
  }
  // A note title/body with an XSS payload is stored and rendered as inert text.
  await go('notes.html');
  await page.click('#addNote');
  await page.waitForSelector('#noteEditor');
  await page.fill('#noteTitle', '<img src=x onerror=window.__xss=1>');
  await page.fill('#noteBody', '<script>window.__xss=1<\/script>');
  await page.click('#noteEditor button[type="submit"]');
  await page.waitForSelector('.note-item');
  assert.equal(await page.locator('.note-item img, #noteBody ~ * img').count(), 0);
  assert.equal(await page.evaluate(() => window.__xss), undefined, 'payload did not execute');
  assert.match(await page.textContent('.note-item'), /<img/);
  noErrors();
});

test('tasks: add from home and lesson, tick, reorder, delete, clear', async () => {
  await page.fill('#quickTask', 'Read the OOP lecture');
  await page.click('#quickTaskForm button');
  await page.waitForSelector('#todayTasks .task');
  await go('lesson.html?m=oop&i=1');
  await page.click('[data-addtask]');
  await page.click('[data-addtask]'); // duplicates are ignored
  await go('tasks.html');
  assert.equal(await count('#todoList .task'), 2);
  await page.click('#todoList .task >> nth=1 >> [data-move="-1"]');
  assert.match(await page.textContent('#todoList .task >> nth=0'), /Object-oriented design/);
  await page.click('#todoList .task >> nth=0 >> input');
  await page.waitForSelector('#doneList .task');
  await page.click('#clearDone');
  assert.equal(await count('#doneList .task'), 0);
  await page.click('#todoList .task >> nth=0 >> [data-remove]');
  await page.waitForSelector('#todoList .task-empty');
  noErrors();
});

test('lecture: captions, transcript, controls, completion and points', async () => {
  await go('lecture.html?m=oop&l=0');
  assert.match(await page.textContent('#slideCount'), /Slide 1 of 4/);
  assert.ok((await page.textContent('#caption')).length > 20, 'caption shown');
  assert.equal(await count('#transcript li'), 4);
  await page.keyboard.press('ArrowRight');
  assert.match(await page.textContent('#slideCount'), /Slide 2 of 4/);
  await page.keyboard.press('c');
  assert.ok(!(await page.isVisible('#caption')), 'captions toggled off');
  await page.click('[data-jump="3"]');
  assert.match(await page.textContent('#slideCount'), /Slide 4 of 4/);
  await page.click('#lecNext');
  await page.waitForSelector('#lectureDone:not([hidden])');
  await go('index.html');
  assert.match(await page.textContent('.points-total'), /^5 points/);
  noErrors();
});

test('final quiz gives instant feedback, a score and a badge', async () => {
  await go('lesson.html?m=oop&review=1');
  const answers = await page.evaluate(() => window.StudyDesk.MODULES.find((m) => m.id === 'oop').finalQuiz.map((q) => q.answer));
  for (let i = 0; i < answers.length; i++) {
    await page.click(`.fq[data-q="${i}"] .quiz-option[data-choice="${answers[i]}"]`);
    assert.match(await page.getAttribute(`.fq[data-q="${i}"] .feedback`, 'class'), /good/);
  }
  assert.match(await page.textContent('#fqScore'), /6 of 6 \(100%\)/);
  await go('index.html');
  assert.match(await page.getAttribute('.badge:has-text("Quiz ace")', 'class'), /earned/);
  noErrors();
});

test('settings: simple view steps through lesson parts; contrast, fonts and hiding points', async () => {
  await page.click('#settingsBtn');
  await page.check('input[name="view"][value="simple"]');
  await page.check('input[name="theme"][value="contrast"]');
  await page.check('input[name="font"][value="lexend"]');
  await page.uncheck('input[name="showPoints"]');
  await page.keyboard.press('Escape');
  const cls = await page.getAttribute('body', 'class');
  for (const c of ['view-simple', 'theme-contrast', 'font-lexend', 'hide-points']) assert.ok(cls.includes(c), c);
  assert.ok(!(await page.isVisible('.progress-card')), 'points hidden');
  assert.ok(!(await page.isVisible('#moduleTiles')), 'simple view hides extra sections');
  await go('lesson.html?m=oop&i=0');
  assert.equal(await page.locator('.lesson .chunk:visible').count(), 1, 'one part at a time');
  assert.match(await page.textContent('.part-label'), /Part 1 of 5/);
  await page.click('[data-part="next"]');
  assert.match(await page.textContent('.part-label'), /Part 2 of 5/);
  await page.click('#settingsBtn');
  await page.check('input[name="font"][value="dyslexic"]');
  await page.waitForSelector('#font-opendyslexic', { state: 'attached' });
  noErrors();
});

test('pomodoro: focus length setting, counts sessions and switches to a break', async () => {
  await page.clock.install();
  await page.evaluate(() => localStorage.setItem('sd:settings', JSON.stringify({ focusMinutes: 15, breakMinutes: 0 })));
  await page.reload();
  await page.click('.today-foot [data-action="focus"]');
  assert.equal(await page.textContent('#focusTimer'), '15:00');
  await page.click('#focusStart');
  await page.clock.runFor('15:02');
  await page.waitForFunction(() => document.querySelector('#focusLabel').textContent === 'Break');
  assert.equal(await page.textContent('#focusTimer'), '05:00');
  assert.match(await page.textContent('#focusCount'), /Pomodoros today: 1/);
  await page.keyboard.press('Escape');
  await page.reload();
  assert.match(await page.textContent('.today-foot'), /1 done today/);
  assert.match(await page.getAttribute('.badge:has-text("Focused")', 'class'), /earned/);
  noErrors();
});

test('roadmap: W3Schools-style topics and Previous/Next, freeCodeCamp-style steps, checkpoints and Try it', async () => {
  await go('roadmap.html?path=java-ai');
  const certs = await page.evaluate(() => window.StudyDesk.JOBPATHS.find((p) => p.id === 'java-ai').certs.length);
  assert.equal(await count('.rm-checkpoint'), certs, 'one checkpoint per certification');
  assert.equal(await count('.fcc-block'), certs);
  assert.match(await page.textContent('.rm-side-link.current'), /Whole roadmap/);
  await page.click('.rm-side-desktop .rm-side-link:has-text("Object-oriented design")');
  await page.waitForURL(/roadmap\.html\?m=oop&path=java-ai/);
  assert.match(await page.textContent('.rm-side-desktop .rm-side-link.current'), /Object-oriented design/);
  assert.equal(await count('.step-row'), 7);
  assert.equal(await page.getAttribute('.tryit .btn', 'href'), 'practice.html?c=course-class');
  assert.ok(await count('.tryit .resource-link') > 0, 'W3Schools / freeCodeCamp links');
  await page.click('.w3-nav >> nth=0 >> a[rel="next"]');
  await page.waitForURL(/m=data-structures/);
  await page.selectOption('.rm-side-desktop .rm-path', '');
  await page.waitForURL(/roadmap\.html\?m=data-structures$/);
  await page.setViewportSize({ width: 375, height: 800 });
  await page.reload();
  assert.ok(await page.isVisible('.rm-side-mobile summary'), 'topics collapse on phones');
  noErrors();
});

test('Java in the editor: guests are asked to log in; members compile and run against tests', async (t) => {
  if (!runner.java) { t.skip('no JDK on this machine'); return; }
  await go('practice.html?c=two-sum');
  await page.waitForSelector('.CodeMirror');
  await page.click('[data-switchlang="java"]');
  await page.waitForSelector('#runnerNote:not([hidden])');
  assert.ok(await page.isDisabled('#runChallenge'));
  await signUp('java_learner');
  await page.reload();
  await page.waitForSelector('.CodeMirror');
  assert.match(await page.textContent('.lang-switch .chip.active'), /Java/, 'language choice remembered');
  await page.click('#runChallenge');
  await page.waitForFunction(() => /tests pass|✗/.test(document.querySelector('#testSummary').textContent), null, { timeout: 30000 });
  assert.match(await page.textContent('#testSummary'), /0 of 4/);
  await setCode('class Solution { static int[] twoSum(int[] n, int t) { return null } }');
  await page.click('#runChallenge');
  await page.waitForFunction(() => /does not compile/.test(document.querySelector('#testSummary').textContent), null, { timeout: 30000 });
  assert.match(await page.textContent('#runOutput'), /Solution\.java:1: error/);
  const sol = await page.evaluate(() => window.StudyDesk.CHALLENGES.find((c) => c.id === 'two-sum').javaSolution);
  await setCode(sol.replace('return new int[0];', 'System.out.println("debug line");\n        return new int[0];'));
  await page.click('#runChallenge');
  await page.waitForFunction(() => /All 4 tests pass/.test(document.querySelector('#testSummary').textContent), null, { timeout: 30000 });
  // A project's automated checks reflect solved challenges.
  await go('projects.html?p=dsa-library');
  assert.match(await page.textContent('#projProgress'), /1\/3 automated checks passed/);
  noErrors();
});

test('Java "predict the output" questions can be run for real', async (t) => {
  if (!runner.java) { t.skip('no JDK on this machine'); return; }
  await go('practice.html');
  await signUp('predictor');
  await page.click('[data-runpredict="java-div"]');
  await page.waitForFunction(() => !/Running/.test(document.querySelector('#out-java-div').textContent), null, { timeout: 30000 });
  assert.equal((await page.textContent('#out-java-div')).trim(), '3\n3.5');
  noErrors();
});
