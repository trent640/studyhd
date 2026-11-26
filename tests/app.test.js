// End-to-end tests for Study Desk. Run with: npm test
// Starts a static server on localhost (needed for Web Crypto) and drives Chromium with Playwright.
const { test, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
let server, browser, ctx, page, base, errors;

before(async () => {
  server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(ROOT, url === '/' ? 'index.html' : url);
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://localhost:${server.address().port}/`;
  browser = await chromium.launch();
});
after(async () => { await browser.close(); server.close(); });

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
  assert.deepEqual(hrefs, ['learn.html', 'roadmap.html', 'practice.html', 'projects.html', 'interview.html', 'career.html', 'community.html', 'notes.html']);
  await page.click('.nav-links a[data-nav="career"]');
  await page.waitForURL(/career\.html$/);
  assert.equal(await page.getAttribute('.nav-links a.active', 'data-nav'), 'career');
  noErrors();
});

test('home shows the next step, certifications and filterable module tiles', async () => {
  const total = await page.evaluate(() => window.StudyDesk.MODULES.length);
  assert.equal(await count('#moduleTiles .tile'), total);
  assert.equal(await count('.cert-tile'), 6);
  await page.click('.chip[data-filter="Data"]');
  const n = await count('#moduleTiles .tile');
  assert.ok(n > 0 && n < total, 'filtered count ' + n);
  await page.click('#continueBtn');
  await page.waitForURL(/lesson\.html\?m=java-fundamentals&i=0/);
  noErrors();
});

test('learn page lists certifications with step squares and projects', async () => {
  await go('learn.html');
  assert.equal(await count('details.cert'), 6);
  const steps = await page.evaluate(() => window.StudyDesk.MODULES.reduce((s, m) => s + m.lessons.length, 0));
  assert.equal(await count('details.cert .steps .step'), steps);
  // Open state is remembered.
  await page.click('#cert-dsa > summary');
  await page.waitForFunction(() => (localStorage.getItem('sd:openCerts') || '').includes('dsa'));
  await page.reload();
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

test('every challenge: starter fails, reference solution passes all tests in the browser', async () => {
  const ids = await page.evaluate(() => window.StudyDesk.CHALLENGES.map((c) => c.id));
  for (const id of ids) {
    await go('practice.html?c=' + id);
    const solution = await page.evaluate((cid) => window.StudyDesk.CHALLENGES.find((c) => c.id === cid).solution, id);
    await page.click('#runChallenge');
    await page.waitForFunction(() => /tests pass|✗/.test(document.querySelector('#testSummary').textContent));
    assert.ok(!/All \d+ tests pass/.test(await page.textContent('#testSummary')), id + ' starter should fail');
    await page.fill('#challengeCode', solution);
    await page.click('#runChallenge');
    await page.waitForFunction(() => /All \d+ tests pass/.test(document.querySelector('#testSummary').textContent), null, { timeout: 5000 });
  }
  await go('practice.html');
  assert.equal(await count('.challenge-row .proj-check.done'), ids.length);
  noErrors();
});

test('challenge runner handles syntax errors, infinite loops, drafts and solution tabs', async () => {
  await go('practice.html?c=fizzbuzz');
  await page.fill('#challengeCode', 'function fizzBuzz(n) {');
  await page.click('#runChallenge');
  await page.waitForFunction(() => /syntax error/.test(document.querySelector('#testSummary').textContent));
  await page.fill('#challengeCode', 'function fizzBuzz(n) { while (true) {} }');
  await page.click('#runChallenge');
  await page.waitForFunction(() => /Stopped after/.test(document.querySelector('#testSummary').textContent), null, { timeout: 6000 });
  await page.fill('#challengeCode', 'function wrongName() {}');
  await page.keyboard.press('Control+Enter');
  await page.waitForFunction(() => /Define a function named fizzBuzz/.test(document.querySelector('#testSummary').textContent));
  await page.reload();
  assert.equal(await page.inputValue('#challengeCode'), 'function wrongName() {}');
  await page.click('#resetChallenge');
  assert.match(await page.inputValue('#challengeCode'), /your code here/);
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
  assert.equal(await count('.project-card'), 8);
  await go('projects.html?p=gradebook-cli');
  const n = await count('#stories input');
  for (let i = 0; i < n; i++) await page.check(`#story-${i}`);
  assert.match(await page.textContent('#projProgress'), /project complete/);
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

test('community: validate, post, escape HTML, delete', async () => {
  await go('community.html');
  await page.click('#emptyNewTopic');
  await page.click('#topicForm button[type="submit"]');
  assert.match(await page.textContent('#topicError'), /title/);
  await page.fill('#topicTitle', '<img src=x onerror=alert(1)> Binary search');
  await page.fill('#topicBody', 'Why must the list be sorted?');
  await page.selectOption('#topicModule', 'algorithms');
  await page.click('#topicForm button[type="submit"]');
  await page.waitForSelector('.topic');
  assert.equal(await count('.topic img'), 0);
  assert.match(await page.textContent('.topic h3'), /<img/);
  await page.click('[data-delete]');
  await page.waitForSelector('.empty');
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

test('auth: default admin (admin / Password) must change password; members and per-user data', async () => {
  await go('lesson.html?m=oop&i=0');
  await page.click('#completeNext'); // guest progress

  await page.click('#loginBtn');
  await page.fill('#authUsername', 'admin');
  await page.fill('#authPassword', 'wrong-one');
  await page.click('#authSubmit');
  await page.waitForFunction(() => document.querySelector('#authError').textContent.length > 0);
  await page.fill('#authPassword', 'Password');
  await page.click('#authSubmit');
  await page.waitForSelector('.role-badge');
  await page.waitForSelector('#pwModal.open');
  assert.ok(!(await page.isVisible('#pwClose')), 'forced change has no close button');
  await page.keyboard.press('Escape');
  assert.ok(await page.isVisible('#pwModal'), 'Escape does not dismiss forced change');
  await page.reload();
  await page.waitForSelector('#pwModal.open');
  await page.fill('#pwCurrent', 'Password');
  await page.fill('#pwNew', 'Password');
  await page.fill('#pwConfirm', 'Password');
  await page.click('#pwSubmit');
  await page.waitForFunction(() => /different/.test(document.querySelector('#pwError').textContent));
  await page.fill('#pwNew', 'adminpass123');
  await page.fill('#pwConfirm', 'adminpass123');
  await page.click('#pwSubmit');
  await page.waitForSelector('#pwModal:not(.open)', { state: 'attached' });
  await page.reload();
  await page.waitForSelector('.role-badge');
  await page.waitForTimeout(300);
  assert.ok(!(await page.isVisible('#pwModal')), 'no prompt after password changed');
  assert.doesNotMatch(await page.getAttribute('.steps .step >> nth=0', 'class'), /done/, 'admin has separate progress');
  await page.click('#logoutBtn');
  await page.click('#loginBtn');
  await page.fill('#authUsername', 'admin');
  await page.fill('#authPassword', 'Password');
  await page.click('#authSubmit');
  await page.waitForFunction(() => /Incorrect/.test(document.querySelector('#authError').textContent));
  await page.click('#authClose');

  await page.click('#signupBtn');
  await page.fill('#authUsername', 'admin');
  await page.fill('#authPassword', 'password123');
  await page.fill('#authConfirm', 'password123');
  await page.click('#authSubmit');
  assert.match(await page.textContent('#authError'), /reserved/);
  await page.fill('#authUsername', 'sosa');
  await page.fill('#authConfirm', 'different1');
  await page.click('#authSubmit');
  assert.match(await page.textContent('#authError'), /do not match/);
  await page.fill('#authConfirm', 'password123');
  await page.click('#authSubmit');
  await page.waitForSelector('#logoutBtn');
  const stored = await page.evaluate(() => localStorage.getItem('sd:users'));
  assert.ok(!stored.includes('password123') && !stored.includes('adminpass123'));

  await go('community.html');
  await page.click('#newTopic');
  await page.fill('#topicTitle', 'Member topic');
  await page.fill('#topicBody', 'Hello');
  await page.click('#topicForm button[type="submit"]');
  await page.waitForSelector('[data-delete]');
  await page.click('#logoutBtn');
  await page.waitForSelector('.topic');
  assert.equal(await count('[data-delete]'), 0, 'guest cannot delete member post');
  await page.click('#loginBtn');
  await page.fill('#authUsername', 'admin');
  await page.fill('#authPassword', 'adminpass123');
  await page.click('#authSubmit');
  await page.waitForSelector('[data-delete]');
  await page.click('#logoutBtn');
  await go('lesson.html?m=oop&i=0');
  assert.match(await page.getAttribute('.steps .step >> nth=0', 'class'), /done/, 'guest progress kept');
  noErrors();
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
