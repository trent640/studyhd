// End-to-end tests for Study Desk. Run with: npm test
// Starts a static server on localhost (needed for Web Crypto) and drives Chromium with Playwright.
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
let server, browser, page, base, errors;

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
  const ctx = await browser.newContext({ acceptDownloads: true });
  // Block external font requests so tests run offline.
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  page = await ctx.newPage();
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  await page.goto(base);
});

const go = (url) => page.goto(base + url);
const noErrors = () => assert.deepEqual(errors, [], 'page errors: ' + errors.join('; '));

test('home renders module tiles and filters by category', async () => {
  await page.waitForSelector('#moduleTiles .tile');
  assert.equal(await page.locator('#moduleTiles .tile').count(), 12);
  await page.click('.chip[data-filter="Data"]');
  const n = await page.locator('#moduleTiles .tile').count();
  assert.ok(n > 0 && n < 12, 'filtered count ' + n);
  await page.click('.chip[data-filter="All"]');
  assert.equal(await page.locator('#moduleTiles .tile').count(), 12);
  noErrors();
});

test('every page is its own HTML file and renders without errors', async () => {
  for (const h of ['roadmap.html', 'roadmap.html?m=oop', 'roadmap.html?m=security', 'practice.html', 'interview.html', 'community.html', 'career.html', 'notes.html', 'roadmap.html?m=nope']) {
    await go(h);
    await page.waitForSelector('.page-head h1');
  }
  assert.match(await page.textContent('.page-head h1'), /not found/i);
  // Nav links point at separate files.
  const hrefs = await page.$$eval('.nav-links a', (as) => as.map((a) => a.getAttribute('href')));
  assert.deepEqual(hrefs, ['roadmap.html', 'practice.html', 'interview.html', 'community.html', 'career.html', 'notes.html']);
  await page.click('.nav-links a[data-nav="career"]');
  await page.waitForURL(/career\.html$/);
  assert.equal(await page.getAttribute('.nav-links a.active', 'data-nav'), 'career');
  noErrors();
});

test('full roadmap draws nodes and wires for all lessons', async () => {
  await go('roadmap.html');
  await page.waitForSelector('#roadmap .node');
  const total = await page.evaluate(() => window.StudyDesk.MODULES.reduce((s, m) => s + m.lessons.length, 0));
  assert.equal(await page.locator('#roadmap .node.sub').count(), total);
  assert.equal(await page.locator('#roadmap .node.main').count(), 12);
  await page.waitForFunction(() => document.querySelectorAll('#roadmap svg.wires path').length > 12);
  noErrors();
});

test('lesson drawer: status, keyboard shortcuts, progress and persistence', async () => {
  await go('roadmap.html?m=oop');
  await page.click('[data-node="oop:0"]');
  await page.waitForSelector('#drawer.open');
  assert.ok((await page.textContent('#drawerTitle')).length > 3);
  assert.ok(await page.locator('#drawerBody pre.code').count() >= 1);

  await page.selectOption('#drawerStatus', 'done');
  assert.match(await page.textContent('#drawerPill'), /Done/);
  await page.keyboard.press('l');
  assert.match(await page.textContent('#drawerPill'), /In progress/);
  await page.keyboard.press('d');
  await page.keyboard.press('Escape');
  await page.waitForSelector('#drawer:not(.open)');
  assert.ok(await page.locator('#roadmap .node.sub.done').count() === 1);
  assert.match(await page.textContent('#progressLine'), /1 of 7 done/);

  // Mark done & next moves to lesson 2.
  await page.click('[data-node="oop:1"]');
  const t1 = await page.textContent('#drawerTitle');
  await page.click('[data-drawer="done-next"]');
  const t2 = await page.textContent('#drawerTitle');
  assert.notEqual(t1, t2);
  await page.keyboard.press('Escape');

  await page.reload();
  await page.waitForSelector('#roadmap .node');
  assert.equal(await page.locator('#roadmap .node.sub.done').count(), 2);

  // Resume opens first unfinished; reset clears progress.
  await page.click('[data-action="resume"]');
  await page.waitForSelector('#drawer.open');
  assert.equal(await page.textContent('#drawerTitle'), t2);
  await page.keyboard.press('Escape');
  await page.click('[data-action="reset-progress"]');
  assert.equal(await page.locator('#roadmap .node.sub.done').count(), 0);

  // Home shows the progress tile bar once something is started.
  await page.click('#roadmap .node.sub >> nth=0');
  await page.keyboard.press('d');
  await go('index.html');
  await page.waitForSelector('.stat-strip');
  noErrors();
});

test('module quiz and practice quizzes give feedback', async () => {
  await go('roadmap.html?m=algorithms');
  await page.click('#roadmap .node.sub:has-text("Quick quiz")');
  const answer = await page.getAttribute('#drawerBody .quiz', 'data-answer');
  await page.click(`#drawerBody .quiz-option:not([data-choice="${answer}"]) >> nth=0`);
  assert.match(await page.getAttribute('#drawerBody .feedback', 'class'), /bad/);
  await page.click(`#drawerBody .quiz-option[data-choice="${answer}"]`);
  assert.match(await page.getAttribute('#drawerBody .feedback', 'class'), /good/);
  await page.keyboard.press('Escape');

  await go('practice.html');
  await page.click('[data-quiz="oop-tax"] .quiz-option:has-text("TaxPolicy")');
  assert.match(await page.textContent('[data-quiz="oop-tax"] .feedback'), /Correct/);
  await page.click('[data-quiz="bsearch"] .quiz-option:has-text("Linear")');
  assert.match(await page.getAttribute('[data-quiz="bsearch"] .feedback', 'class'), /bad/);
  noErrors();
});

test('code challenge runs tests in a worker, including timeouts', async () => {
  await go('practice.html');
  await page.click('#runChallenge');
  await page.waitForFunction(() => /tests passed|✗/.test(document.querySelector('#challengeOutput').textContent) && !/Running/.test(document.querySelector('#challengeOutput').textContent));
  assert.match(await page.textContent('#challengeOutput'), /[0-3]\/4 tests passed/);

  const fixed = `class Course {
  constructor(name) { this.name = name; this.lessons = []; }
  addLesson(title) { this.lessons.push(title); }
  lessonOrder() { return [...this.lessons]; }
}`;
  await page.fill('#challengeCode', fixed);
  await page.click('#runChallenge');
  await page.waitForFunction(() => /4\/4 tests passed/.test(document.querySelector('#challengeOutput').textContent));

  await page.fill('#challengeCode', 'class Course { constructor(){ while(true){} } lessonOrder(){} }');
  await page.click('#runChallenge');
  await page.waitForFunction(() => /Timed out/.test(document.querySelector('#challengeOutput').textContent), null, { timeout: 5000 });

  await page.fill('#challengeCode', 'class Course {');
  await page.click('#runChallenge');
  await page.waitForFunction(() => /Syntax error/.test(document.querySelector('#challengeOutput').textContent));

  // Draft persists.
  await page.reload();
  assert.equal(await page.inputValue('#challengeCode'), 'class Course {');
  await page.click('#resetChallenge');
  assert.match(await page.inputValue('#challengeCode'), /bug: lessons are strings/);
  noErrors();
});

test('interview prompts and timer start, pause, reset', async () => {
  await go('interview.html');
  await page.click('#showPrompt');
  assert.ok(!/Press/.test(await page.textContent('#promptCard')));
  await page.click('#ivStart');
  await page.waitForFunction(() => document.querySelector('#ivTimer').textContent !== '15:00', null, { timeout: 3000 });
  await page.click('#ivStart');
  assert.match(await page.textContent('#ivStart'), /Resume/);
  await page.click('#ivReset');
  assert.equal(await page.textContent('#ivTimer'), '15:00');
  await page.click('#savePrompt');
  await page.waitForSelector('#noteEditor');
  assert.match(await page.inputValue('#noteTitle'), /^Interview:/);
  noErrors();
});

test('focus mode opens, counts down and closes with Escape', async () => {
  await page.click('[data-action="focus"]');
  await page.waitForSelector('#focusOverlay.open');
  await page.click('#focusStart');
  await page.waitForFunction(() => document.querySelector('#focusTimer').textContent !== '25:00', null, { timeout: 3000 });
  await page.click('#focusReset');
  assert.equal(await page.textContent('#focusTimer'), '25:00');
  await page.keyboard.press('Escape');
  await page.waitForSelector('#focusOverlay:not(.open)', { state: 'attached' });
  assert.ok(!(await page.isVisible('#focusOverlay')));
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
  assert.equal(await page.locator('.topic img').count(), 0);
  assert.match(await page.textContent('.topic h3'), /<img/);
  assert.match(await page.textContent('.topic-meta'), /Guest/);
  await page.click('[data-delete]');
  await page.waitForSelector('.empty');
  noErrors();
});

test('career checklist persists and downloads', async () => {
  await go('career.html');
  await page.check('#chk-oop');
  await page.check('#w1');
  assert.match(await page.textContent('#careerBadge'), /^2\//);
  await page.reload();
  assert.ok(await page.isChecked('#chk-oop'));
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#downloadChecklist')]);
  const text = fs.readFileSync(await dl.path(), 'utf8');
  assert.match(text, /\[x\] Object-oriented design/);
  assert.match(text, /\[ \] Testing/);
  noErrors();
});

test('notes: create, edit, search, delete, and add from a lesson', async () => {
  await go('notes.html');
  await page.click('#addNote');
  await page.waitForSelector('#noteEditor');
  await page.fill('#noteTitle', 'Big-O cheatsheet');
  await page.fill('#noteBody', 'binary search is O(log n)');
  await page.click('#noteEditor button[type="submit"]');
  await page.waitForSelector('.note-item:has-text("Big-O cheatsheet")');
  await page.fill('#noteSearch', 'zzz');
  assert.equal(await page.locator('.note-item').count(), 0);
  await page.fill('#noteSearch', 'log n');
  assert.equal(await page.locator('.note-item').count(), 1);
  await page.fill('#noteSearch', '');
  await page.click('#deleteNote');
  await page.waitForSelector('.empty');
  assert.equal(await page.locator('.note-item').count(), 0);

  await go('roadmap.html?m=databases');
  await page.click('#roadmap .node.sub >> nth=0');
  const title = await page.textContent('#drawerTitle');
  await page.click('[data-drawer="note"]');
  await page.waitForSelector('#noteEditor');
  assert.equal(await page.inputValue('#noteTitle'), title);
  noErrors();
});

test('auth: admin setup, register, validation, login, logout and per-user data', async () => {
  // Guest progress
  await go('roadmap.html?m=oop');
  await page.click('#roadmap .node.sub >> nth=0');
  await page.keyboard.press('d');
  await page.keyboard.press('Escape');

  // Built-in admin: admin / Password, forced to change it after login.
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
  // Reloading still forces the change.
  await page.reload();
  await page.waitForSelector('#pwModal.open');
  await page.fill('#pwCurrent', 'Password');
  await page.fill('#pwNew', 'Password');
  await page.fill('#pwConfirm', 'Password');
  await page.click('#pwSubmit');
  await page.waitForFunction(() => /different/.test(document.querySelector('#pwError').textContent));
  await page.fill('#pwNew', 'adminpass123');
  await page.fill('#pwConfirm', 'adminpass12');
  await page.click('#pwSubmit');
  await page.waitForFunction(() => /do not match/.test(document.querySelector('#pwError').textContent));
  await page.fill('#pwConfirm', 'adminpass123');
  await page.click('#pwSubmit');
  await page.waitForSelector('#pwModal:not(.open)', { state: 'attached' });
  await page.reload();
  await page.waitForSelector('.role-badge');
  await page.waitForTimeout(300);
  assert.ok(!(await page.isVisible('#pwModal')), 'no prompt after password changed');
  assert.equal(await page.locator('#roadmap .node.sub.done').count(), 0, 'admin starts with own progress');
  await page.click('#logoutBtn');
  // Old default password no longer works.
  await page.click('#loginBtn');
  await page.fill('#authUsername', 'admin');
  await page.fill('#authPassword', 'Password');
  await page.click('#authSubmit');
  await page.waitForFunction(() => /Incorrect/.test(document.querySelector('#authError').textContent));
  await page.click('#authClose');

  // Register validation
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
  assert.match(await page.textContent('.nav-user'), /sosa/);
  assert.equal(await page.isEnabled('#authSubmit'), true);

  // Member posts; passwords are never stored in plain text.
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
  assert.equal(await page.locator('[data-delete]').count(), 0, 'guest cannot delete member post');

  // Wrong password, then admin login can delete any post.
  await page.click('#loginBtn');
  await page.fill('#authUsername', 'sosa');
  await page.fill('#authPassword', 'wrongpass');
  await page.click('#authSubmit');
  await page.waitForFunction(() => document.querySelector('#authError').textContent.length > 0);
  assert.match(await page.textContent('#authError'), /Incorrect/);
  assert.equal(await page.isEnabled('#authSubmit'), true);
  await page.fill('#authUsername', 'admin');
  await page.fill('#authPassword', 'adminpass123');
  await page.click('#authSubmit');
  await page.waitForSelector('[data-delete]');

  // Guest progress is still there after logout.
  await page.click('#logoutBtn');
  await go('roadmap.html?m=oop');
  await page.waitForSelector('#roadmap .node');
  assert.equal(await page.locator('#roadmap .node.sub.done').count(), 1);
  noErrors();
});

test('mobile layout: menu toggles and there is no horizontal scroll', async () => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const h of ['index.html', 'roadmap.html', 'practice.html', 'career.html', 'notes.html']) {
    await go(h);
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `${h} overflows by ${overflow}px`);
  }
  await page.click('#menuToggle');
  assert.ok(await page.isVisible('#navLinks a[data-nav="practice"]'));
  await page.click('#navLinks a[data-nav="practice"]');
  await page.waitForSelector('#runChallenge');
  assert.ok(!(await page.isVisible('#navLinks a[data-nav="practice"]')));
  assert.match(page.url(), /practice\.html$/);
  noErrors();
});
