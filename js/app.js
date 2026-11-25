/* Study Desk — application logic (vanilla JS, hash routing, localStorage). */
(function () {
  'use strict';

  const MODULES = window.SD_MODULES || [];
  const byId = (id) => MODULES.find((m) => m.id === id);
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const CATEGORIES = ['All', 'Engineering', 'Logic', 'Data', 'Java', 'Web', 'Security', 'Team'];
  const STATUS_LABEL = { pending: 'Pending', learning: 'In progress', done: 'Done', skipped: 'Skipped' };

  const PAGE = document.body.dataset.page || 'home';

  /* ---------------- Shared page chrome (nav, drawer, modals) ---------------- */
  document.body.insertAdjacentHTML('afterbegin', `
<header class="topnav">
  <div class="container">
    <a class="logo" href="index.html"><span class="logo-mark" aria-hidden="true">sd</span>study desk</a>
    <nav class="nav-links" id="navLinks" aria-label="Main navigation">
      <a href="roadmap.html" data-nav="roadmap">Roadmaps</a>
      <a href="practice.html" data-nav="practice">Practice</a>
      <a href="interview.html" data-nav="interview">Interview prep</a>
      <a href="community.html" data-nav="community">Community</a>
      <a href="career.html" data-nav="career">Career</a>
      <a href="notes.html" data-nav="notes">Notes</a>
    </nav>
    <div class="nav-right" id="navRight"></div>
    <button class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">☰</button>
  </div>
</header>`);
  document.body.insertAdjacentHTML('beforeend', `
<footer class="footer">
  <div class="container">Study Desk keeps your progress, notes and discussions in this browser only. Accounts are local to this device.</div>
</footer>
<div class="drawer-backdrop" id="drawerBackdrop"></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" aria-hidden="true">
  <div class="drawer-top">
    <label class="sr-only" for="drawerStatus">Update status</label>
    <select id="drawerStatus">
      <option value="pending">Pending</option>
      <option value="learning">In progress</option>
      <option value="done">Done</option>
      <option value="skipped">Skip</option>
    </select>
    <span class="status-pill" id="drawerPill">Pending</span>
    <button class="x" id="drawerClose" aria-label="Close">×</button>
  </div>
  <div class="drawer-body" id="drawerBody"></div>
</aside>
<div class="modal-backdrop" id="authModal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
  <div class="modal">
    <button class="x" id="authClose" aria-label="Close">×</button>
    <h2 id="authTitle">Log in</h2>
    <p class="sub" id="authSub">Pick up where you left off.</p>
    <form id="authForm" novalidate>
      <label class="field"><span>Username</span><input class="input" id="authUsername" autocomplete="username" required maxlength="32"></label>
      <label class="field"><span>Password</span><input class="input" id="authPassword" type="password" autocomplete="current-password" required></label>
      <label class="field" id="authConfirmWrap" hidden><span>Confirm password</span><input class="input" id="authConfirm" type="password" autocomplete="new-password"></label>
      <div class="form-error" id="authError" role="alert"></div>
      <button type="submit" class="btn dark" id="authSubmit">Log in</button>
    </form>
    <div class="auth-switch" id="authSwitchText"></div>
    <div class="auth-note" id="authNote"></div>
  </div>
</div>
<div class="modal-backdrop" id="pwModal" role="dialog" aria-modal="true" aria-labelledby="pwTitle">
  <div class="modal">
    <button class="x" id="pwClose" aria-label="Close">×</button>
    <h2 id="pwTitle">Change your password</h2>
    <p class="sub" id="pwSub">Choose a new password for your account.</p>
    <form id="pwForm" novalidate>
      <label class="field"><span>Current password</span><input class="input" id="pwCurrent" type="password" autocomplete="current-password"></label>
      <label class="field"><span>New password</span><input class="input" id="pwNew" type="password" autocomplete="new-password"></label>
      <label class="field"><span>Confirm new password</span><input class="input" id="pwConfirm" type="password" autocomplete="new-password"></label>
      <div class="form-error" id="pwError" role="alert"></div>
      <button type="submit" class="btn dark" id="pwSubmit">Update password</button>
    </form>
  </div>
</div>
<div class="focus-overlay" id="focusOverlay" role="dialog" aria-modal="true" aria-label="Focus mode">
  <div class="kicker" style="color:#9b9ba6">Focus mode</div>
  <div class="timer" id="focusTimer">25:00</div>
  <p>One topic. No tabs. Press <kbd>Esc</kbd> to leave.</p>
  <div class="btn-row">
    <button class="btn yellow" id="focusStart">Start</button>
    <button class="btn" id="focusReset">Reset</button>
    <button class="btn" id="focusExit">Exit</button>
  </div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`);

  /* ---------------- Utilities ---------------- */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  // Escape text and turn `backticks` into inline code.
  function rich(value) {
    return esc(value).replace(/`([^`]+)`/g, '<code class="inline">$1</code>');
  }
  function hashStr(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
  function fmtDate(ts) {
    try { return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (e) { return ''; }
  }
  function fmtTime(sec) { return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ---------------- Storage ---------------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { toast('Could not save — browser storage is unavailable.'); return false; }
    },
    remove(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } },
  };
  // Per-user namespaced keys (guest when logged out).
  const userKey = (name) => 'sd:' + (Auth.current() ? Auth.current().username : 'guest') + ':' + name;

  /* ---------------- Auth (local, salted PBKDF2) ---------------- */
  const Auth = (function () {
    const USERS = 'sd:users';
    const SESSION = 'sd:session';
    const ADMIN = 'admin';
    const DEFAULT_ADMIN_PASSWORD = 'Password'; // must be changed on first login
    const users = () => store.get(USERS, []);
    const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

    async function hashPassword(password, salt) {
      if (!window.crypto || !crypto.subtle) throw new Error('Secure hashing needs https or localhost.');
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
      return hex(bits);
    }
    function newSalt() { const a = new Uint8Array(16); crypto.getRandomValues(a); return hex(a); }
    function validName(name) { return /^[a-zA-Z0-9_.-]{3,32}$/.test(name); }

    function current() {
      const name = store.get(SESSION, null);
      if (!name) return null;
      const u = users().find((x) => x.username === name);
      return u ? { username: u.username, role: u.role, createdAt: u.createdAt, mustChangePassword: !!u.mustChangePassword } : null;
    }
    const adminExists = () => users().some((u) => u.username === ADMIN);

    async function createUser(username, password, role, extra = {}, signIn = true) {
      const salt = newSalt();
      const passwordHash = await hashPassword(password, salt);
      const list = users();
      list.push({ username, role, salt, passwordHash, createdAt: Date.now(), ...extra });
      store.set(USERS, list);
      if (signIn) store.set(SESSION, username);
      return current();
    }

    // Seed the built-in admin account (admin / Password) the first time the site loads.
    let seeding = null;
    function ready() {
      if (!seeding) {
        seeding = adminExists() ? Promise.resolve()
          : createUser(ADMIN, DEFAULT_ADMIN_PASSWORD, 'admin', { mustChangePassword: true }, false).catch(() => {});
      }
      return seeding;
    }

    async function login(username, password) {
      username = username.trim();
      if (!username || !password) return { ok: false, message: 'Enter your username and password.' };
      await ready();
      const u = users().find((x) => x.username.toLowerCase() === username.toLowerCase());
      if (!u) return { ok: false, message: 'No account with that username.' };
      const h = await hashPassword(password, u.salt);
      if (h !== u.passwordHash) return { ok: false, message: 'Incorrect password.' };
      store.set(SESSION, u.username);
      return { ok: true, user: current() };
    }

    async function register(username, password, confirm) {
      username = username.trim();
      if (!validName(username)) return { ok: false, message: 'Usernames are 3–32 letters, numbers, dots, dashes or underscores.' };
      if (username.toLowerCase() === ADMIN) return { ok: false, message: '"admin" is reserved. Log in as admin to set it up.' };
      if (users().some((u) => u.username.toLowerCase() === username.toLowerCase())) return { ok: false, message: 'That username is taken.' };
      if (password.length < 8) return { ok: false, message: 'Password must be at least 8 characters.' };
      if (password !== confirm) return { ok: false, message: 'Passwords do not match.' };
      return { ok: true, user: await createUser(username, password, 'member') };
    }

    async function changePassword(currentPw, newPw, confirmPw) {
      const me = current();
      if (!me) return { ok: false, message: 'Log in first.' };
      const list = users();
      const u = list.find((x) => x.username === me.username);
      if (await hashPassword(currentPw, u.salt) !== u.passwordHash) return { ok: false, message: 'Current password is incorrect.' };
      if (newPw.length < 8) return { ok: false, message: 'New password must be at least 8 characters.' };
      if (newPw === currentPw) return { ok: false, message: 'Choose a password different from the current one.' };
      if (newPw !== confirmPw) return { ok: false, message: 'New passwords do not match.' };
      u.salt = newSalt();
      u.passwordHash = await hashPassword(newPw, u.salt);
      delete u.mustChangePassword;
      store.set(USERS, list);
      return { ok: true };
    }

    function logout() { store.remove(SESSION); }
    const isAdmin = () => { const u = current(); return !!u && u.role === 'admin'; };
    return { login, register, logout, current, isAdmin, adminExists, changePassword, ready };
  })();

  /* ---------------- Progress ---------------- */
  const Progress = {
    all() { return store.get(userKey('progress'), {}); },
    get(key) { return this.all()[key] || 'pending'; },
    set(key, status) {
      const p = this.all();
      if (status === 'pending') delete p[key]; else p[key] = status;
      store.set(userKey('progress'), p);
    },
    moduleStats(m) {
      const p = this.all();
      const total = m.lessons.length;
      let done = 0, learning = 0, skipped = 0;
      m.lessons.forEach((_, i) => {
        const s = p[m.id + ':' + i];
        if (s === 'done') done++; else if (s === 'learning') learning++; else if (s === 'skipped') skipped++;
      });
      return { total, done, learning, skipped, pct: total ? Math.round(((done + skipped) / total) * 100) : 0 };
    },
    overall(list = MODULES) {
      return list.reduce((acc, m) => {
        const s = this.moduleStats(m);
        acc.total += s.total; acc.done += s.done; acc.learning += s.learning; acc.skipped += s.skipped;
        return acc;
      }, { total: 0, done: 0, learning: 0, skipped: 0 });
    },
    reset(list) {
      const p = this.all();
      list.forEach((m) => m.lessons.forEach((_, i) => delete p[m.id + ':' + i]));
      store.set(userKey('progress'), p);
    },
  };

  /* ---------------- Notes ---------------- */
  function goNote(id) {
    const url = 'notes.html' + (id ? '?id=' + encodeURIComponent(id) : '');
    if (PAGE === 'notes') { history.pushState(null, '', url); renderNotes(id); }
    else location.href = url;
  }
  const Notes = {
    list() { return store.get(userKey('notes'), []); },
    save(list) { return store.set(userKey('notes'), list); },
    add(title, body) {
      const list = this.list();
      const note = { id: uid(), title: title || 'Untitled note', body: body || '', updatedAt: Date.now() };
      list.unshift(note);
      this.save(list);
      return note;
    },
  };

  /* ---------------- Static content ---------------- */
  const INTERVIEW_PROMPTS = [
    { q: 'How do interfaces help keep a service testable?', hint: 'Explain dependency boundaries, then give one example.' },
    { q: 'When would you choose a HashMap?', hint: 'State the lookup need and mention the ordering trade-off.' },
    { q: 'Where does an AI service need guardrails?', hint: 'Consider input handling, retrieved context and output checks.' },
    { q: 'Explain the difference between a process and a thread.', hint: 'Cover memory, scheduling and one concurrency risk.' },
    { q: 'How would you find a slow database query?', hint: 'Mention query logs, EXPLAIN and indexes.' },
    { q: 'What happens when you type a URL into the browser?', hint: 'DNS, TCP/TLS, HTTP request, rendering.' },
    { q: 'Why write the test before the code?', hint: 'Talk about red-green-refactor and design feedback.' },
    { q: 'What is the time complexity of binary search and why?', hint: 'Each step halves the remaining range.' },
    { q: 'How do you protect a form from CSRF?', hint: 'Tokens, SameSite cookies, and which requests need it.' },
    { q: 'Tell me about a bug you were proud to fix.', hint: 'Situation → how you isolated it → the fix → what you learned.' },
  ];

  const MUST_HAVE = [
    ['chk-oop', 'Object-oriented design and software design principles', 'oop'],
    ['chk-ds-algo', 'Data structures and algorithms: arrays, lists, trees, hash maps, sorting, searching', 'algorithms'],
    ['chk-lang', 'At least one modern language: Java, Python, JavaScript/TypeScript or C++', 'cloud-frameworks'],
    ['chk-sql', 'SQL and relational databases: queries, joins, indexes, normalization', 'databases'],
    ['chk-git', 'Version control with Git and GitHub: repos, commits and pull requests', null],
    ['chk-testing', 'Testing: unit tests, integration tests and TDD basics', 'testing'],
  ];
  const NICE_TO_HAVE = [
    ['chk-web', 'Modern web technologies: HTML/CSS, JavaScript, React or similar', 'web-patterns'],
    ['chk-api', 'REST APIs and web service integration', 'web-patterns'],
    ['chk-ai', 'AI-assisted development and model APIs', 'cloud-frameworks'],
    ['chk-ci', 'CI/CD basics and automated testing', 'testing'],
    ['chk-data', 'Data manipulation and analysis', 'data-analysis'],
  ];
  const WEEK_PLAN = [
    ['w1', 'Week 1–2', 'Finish Object-oriented design and Software engineering. Build a small class-based app with tests.'],
    ['w3', 'Week 3–4', 'Finish Algorithms and Databases. Build a database-backed app and add a REST API.'],
    ['w5', 'Week 5–6', 'Finish Web patterns and Spring Boot + Spring AI. Build a full web app with React + Spring Boot.'],
    ['w7', 'Week 7–8', 'Finish Web security and Testing. Write unit and integration tests for your project.'],
    ['w9', 'Week 9–10', 'Build your portfolio: 3 projects with README files, screenshots and a GitHub repo.'],
    ['w11', 'Week 11–12', 'Interview practice: use Interview prep to explain your code out loud. Apply to 10 roles.'],
  ];
  const JOB_LINKS = [
    ['https://www.linkedin.com/jobs/search/?keywords=Java%20developer%20intern', 'Java developer roles', 'LinkedIn'],
    ['https://www.indeed.com/jobs?q=Spring+Boot+Developer', 'Spring Boot roles', 'Indeed'],
    ['https://gradireland.com/jobs', 'Graduate and internship listings', 'gradireland'],
    ['https://wellfound.com/jobs', 'Startup engineering roles', 'Wellfound'],
  ];
  const DOC_LINKS = [
    ['https://dev.java/learn/', 'Learn Java', 'Dev.java'],
    ['https://docs.spring.io/spring-boot/index.html', 'Spring Boot reference', 'Spring'],
    ['https://docs.spring.io/spring-ai/reference/', 'Spring AI reference', 'Spring'],
    ['https://developer.mozilla.org/en-US/docs/Learn', 'Learn web development', 'MDN'],
    ['https://www.postgresql.org/docs/current/', 'PostgreSQL documentation', 'PostgreSQL'],
    ['https://owasp.org/www-project-top-ten/', 'OWASP Top 10', 'OWASP'],
  ];
  const MINI_PROJECTS = [
    { title: 'Todo list with classes', mod: 'web-patterns', stack: 'JavaScript', desc: 'Model tasks as objects, add, complete and filter them, then render the list.' },
    { title: 'Course catalogue API', mod: 'cloud-frameworks', stack: 'Java + Spring Boot', desc: 'Expose /api/courses with validation and an in-memory repository.' },
    { title: 'Grade book database', mod: 'databases', stack: 'SQL', desc: 'Design tables for students, courses and grades; write 5 queries with joins.' },
    { title: 'Searchable lesson list', mod: 'algorithms', stack: 'JavaScript + SQL', desc: 'Add a search box and a sort button, then compare linear and binary search.' },
  ];

  /* ---------------- Rendering helpers ---------------- */
  const app = $('#app');
  function setPage(html, { dark = false } = {}) {
    document.body.classList.toggle('dark-page', dark);
    app.innerHTML = html;
  }
  function linkRow([href, title, source]) {
    return `<a class="resource-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer"><span class="tag">${esc(source)}</span>${esc(title)}<span class="out">↗</span></a>`;
  }
  function pageHead({ crumbs = [], title, desc, actions = '', extra = '' }) {
    const c = crumbs.length ? `<div class="crumbs">${crumbs.map(([h, t]) => h ? `<a href="${h}">${esc(t)}</a>` : esc(t)).join(' · ')}</div>` : '';
    return `<div class="page-head">${c}<h1>${esc(title)}</h1>${desc ? `<p>${desc}</p>` : ''}${actions ? `<div class="head-actions">${actions}</div>` : ''}${extra}</div>`;
  }
  // Deterministic choice order so the right answer is not always first.
  function orderedChoices(m) {
    const n = m.quizChoices.length;
    const shift = hashStr(m.id) % n;
    return m.quizChoices.map((text, i) => ({ text, i })).map((_, k, arr) => arr[(k + shift) % n]);
  }
  function quizBlock(id, question, choices, correctIndex) {
    return `<div class="quiz" data-quiz="${esc(id)}" data-answer="${correctIndex}">
      <p style="color:var(--ink);font-weight:600;margin:0">${esc(question)}</p>
      <div class="quiz-options">${choices.map((c) => `<button type="button" class="quiz-option" data-choice="${c.i}">${esc(c.text)}</button>`).join('')}</div>
      <div class="feedback" aria-live="polite">Choose an answer to check your reasoning.</div></div>`;
  }
  function wireQuizzes(root, explanations = {}) {
    $$('.quiz', root).forEach((q) => {
      q.addEventListener('click', (e) => {
        const btn = e.target.closest('.quiz-option');
        if (!btn) return;
        const right = btn.dataset.choice === q.dataset.answer;
        $$('.quiz-option', q).forEach((b) => b.classList.remove('correct', 'wrong'));
        btn.classList.add(right ? 'correct' : 'wrong');
        const fb = $('.feedback', q);
        const exp = explanations[q.dataset.quiz];
        fb.className = 'feedback ' + (right ? 'good' : 'bad');
        fb.textContent = right ? 'Correct. ' + (exp ? exp.right : 'Nice reasoning.') : (exp ? exp.wrong : 'Not quite — try another option.');
      });
    });
  }

  /* ---------------- Home ---------------- */
  let homeFilter = 'All';
  function renderHome() {
    const ov = Progress.overall();
    const user = Auth.current();
    const started = MODULES.filter((m) => { const s = Progress.moduleStats(m); return s.done + s.learning + s.skipped > 0; });
    const tiles = MODULES.filter((m) => homeFilter === 'All' || m.cat === homeFilter).map(moduleTile).join('');
    setPage(`<section class="home"><div class="container">
      <div class="hero">
        <h1>Computer science,<br>one roadmap at a time</h1>
        <p>Study Desk turns <b>${MODULES.length} modules</b> and <b>${ov.total} lessons</b> into step-by-step roadmaps. Open a topic, learn it, mark it done, and practice until it sticks.</p>
        <div class="hero-cta">
          <a class="btn yellow" href="roadmap.html">Start the full path →</a>
          <a class="btn" href="practice.html">Practice lab</a>
          <button class="btn" type="button" data-action="focus">Focus mode</button>
        </div>
      </div>
      ${started.length ? `
      <div class="section-label"><span>Your progress${user ? ' · ' + esc(user.username) : ''}</span></div>
      <div class="stat-strip">
        <div class="stat"><b>${ov.done}</b><span>lessons done</span></div>
        <div class="stat"><b>${ov.learning}</b><span>in progress</span></div>
        <div class="stat"><b>${ov.skipped}</b><span>skipped</span></div>
        <div class="stat"><b>${ov.total ? Math.round(((ov.done + ov.skipped) / ov.total) * 100) : 0}%</b><span>of the full path</span></div>
      </div>
      <div class="tile-grid" style="margin-top:10px">${started.map(moduleTile).join('')}</div>` : ''}
      <div class="section-label"><span>Module roadmaps</span></div>
      <div class="chip-row" role="group" aria-label="Filter modules">${CATEGORIES.map((c) => `<button type="button" class="chip${c === homeFilter ? ' active' : ''}" data-filter="${c}">${c}</button>`).join('')}</div>
      <div class="tile-grid" id="moduleTiles">${tiles || '<p style="color:var(--night-mute)">No modules in this category.</p>'}</div>
      <div class="section-label"><span>Practice &amp; career</span></div>
      <div class="tile-grid">
        <a class="tile featured" href="roadmap.html"><span>Full computer science path<small>All ${MODULES.length} modules in suggested order</small></span><span class="tile-tag">Roadmap</span></a>
        <a class="tile" href="practice.html"><span>Practice lab<small>Quizzes, code challenges, mini projects</small></span><span class="tile-tag">Hands-on</span></a>
        <a class="tile" href="interview.html"><span>Interview prep<small>Prompts and a timed round</small></span><span class="tile-tag">Career</span></a>
        <a class="tile" href="career.html"><span>Career &amp; internships<small>Checklists, 12-week plan, job links</small></span><span class="tile-tag">Career</span></a>
        <a class="tile" href="community.html"><span>Community<small>Start a focused discussion</small></span><span class="tile-tag">Forum</span></a>
        <a class="tile" href="notes.html"><span>Notes<small>Save what you learn</small></span><span class="tile-tag">Personal</span></a>
      </div>
    </div></section>`, { dark: true });

    $$('.chip', app).forEach((b) => b.addEventListener('click', () => { homeFilter = b.dataset.filter; renderHome(); }));
  }
  function moduleTile(m) {
    const s = Progress.moduleStats(m);
    return `<a class="tile" href="roadmap.html?m=${esc(m.id)}" data-module="${esc(m.id)}"><span>${esc(m.title)}<small>${m.lessons.length} lessons${s.done ? ' · ' + s.done + ' done' : ''}</small></span><span class="tile-tag">${esc(m.cat)}</span><i class="tile-bar" style="width:${s.pct}%"></i></a>`;
  }

  /* ---------------- Roadmap ---------------- */
  let currentRoadmap = null; // { modules, sections, title }

  function nodeHtml({ key, label, kind }) {
    const st = key ? Progress.get(key) : 'pending';
    const cls = ['node', kind, st !== 'pending' ? st : ''].filter(Boolean).join(' ');
    return `<button type="button" class="${cls}" data-node="${esc(key || '')}" data-kind="${kind}">${esc(label)}<span class="node-check" aria-hidden="true">✓</span></button>`;
  }

  function roadmapHtml(title, sections) {
    return `<div class="roadmap" id="roadmap">
      <svg class="wires" aria-hidden="true"></svg>
      <h2 class="rm-title">${esc(title)}</h2>
      ${sections.map((sec, si) => {
        const left = [], right = [];
        sec.children.forEach((c, i) => (i % 2 === 0 ? left : right).push(c));
        return `<div class="rm-section" data-section="${si}">
          <div class="rm-side left">${left.map((c) => nodeHtml(c)).join('')}</div>
          <div class="rm-center">${nodeHtml(sec.main)}</div>
          <div class="rm-side right">${right.map((c) => nodeHtml(c)).join('')}</div>
        </div>`;
      }).join('')}
      <div class="rm-end"><span class="btn yellow" style="pointer-events:none">Keep building →</span></div>
      <div class="rm-legend">
        <span><i style="background:var(--node)"></i>Topic</span>
        <span><i style="background:var(--node-sub)"></i>Lesson</span>
        <span><i style="background:var(--node-learn)"></i>In progress</span>
        <span><i style="background:var(--node-done)"></i>Done</span>
        <span><i style="background:var(--node-skip)"></i>Skipped</span>
      </div>
    </div>`;
  }

  function drawWires() {
    const rm = $('#roadmap');
    if (!rm) return;
    const svg = $('svg.wires', rm);
    const box = rm.getBoundingClientRect();
    const rel = (el) => { const r = el.getBoundingClientRect(); return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, cx: r.left - box.left + r.width / 2, cy: r.top - box.top + r.height / 2 }; };
    const mobile = window.matchMedia('(max-width: 720px)').matches;
    const parts = [];
    const solid = (d) => parts.push(`<path d="${d}" fill="none" stroke="#2b78e4" stroke-width="3.5" stroke-linecap="round"/>`);
    const dashed = (d) => parts.push(`<path d="${d}" fill="none" stroke="#2b78e4" stroke-width="2.5" stroke-dasharray="0.8 7" stroke-linecap="round"/>`);
    const title = rel($('.rm-title', rm));
    const mains = $$('.rm-center .node', rm).map(rel);
    const end = rel($('.rm-end .btn', rm));
    if (!mains.length) { svg.innerHTML = ''; return; }

    if (mobile) {
      const x = 10;
      solid(`M${x} ${mains[0].cy} L${x} ${end.cy}`);
      $$('.node', rm).forEach((n) => { const p = rel(n); dashed(`M${x} ${p.cy} L${p.l} ${p.cy}`); });
      dashed(`M${x} ${end.cy} L${end.l} ${end.cy}`);
    } else {
      const cx = mains[0].cx;
      solid(`M${cx} ${title.b + 6} L${cx} ${mains[0].t}`);
      for (let i = 0; i < mains.length - 1; i++) solid(`M${cx} ${mains[i].b} L${cx} ${mains[i + 1].t}`);
      solid(`M${cx} ${mains[mains.length - 1].b} L${cx} ${end.t}`);
      $$('.rm-section', rm).forEach((sec) => {
        const m = rel($('.rm-center .node', sec));
        $$('.rm-side.left .node', sec).forEach((n) => { const p = rel(n); dashed(`M${m.l} ${m.cy} C${m.l - 30} ${m.cy}, ${p.r + 30} ${p.cy}, ${p.r} ${p.cy}`); });
        $$('.rm-side.right .node', sec).forEach((n) => { const p = rel(n); dashed(`M${m.r} ${m.cy} C${m.r + 30} ${m.cy}, ${p.l - 30} ${p.cy}, ${p.l} ${p.cy}`); });
      });
    }
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = parts.join('');
  }

  function progressLine(list) {
    const o = Progress.overall(list);
    const pct = o.total ? Math.round(((o.done + o.skipped) / o.total) * 100) : 0;
    return `<div class="progress-line" id="progressLine">
      <span class="progress-badge">${pct}% DONE</span>
      <span class="progress-text">${o.done} of ${o.total} done · ${o.learning} in progress · ${o.skipped} skipped</span>
      <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Roadmap progress"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
  }

  function renderFullRoadmap() {
    const sections = MODULES.map((m) => ({
      main: { key: 'module:' + m.id, label: m.title, kind: 'main' },
      children: m.lessons.map((l, i) => ({ key: m.id + ':' + i, label: l.title, kind: 'sub' })),
    }));
    currentRoadmap = { modules: MODULES, title: 'Full computer science path' };
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Roadmaps']], title: 'Full computer science path',
        desc: 'Every module in a suggested order: foundations first, then data, Java and the web. Click a topic to read it, practice it and update its status.',
        actions: `<button class="btn dark small" type="button" data-action="resume">Resume where I left off</button><button class="btn small" type="button" data-action="reset-progress">Reset progress</button>`, extra: progressLine(MODULES) })}
      <div class="roadmap-wrap">${roadmapHtml('Computer Science', sections)}</div>
    </div></div>`);
    afterRoadmapRender();
  }

  function renderModuleRoadmap(id) {
    const m = byId(id);
    if (!m) return renderNotFound();
    const sections = [
      { main: { key: 'module:' + m.id, label: m.title, kind: 'main' },
        children: m.lessons.map((l, i) => ({ key: m.id + ':' + i, label: l.title, kind: 'sub' })) },
      { main: { key: 'practice:' + m.id, label: 'Check yourself', kind: 'main' },
        children: [
          { key: 'extra:' + m.id + ':example', label: 'Real-world example', kind: 'sub' },
          { key: 'extra:' + m.id + ':quiz', label: 'Quick quiz', kind: 'sub' },
          { key: 'extra:' + m.id + ':exercise', label: 'Exercise', kind: 'sub' },
          ...(m.sourceUrl ? [{ key: 'extra:' + m.id + ':docs', label: 'Official docs', kind: 'sub' }] : []),
        ] },
    ];
    const idx = MODULES.indexOf(m);
    const prev = MODULES[idx - 1], next = MODULES[idx + 1];
    currentRoadmap = { modules: [m], title: m.title };
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], ['roadmap.html', 'Roadmaps'], [null, m.code]], title: m.title + ' roadmap',
        desc: esc(m.desc) + (m.outcome ? `<br><b>By the end:</b> ${esc(m.outcome)}` : ''),
        actions: `<button class="btn dark small" type="button" data-action="resume">Resume</button>${m.sourceUrl ? `<a class="btn small" href="${esc(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(m.sourceLabel || 'Docs')} ↗</a>` : ''}<button class="btn small" type="button" data-action="reset-progress">Reset progress</button>`, extra: progressLine([m]) })}
      <div class="roadmap-wrap">${roadmapHtml(m.title, sections)}</div>
      <div class="btn-row" style="margin-top:14px;justify-content:space-between">
        ${prev ? `<a class="btn" href="roadmap.html?m=${prev.id}">← ${esc(prev.title)}</a>` : '<span></span>'}
        ${next ? `<a class="btn" href="roadmap.html?m=${next.id}">${esc(next.title)} →</a>` : ''}
      </div>
    </div></div>`);
    afterRoadmapRender();
  }

  function afterRoadmapRender() {
    requestAnimationFrame(drawWires);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawWires);
    $('#roadmap').addEventListener('click', (e) => {
      const n = e.target.closest('.node');
      if (n) openDrawer(n.dataset.node);
    });
  }

  function refreshRoadmapState() {
    $$('#roadmap .node').forEach((n) => {
      const st = Progress.get(n.dataset.node);
      n.classList.remove('done', 'learning', 'skipped');
      if (st !== 'pending') n.classList.add(st);
    });
    const pl = $('#progressLine');
    if (pl && currentRoadmap) pl.outerHTML = progressLine(currentRoadmap.modules);
  }

  /* ---------------- Drawer ---------------- */
  let drawerKey = null;
  let lastFocus = null;
  function lessonFromKey(key) {
    const [mid, idx] = key.split(':');
    const m = byId(mid);
    if (!m || !/^\d+$/.test(idx || '')) return null;
    return { m, i: Number(idx), l: m.lessons[Number(idx)] };
  }

  function openDrawer(key) {
    if (!key) return;
    const body = $('#drawerBody');
    const statusSel = $('#drawerStatus');
    const trackable = !!lessonFromKey(key);
    let html = '';

    if (trackable) {
      const { m, i, l } = lessonFromKey(key);
      html = `<div class="kicker">${esc(m.title)} · Lesson ${String(i + 1).padStart(2, '0')}</div>
        <h2 id="drawerTitle">${esc(l.title)}</h2>
        <p>${rich(l.objective)}</p>
        ${l.example ? `<h4>Example</h4><p>${rich(l.example)}</p>` : ''}
        ${l.code ? `<pre class="code"><code>${esc(l.code)}</code></pre>` : ''}
        ${l.practice ? `<h4>Try it</h4><p>${rich(l.practice)}</p>` : ''}
        ${l.check ? `<h4>Check your understanding</h4><details class="reveal"><summary>${esc(l.check)}</summary><p style="margin:0">${rich(l.answer)}</p></details>` : ''}
        <h4>Free resources</h4>
        <div class="link-list">${m.sourceUrl ? linkRow([m.sourceUrl, m.sourceLabel || 'Official documentation', 'Docs']) : ''}
          <a class="resource-link" href="roadmap.html?m=${esc(m.id)}" data-close><span class="tag" style="background:#fef9c3;color:#713f12">Roadmap</span>${esc(m.title)} roadmap<span class="out">→</span></a></div>
        <div class="btn-row" style="margin-top:18px">
          <button class="btn dark small" type="button" data-drawer="done-next">Mark done &amp; next →</button>
          <button class="btn small" type="button" data-drawer="note">Add to notes</button>
        </div>`;
    } else {
      const [kind, mid, extra] = key.split(':');
      const m = byId(mid);
      if (!m) return;
      if (kind === 'module') {
        const s = Progress.moduleStats(m);
        html = `<div class="kicker">${esc(m.code)}</div><h2 id="drawerTitle">${esc(m.title)}</h2><p>${esc(m.desc)}</p>
          ${m.outcome ? `<h4>By the end</h4><p>${esc(m.outcome)}</p>` : ''}
          <h4>Lessons · ${s.done} of ${s.total} done</h4>
          <div class="link-list">${m.lessons.map((l, i) => `<button type="button" class="resource-link" style="background:none;text-align:left" data-open="${m.id}:${i}"><span class="status-pill ${Progress.get(m.id + ':' + i)}">${STATUS_LABEL[Progress.get(m.id + ':' + i)]}</span>${esc(l.title)}<span class="out">→</span></button>`).join('')}</div>
          <div class="btn-row" style="margin-top:18px"><a class="btn dark small" href="roadmap.html?m=${esc(m.id)}" data-close>Open module roadmap →</a></div>`;
      } else if (kind === 'practice') {
        html = `<div class="kicker">${esc(m.title)}</div><h2 id="drawerTitle">Check yourself</h2><p>Use the example, quiz and exercise to test what you learned in this module.</p>`;
      } else if (extra === 'example') {
        html = `<div class="kicker">${esc(m.title)}</div><h2 id="drawerTitle">Real-world example</h2><p>${esc(m.example)}</p>`;
      } else if (extra === 'exercise') {
        html = `<div class="kicker">${esc(m.title)}</div><h2 id="drawerTitle">Exercise</h2><p>${esc(m.exercise)}</p>
          <div class="btn-row"><button class="btn small" type="button" data-drawer="note-exercise">Start a note for this exercise</button></div>`;
      } else if (extra === 'quiz') {
        html = `<div class="kicker">${esc(m.title)}</div><h2 id="drawerTitle">Quick quiz</h2>${quizBlock('mod-' + m.id, m.quiz, orderedChoices(m), m.answer)}`;
      } else if (extra === 'docs') {
        html = `<div class="kicker">${esc(m.title)}</div><h2 id="drawerTitle">Official docs</h2><p>Read the primary source alongside the lessons.</p><div class="link-list">${linkRow([m.sourceUrl, m.sourceLabel || 'Documentation', 'Docs'])}</div>`;
      }
    }

    drawerKey = key;
    body.innerHTML = html + (trackable ? `<div class="drawer-hint">Shortcuts: <kbd>D</kbd> done · <kbd>L</kbd> in progress · <kbd>S</kbd> skip · <kbd>R</kbd> reset · <kbd>Esc</kbd> close</div>` : '');
    statusSel.disabled = !trackable;
    statusSel.parentElement.querySelector('#drawerPill').hidden = !trackable;
    statusSel.hidden = !trackable;
    paintDrawerStatus();
    wireQuizzes(body, { ['mod-' + (key.split(':')[1])]: { right: 'That is the key idea of this module.', wrong: 'Not quite. Re-read the lessons and try again.' } });

    lastFocus = document.activeElement;
    $('#drawer').classList.add('open');
    $('#drawer').setAttribute('aria-hidden', 'false');
    $('#drawerBackdrop').classList.add('open');
    body.scrollTop = 0;
    $('#drawerClose').focus();
  }

  function paintDrawerStatus() {
    if (!drawerKey) return;
    const st = Progress.get(drawerKey);
    $('#drawerStatus').value = st;
    const pill = $('#drawerPill');
    pill.className = 'status-pill ' + st;
    pill.textContent = STATUS_LABEL[st];
  }

  function setDrawerStatus(st) {
    if (!drawerKey || !lessonFromKey(drawerKey)) return;
    Progress.set(drawerKey, st);
    paintDrawerStatus();
    refreshRoadmapState();
    toast('Marked as ' + STATUS_LABEL[st].toLowerCase() + '.');
  }

  function closeDrawer() {
    if (!$('#drawer').classList.contains('open')) return;
    $('#drawer').classList.remove('open');
    $('#drawer').setAttribute('aria-hidden', 'true');
    $('#drawerBackdrop').classList.remove('open');
    drawerKey = null;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function nextLessonKey(key) {
    const { m, i } = lessonFromKey(key);
    if (i + 1 < m.lessons.length) return m.id + ':' + (i + 1);
    const list = currentRoadmap ? currentRoadmap.modules : MODULES;
    const mi = list.indexOf(m);
    const nm = list[mi + 1];
    return nm ? nm.id + ':0' : null;
  }

  function firstUnfinished(list) {
    for (const m of list) for (let i = 0; i < m.lessons.length; i++) {
      const st = Progress.get(m.id + ':' + i);
      if (st !== 'done' && st !== 'skipped') return m.id + ':' + i;
    }
    return null;
  }

  $('#drawerStatus').addEventListener('change', (e) => setDrawerStatus(e.target.value));
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#drawerBackdrop').addEventListener('click', closeDrawer);
  $('#drawerBody').addEventListener('click', (e) => {
    const t = e.target.closest('[data-drawer],[data-open],[data-close]');
    if (!t) return;
    if (t.dataset.open) return openDrawer(t.dataset.open);
    if (t.hasAttribute('data-close')) return closeDrawer();
    const act = t.dataset.drawer;
    if (act === 'done-next') {
      const key = drawerKey;
      setDrawerStatus('done');
      const nk = nextLessonKey(key);
      if (nk) openDrawer(nk); else { closeDrawer(); toast('Roadmap complete — nice work!'); }
    } else if (act === 'note') {
      const { m, l } = lessonFromKey(drawerKey);
      const note = Notes.add(l.title, `${m.title} — ${l.title}\n\nObjective: ${l.objective}\n\nMy notes:\n`);
      closeDrawer();
      goNote(note.id);
      toast('Note created.');
    } else if (act === 'note-exercise') {
      const m = byId(drawerKey.split(':')[1]);
      const note = Notes.add(m.title + ' — exercise', `Exercise: ${m.exercise}\n\nMy approach:\n`);
      closeDrawer();
      goNote(note.id);
    }
  });

  /* ---------------- Practice lab ---------------- */
  const CHALLENGE_START = `class Course {
  constructor(name) {
    this.name = name;
    this.lessons = [];
  }
  addLesson(title) {
    this.lessons.push(title);
  }
  lessonOrder() {
    return this.lessons.map(l => l.title); // bug: lessons are strings
  }
}`;

  function renderPractice() {
    const draft = store.get(userKey('challenge01'), CHALLENGE_START);
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Practice']], title: 'Practice lab',
        desc: 'Short checks and coding challenges tied to the roadmaps. Learn by doing — pause and come back any time.',
        actions: '<button class="btn small" type="button" data-action="focus">Focus mode</button>' })}
      <div class="grid-2">
        <div class="card"><div class="kicker">Java · Object-oriented programming</div>
          <h2>Give each class one job</h2>
          <p>In a checkout system, a <code class="inline">Cart</code> stores items and calculates a subtotal. A <code class="inline">TaxPolicy</code> applies the local tax rule.</p>
          ${quizBlock('oop-tax', 'Which class should change when the tax rate changes?', [{ text: 'Cart', i: 0 }, { text: 'TaxPolicy', i: 1 }, { text: 'Both of them', i: 2 }], 1)}
        </div>
        <div class="card"><div class="kicker">Quick check · Algorithms</div>
          <h2>Halve the range</h2>
          <p>For a sorted array, one search method repeatedly halves the remaining range.</p>
          ${quizBlock('bsearch', 'Which search method is it?', [{ text: 'Depth-first search', i: 0 }, { text: 'Binary search', i: 1 }, { text: 'Linear search', i: 2 }], 1)}
        </div>
      </div>

      <div class="card" style="margin-top:14px"><div class="kicker">Challenge 01 · OOP · runs in your browser</div>
        <h2>Fix the Course class</h2>
        <p>The tests add two lessons and expect <code class="inline">lessonOrder()</code> to return <code class="inline">["Variables", "Flow"]</code>. Right now it returns <code class="inline">[undefined, undefined]</code>. Fix the class, then run the tests.</p>
        <label class="sr-only" for="challengeCode">Challenge code</label>
        <textarea class="textarea" id="challengeCode" spellcheck="false" style="font-family:var(--mono);font-size:13px;min-height:240px">${esc(draft)}</textarea>
        <div class="btn-row" style="margin-top:10px">
          <button class="btn dark" type="button" id="runChallenge">Run tests</button>
          <button class="btn" type="button" id="resetChallenge">Reset code</button>
        </div>
        <pre class="code" id="challengeOutput" aria-live="polite" style="min-height:60px">Press “Run tests” to check your code.</pre>
      </div>

      <div class="h-section">Mini projects <span>Build something small for your portfolio</span></div>
      <div class="grid-2">${MINI_PROJECTS.map((p) => `<div class="card"><div class="kicker">${esc(p.stack)}</div><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><a class="btn small" href="roadmap.html?m=${p.mod}">Open ${esc(byId(p.mod).title)} roadmap →</a></div>`).join('')}</div>

      <div class="h-section">Assessment practice <span>Interview-style design prompt</span></div>
      <div class="card"><div class="kicker">Java + AI · System design</div><h3>Design a document question-answering service</h3>
        <p>Sketch the request flow from uploaded document to answer. Include chunking, retrieval, the model call, and one way to handle a failed dependency.</p>
        <a class="btn small" href="interview.html">Open interview prep →</a></div>
    </div></div>`);

    wireQuizzes(app, {
      'oop-tax': { right: 'Tax rules live in TaxPolicy, so a rate change touches only that class.', wrong: 'Think about which class owns the tax rule. Cart should not need to change.' },
      bsearch: { right: 'Binary search halves the range each step, so it runs in O(log n).', wrong: 'That one does not use the sorted order. Which method halves the range?' },
    });
    const code = $('#challengeCode');
    code.addEventListener('input', () => store.set(userKey('challenge01'), code.value));
    code.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); const s = code.selectionStart; code.setRangeText('  ', s, code.selectionEnd, 'end'); }
    });
    $('#resetChallenge').addEventListener('click', () => { code.value = CHALLENGE_START; store.set(userKey('challenge01'), CHALLENGE_START); $('#challengeOutput').textContent = 'Code reset.'; });
    $('#runChallenge').addEventListener('click', () => runChallenge(code.value));
  }

  // Run user code in a Web Worker with a time limit so loops cannot freeze the page.
  function runChallenge(source) {
    const out = $('#challengeOutput');
    const btn = $('#runChallenge');
    out.textContent = 'Running…';
    btn.disabled = true;
    const workerSrc = `self.onmessage = function (e) {
      const results = [];
      const check = (name, fn) => { try { const r = fn(); results.push({ name, pass: r === true, detail: r === true ? '' : String(r) }); } catch (err) { results.push({ name, pass: false, detail: err.message }); } };
      let Course;
      try { Course = new Function(e.data + '\\n;return typeof Course !== "undefined" ? Course : undefined;')(); }
      catch (err) { self.postMessage({ error: 'Syntax error: ' + err.message }); return; }
      if (typeof Course !== 'function') { self.postMessage({ error: 'Define a class named Course.' }); return; }
      check('new Course("CS") stores its name', () => new Course('CS').name === 'CS' || 'name is ' + JSON.stringify(new Course('CS').name));
      check('lessonOrder() is empty for a new course', () => { const o = new Course('CS').lessonOrder(); return (Array.isArray(o) && o.length === 0) || 'got ' + JSON.stringify(o); });
      check('lessonOrder() returns titles in order', () => { const c = new Course('CS'); c.addLesson('Variables'); c.addLesson('Flow'); const o = c.lessonOrder(); return JSON.stringify(o) === '["Variables","Flow"]' || 'got ' + JSON.stringify(o); });
      check('lessonOrder() returns a copy', () => { const c = new Course('CS'); c.addLesson('A'); c.lessonOrder().push('B'); const o = c.lessonOrder(); return JSON.stringify(o) === '["A"]' || 'changing the result changed the course: ' + JSON.stringify(o); });
      self.postMessage({ results });
    };`;
    let worker;
    try { worker = new Worker(URL.createObjectURL(new Blob([workerSrc], { type: 'text/javascript' }))); }
    catch (e) { out.textContent = 'This browser blocked the code runner: ' + e.message; btn.disabled = false; return; }
    const timer = setTimeout(() => { worker.terminate(); out.textContent = '✗ Timed out after 2 seconds — check for an infinite loop.'; btn.disabled = false; }, 2000);
    worker.onmessage = (e) => {
      clearTimeout(timer); worker.terminate(); btn.disabled = false;
      if (e.data.error) { out.textContent = '✗ ' + e.data.error; return; }
      const r = e.data.results;
      const passed = r.filter((x) => x.pass).length;
      out.textContent = r.map((x) => (x.pass ? '✓ ' : '✗ ') + x.name + (x.detail ? '  — ' + x.detail : '')).join('\n') + `\n\n${passed}/${r.length} tests passed` + (passed === r.length ? ' — challenge complete!' : '');
      if (passed === r.length) { store.set(userKey('challenge01-done'), true); toast('Challenge 01 complete!'); }
    };
    worker.onerror = (e) => { clearTimeout(timer); worker.terminate(); btn.disabled = false; out.textContent = '✗ ' + (e.message || 'Error running code'); e.preventDefault(); };
    worker.postMessage(source);
  }

  /* ---------------- Interview prep ---------------- */
  let promptIndex = -1;
  const interviewTimer = { total: 900, left: 900, id: null };
  function renderInterview() {
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Interview prep']], title: 'Interview prep',
        desc: 'Practice explaining your choices out loud, then test yourself under a little time pressure.',
        actions: '<a class="btn small" href="practice.html">Coding challenges →</a>' })}
      <div class="grid-2">
        <div class="card"><div class="kicker">Concept prompts</div><h2>Talk through the trade-off</h2>
          <p>Reveal a prompt and explain it aloud or in your notes. Aim for a clear, specific two-minute answer.</p>
          <div class="prompt-card" id="promptCard"><b>Press “Show a prompt” to begin.</b><span>${INTERVIEW_PROMPTS.length} prompts in the deck.</span></div>
          <div class="btn-row"><button class="btn dark small" type="button" id="showPrompt">Show a prompt</button><button class="btn small" type="button" id="savePrompt" disabled>Answer in notes</button></div>
        </div>
        <div class="card"><div class="kicker">Timed practice</div><h2>One focused round</h2>
          <p>Solve a problem and narrate your approach before the timer runs out.</p>
          <div class="timer" id="ivTimer" aria-live="off">${fmtTime(interviewTimer.left)}</div>
          <div class="btn-row"><button class="btn dark small" type="button" id="ivStart">${interviewTimer.id ? 'Pause' : interviewTimer.left < interviewTimer.total ? 'Resume' : 'Start 15 min'}</button><button class="btn small" type="button" id="ivReset">Reset</button></div>
          <h4 style="margin:18px 0 4px;font-size:14px">Assessment format</h4>
          <p style="margin:0">Prompt → clarify → outline → implement → test edge cases.</p>
        </div>
      </div>
      <div class="h-section">Study the topics interviewers ask about</div>
      <div class="link-list">${['algorithms', 'oop', 'databases', 'security'].map((id) => `<a class="resource-link" href="roadmap.html?m=${id}"><span class="tag" style="background:#fef9c3;color:#713f12">Roadmap</span>${esc(byId(id).title)}<span class="out">→</span></a>`).join('')}</div>
    </div></div>`);

    $('#showPrompt').addEventListener('click', () => {
      let n;
      do { n = Math.floor(Math.random() * INTERVIEW_PROMPTS.length); } while (INTERVIEW_PROMPTS.length > 1 && n === promptIndex);
      promptIndex = n;
      const p = INTERVIEW_PROMPTS[n];
      $('#promptCard').innerHTML = `<b>${esc(p.q)}</b><span>${esc(p.hint)}</span>`;
      $('#showPrompt').textContent = 'Next prompt';
      $('#savePrompt').disabled = false;
    });
    $('#savePrompt').addEventListener('click', () => {
      const p = INTERVIEW_PROMPTS[promptIndex];
      const note = Notes.add('Interview: ' + p.q, `Prompt: ${p.q}\nHint: ${p.hint}\n\nMy answer:\n`);
      goNote(note.id);
    });
    $('#ivStart').addEventListener('click', toggleInterviewTimer);
    $('#ivReset').addEventListener('click', () => {
      clearInterval(interviewTimer.id); interviewTimer.id = null; interviewTimer.left = interviewTimer.total; paintInterviewTimer();
    });
  }
  function paintInterviewTimer() {
    const t = $('#ivTimer'), b = $('#ivStart');
    if (t) t.textContent = fmtTime(interviewTimer.left);
    if (b) b.textContent = interviewTimer.id ? 'Pause' : interviewTimer.left === interviewTimer.total ? 'Start 15 min' : interviewTimer.left === 0 ? 'Start again' : 'Resume';
  }
  function toggleInterviewTimer() {
    if (interviewTimer.id) { clearInterval(interviewTimer.id); interviewTimer.id = null; paintInterviewTimer(); return; }
    if (interviewTimer.left === 0) interviewTimer.left = interviewTimer.total;
    interviewTimer.id = setInterval(() => {
      interviewTimer.left = Math.max(0, interviewTimer.left - 1);
      if (interviewTimer.left === 0) { clearInterval(interviewTimer.id); interviewTimer.id = null; toast('Practice round complete.'); }
      paintInterviewTimer();
    }, 1000);
    paintInterviewTimer();
  }

  /* ---------------- Community ---------------- */
  const TOPICS = 'sd:topics';
  function renderCommunity() {
    const user = Auth.current();
    const topics = store.get(TOPICS, []);
    const me = user ? user.username : 'Guest';
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Community']], title: 'Community',
        desc: 'Start a focused discussion about a topic or exercise. Discussions are saved in this browser and shared between accounts on this device.',
        actions: '<button class="btn dark small" type="button" id="newTopic">Start a discussion</button>' })}
      <form class="card" id="topicForm" hidden style="margin-bottom:14px">
        <div class="kicker">New discussion · posting as ${esc(me)}</div>
        <label class="field"><span>Title</span><input class="input" id="topicTitle" maxlength="90" placeholder="What are you working through?"></label>
        <label class="field"><span>Details</span><textarea class="textarea" id="topicBody" maxlength="2000" placeholder="Add context or a question…"></textarea></label>
        <label class="field"><span>Module (optional)</span><select class="input" id="topicModule"><option value="">General</option>${MODULES.map((m) => `<option value="${m.id}">${esc(m.title)}</option>`).join('')}</select></label>
        <div class="form-error" id="topicError"></div>
        <div class="btn-row"><button class="btn dark small" type="submit">Post</button><button class="btn ghost small" type="button" id="cancelTopic">Cancel</button></div>
      </form>
      <div id="topicList">${topics.length ? topics.map((t) => {
        const canDelete = Auth.isAdmin() || t.author === me;
        const mod = t.module && byId(t.module);
        return `<article class="topic" data-id="${esc(t.id)}"><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p>
          <div class="topic-meta"><span class="avatar" style="width:20px;height:20px;font-size:10px;background:#000;color:#fff">${esc(t.author[0].toUpperCase())}</span>${esc(t.author)} · ${fmtDate(t.createdAt)}${mod ? ` · <a href="roadmap.html?m=${mod.id}">${esc(mod.title)}</a>` : ''}
          ${canDelete ? `<button class="btn ghost small danger" type="button" data-delete="${esc(t.id)}">Delete</button>` : ''}</div></article>`;
      }).join('') : `<div class="empty"><b>Make the first thread yours.</b>Ask about a concept, share a debugging clue or compare approaches to an exercise.<div style="margin-top:12px"><button class="btn small" type="button" id="emptyNewTopic">Start a discussion</button></div></div>`}</div>
    </div></div>`);

    const form = $('#topicForm');
    const open = () => { form.hidden = false; $('#topicTitle').focus(); };
    $('#newTopic').addEventListener('click', open);
    const en = $('#emptyNewTopic'); if (en) en.addEventListener('click', open);
    $('#cancelTopic').addEventListener('click', () => { form.hidden = true; form.reset(); $('#topicError').textContent = ''; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = $('#topicTitle').value.trim(), body = $('#topicBody').value.trim();
      if (!title || !body) { $('#topicError').textContent = 'Add a title and a little context.'; return; }
      const list = store.get(TOPICS, []);
      list.unshift({ id: uid(), title, body, module: $('#topicModule').value, author: me, createdAt: Date.now() });
      store.set(TOPICS, list);
      renderCommunity();
      toast('Discussion posted.');
    });
    $('#topicList').addEventListener('click', (e) => {
      const b = e.target.closest('[data-delete]');
      if (!b || !confirm('Delete this discussion?')) return;
      store.set(TOPICS, store.get(TOPICS, []).filter((t) => t.id !== b.dataset.delete));
      renderCommunity();
      toast('Discussion deleted.');
    });
  }

  /* ---------------- Career ---------------- */
  function renderCareer() {
    const checks = store.get(userKey('career'), {});
    const row = ([id, text, mod]) => `<div class="check-row"><input type="checkbox" id="${id}" data-check="${id}"${checks[id] ? ' checked' : ''}><label for="${id}">${esc(text)}${mod ? ` — <a href="roadmap.html?m=${mod}">${esc(byId(mod).title)}</a>` : ''}</label></div>`;
    const weekRow = ([id, when, text]) => `<div class="check-row"><input type="checkbox" id="${id}" data-check="${id}"${checks[id] ? ' checked' : ''}><label for="${id}"><b style="color:var(--ink)">${esc(when)}:</b> ${esc(text)}</label></div>`;
    const all = [...MUST_HAVE, ...NICE_TO_HAVE, ...WEEK_PLAN];
    const doneCount = all.filter(([id]) => checks[id]).length;
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Career']], title: 'Career & internships',
        desc: 'What software internship employers ask for, a 12-week plan to get there, and where to search.',
        actions: '<button class="btn dark small" type="button" id="downloadChecklist">Download checklist</button>' })}
      <div class="progress-line" style="margin:0 0 14px"><span class="progress-badge" id="careerBadge">${doneCount}/${all.length}</span><span class="progress-text">checklist items complete</span></div>
      <div class="grid-2">
        <div class="card"><div class="kicker">Must-have</div><h2>Core technical requirements</h2>${MUST_HAVE.map(row).join('')}</div>
        <div class="card"><div class="kicker">Nice-to-have</div><h2>Preferred qualifications</h2>${NICE_TO_HAVE.map(row).join('')}
          <p style="margin-top:12px;font-size:14px">Pick a module, build a small project around it, and put it in your portfolio. Employers want to see that you <b>built things</b>, not just studied them.</p></div>
      </div>
      <div class="h-section">Your 12-week internship prep plan</div>
      <div class="card">${WEEK_PLAN.map(weekRow).join('')}</div>
      <div class="grid-2" style="margin-top:14px">
        <div><div class="h-section" style="margin-top:0">Job search</div><div class="link-list">${JOB_LINKS.map(linkRow).join('')}</div></div>
        <div><div class="h-section" style="margin-top:0">Developer references</div><div class="link-list">${DOC_LINKS.map(linkRow).join('')}</div></div>
      </div>
    </div></div>`);

    app.addEventListener('change', onCareerCheck);
    $('#downloadChecklist').addEventListener('click', () => {
      const c = store.get(userKey('career'), {});
      const mark = (id) => (c[id] ? '[x]' : '[ ]');
      const text = ['STUDY DESK — INTERNSHIP CHECKLIST', 'Generated ' + new Date().toLocaleDateString(), '',
        'MUST-HAVE', ...MUST_HAVE.map(([id, t]) => `${mark(id)} ${t}`), '',
        'NICE-TO-HAVE', ...NICE_TO_HAVE.map(([id, t]) => `${mark(id)} ${t}`), '',
        '12-WEEK PLAN', ...WEEK_PLAN.map(([id, w, t]) => `${mark(id)} ${w}: ${t}`), ''].join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
      a.download = 'study-desk-checklist.txt';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('Checklist downloaded.');
    });
  }
  function onCareerCheck(e) {
    const id = e.target.dataset && e.target.dataset.check;
    if (!id) return;
    const c = store.get(userKey('career'), {});
    if (e.target.checked) c[id] = true; else delete c[id];
    store.set(userKey('career'), c);
    const total = MUST_HAVE.length + NICE_TO_HAVE.length + WEEK_PLAN.length;
    const badge = $('#careerBadge');
    if (badge) badge.textContent = Object.keys(c).length + '/' + total;
  }

  /* ---------------- Notes ---------------- */
  let notesQuery = '';
  function renderNotes(activeId) {
    const notes = Notes.list();
    const q = notesQuery.toLowerCase();
    const shown = notes.filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
    const active = notes.find((n) => n.id === activeId);
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Notes']], title: 'Notes',
        desc: 'Save and organise your study notes. Notes are private to your account on this device.',
        actions: '<button class="btn dark small" type="button" id="addNote">New note</button>' })}
      <div class="notes-layout">
        <div>
          <input class="input" id="noteSearch" type="search" placeholder="Search notes…" value="${esc(notesQuery)}" aria-label="Search notes" style="margin-bottom:10px">
          <div id="notesList">${shown.length ? shown.map((n) => `<button type="button" class="note-item${n.id === activeId ? ' active' : ''}" data-note="${esc(n.id)}"><b>${esc(n.title)}</b><small>${fmtDate(n.updatedAt)}</small></button>`).join('')
            : `<div class="empty" style="padding:20px">${notes.length ? 'No notes match your search.' : '<b>No notes yet</b>Click “New note” to create one.'}</div>`}</div>
        </div>
        <div>${active ? `<form class="card" id="noteEditor">
            <label class="field"><span>Title</span><input class="input" id="noteTitle" maxlength="120" value="${esc(active.title)}"></label>
            <label class="field"><span>Note</span><textarea class="textarea" id="noteBody" style="min-height:300px">${esc(active.body)}</textarea></label>
            <div class="btn-row"><button class="btn dark small" type="submit">Save</button><button class="btn ghost small danger" type="button" id="deleteNote">Delete</button><a class="btn ghost small" href="notes.html">Close</a>
            <span style="margin-left:auto;font-size:12px;color:var(--mute);align-self:center">Last saved ${fmtDate(active.updatedAt)}</span></div>
          </form>` : `<div class="empty"><b>Select a note</b>or create a new one. You can also add notes from any lesson on a roadmap.</div>`}</div>
      </div>
    </div></div>`);

    $('#addNote').addEventListener('click', () => { const n = Notes.add('Untitled note', ''); goNote(n.id); setTimeout(() => { const t = $('#noteTitle'); if (t) t.select(); }, 0); });
    $('#noteSearch').addEventListener('input', (e) => {
      notesQuery = e.target.value;
      const pos = e.target.selectionStart;
      renderNotes(activeId);
      const s = $('#noteSearch'); s.focus(); s.setSelectionRange(pos, pos);
    });
    $('#notesList').addEventListener('click', (e) => { const b = e.target.closest('[data-note]'); if (b) goNote(b.dataset.note); });
    const editor = $('#noteEditor');
    if (editor) {
      editor.addEventListener('submit', (e) => {
        e.preventDefault();
        const list = Notes.list();
        const n = list.find((x) => x.id === activeId);
        if (!n) return;
        n.title = $('#noteTitle').value.trim() || 'Untitled note';
        n.body = $('#noteBody').value;
        n.updatedAt = Date.now();
        Notes.save(list.sort((a, b) => b.updatedAt - a.updatedAt));
        renderNotes(activeId);
        toast('Note saved.');
      });
      $('#deleteNote').addEventListener('click', () => {
        if (!confirm('Delete this note?')) return;
        Notes.save(Notes.list().filter((x) => x.id !== activeId));
        goNote(null);
        toast('Note deleted.');
      });
    }
  }

  function renderNotFound() {
    setPage(`<div class="page"><div class="container">${pageHead({ title: 'Page not found', desc: 'That page does not exist. <a href="index.html">Go back home</a>.' })}</div></div>`);
  }

  /* ---------------- Auth UI ---------------- */
  let authMode = 'login';
  function renderNavUser() {
    const u = Auth.current();
    $('#navRight').innerHTML = u
      ? `<button type="button" class="nav-user" id="accountBtn" title="Change password" style="background:none;border:0;padding:0"><span class="avatar" aria-hidden="true">${esc(u.username[0].toUpperCase())}</span><span class="uname">${esc(u.username)}</span>${u.role === 'admin' ? '<span class="role-badge">ADMIN</span>' : ''}</button><button class="btn small" type="button" id="logoutBtn">Log out</button>`
      : `<button class="btn small" type="button" id="loginBtn">Log in</button><button class="btn small light" type="button" id="signupBtn">Sign up</button>`;
    const lo = $('#logoutBtn');
    if (lo) lo.addEventListener('click', () => { Auth.logout(); renderNavUser(); route(); toast('Logged out.'); });
    const ab = $('#accountBtn'); if (ab) ab.addEventListener('click', () => openPwModal(false));
    const li = $('#loginBtn'); if (li) li.addEventListener('click', () => openAuth('login'));
    const su = $('#signupBtn'); if (su) su.addEventListener('click', () => openAuth('register'));
  }
  function setAuthMode(mode) {
    authMode = mode;
    const reg = mode === 'register';
    $('#authTitle').textContent = reg ? 'Create an account' : 'Log in';
    $('#authSub').textContent = reg ? 'Track your roadmap progress and keep your notes.' : 'Pick up where you left off.';
    $('#authConfirmWrap').hidden = !reg;
    $('#authSubmit').textContent = reg ? 'Create account' : 'Log in';
    $('#authPassword').setAttribute('autocomplete', reg ? 'new-password' : 'current-password');
    $('#authSwitchText').innerHTML = reg ? 'Already have an account? <button type="button" id="authSwitch">Log in</button>' : 'New here? <button type="button" id="authSwitch">Create an account</button>';
    $('#authSwitch').addEventListener('click', () => setAuthMode(reg ? 'login' : 'register'));
    $('#authError').textContent = '';
    $('#authNote').innerHTML = 'Accounts are stored only in this browser. Passwords are salted and hashed before saving.';
  }
  function openAuth(mode) {
    setAuthMode(mode);
    $('#authForm').reset();
    $('#authModal').classList.add('open');
    setTimeout(() => $('#authUsername').focus(), 0);
  }
  function closeAuth() { $('#authModal').classList.remove('open'); }
  $('#authClose').addEventListener('click', closeAuth);
  $('#authModal').addEventListener('click', (e) => { if (e.target.id === 'authModal') closeAuth(); });
  $('#authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#authSubmit');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Please wait…';
    $('#authError').textContent = '';
    try {
      const u = $('#authUsername').value, p = $('#authPassword').value;
      const res = authMode === 'register' ? await Auth.register(u, p, $('#authConfirm').value) : await Auth.login(u, p);
      if (!res.ok) { $('#authError').textContent = res.message; return; }
      closeAuth();
      renderNavUser();
      route();
      if (res.user.mustChangePassword) openPwModal(true);
      toast(authMode === 'register' ? 'Welcome, ' + res.user.username + '!' : 'Welcome back, ' + res.user.username + '.');
    } catch (err) {
      $('#authError').textContent = err.message || 'Something went wrong.';
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  });

  /* ---------------- Change password ---------------- */
  let pwForced = false;
  function openPwModal(forced) {
    pwForced = forced;
    $('#pwForm').reset();
    $('#pwError').textContent = '';
    $('#pwClose').hidden = forced;
    $('#pwTitle').textContent = forced ? 'Set a new password' : 'Change your password';
    $('#pwSub').textContent = forced
      ? 'You are using the default password. Choose a new one to keep the admin account secure.'
      : 'Choose a new password for your account.';
    $('#pwModal').classList.add('open');
    setTimeout(() => $('#pwCurrent').focus(), 0);
  }
  function closePwModal() { if (!pwForced) $('#pwModal').classList.remove('open'); }
  $('#pwClose').addEventListener('click', closePwModal);
  $('#pwModal').addEventListener('click', (e) => { if (e.target.id === 'pwModal') closePwModal(); });
  $('#pwForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#pwSubmit');
    btn.disabled = true;
    $('#pwError').textContent = '';
    try {
      const res = await Auth.changePassword($('#pwCurrent').value, $('#pwNew').value, $('#pwConfirm').value);
      if (!res.ok) { $('#pwError').textContent = res.message; return; }
      pwForced = false;
      $('#pwModal').classList.remove('open');
      toast('Password updated.');
    } catch (err) {
      $('#pwError').textContent = err.message || 'Something went wrong.';
    } finally { btn.disabled = false; }
  });

  /* ---------------- Focus mode ---------------- */
  const focus = { total: 1500, left: 1500, id: null };
  function paintFocus() {
    $('#focusTimer').textContent = fmtTime(focus.left);
    $('#focusStart').textContent = focus.id ? 'Pause' : focus.left === focus.total ? 'Start' : focus.left === 0 ? 'Start again' : 'Resume';
  }
  function openFocus() { $('#focusOverlay').classList.add('open'); paintFocus(); $('#focusStart').focus(); }
  function closeFocus() { $('#focusOverlay').classList.remove('open'); }
  $('#focusStart').addEventListener('click', () => {
    if (focus.id) { clearInterval(focus.id); focus.id = null; return paintFocus(); }
    if (focus.left === 0) focus.left = focus.total;
    focus.id = setInterval(() => {
      focus.left = Math.max(0, focus.left - 1);
      if (focus.left === 0) { clearInterval(focus.id); focus.id = null; toast('Focus session complete. Take a break!'); }
      paintFocus();
    }, 1000);
    paintFocus();
  });
  $('#focusReset').addEventListener('click', () => { clearInterval(focus.id); focus.id = null; focus.left = focus.total; paintFocus(); });
  $('#focusExit').addEventListener('click', closeFocus);

  /* ---------------- Global events ---------------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'focus') openFocus();
    else if (act === 'resume' && currentRoadmap) {
      const k = firstUnfinished(currentRoadmap.modules);
      if (k) openDrawer(k); else toast('Everything here is done or skipped!');
    } else if (act === 'reset-progress' && currentRoadmap) {
      if (!confirm('Reset progress for this roadmap?')) return;
      Progress.reset(currentRoadmap.modules);
      refreshRoadmapState();
      toast('Progress reset.');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if ($('#focusOverlay').classList.contains('open')) return closeFocus();
      if ($('#pwModal').classList.contains('open')) return closePwModal();
      if ($('#authModal').classList.contains('open')) return closeAuth();
      return closeDrawer();
    }
    if (!drawerKey || !lessonFromKey(drawerKey)) return;
    if (e.target.matches('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
    const map = { d: 'done', l: 'learning', s: 'skipped', r: 'pending' };
    const st = map[e.key.toLowerCase()];
    if (st) { e.preventDefault(); setDrawerStatus(st); }
  });

  $('#menuToggle').addEventListener('click', () => {
    const open = $('#navLinks').classList.toggle('open');
    $('#menuToggle').setAttribute('aria-expanded', String(open));
  });

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawWires, 80); });

  /* ---------------- Page rendering ---------------- */
  // Each page is its own HTML file; <body data-page="..."> says which one to render.
  function route() {
    app.removeEventListener('change', onCareerCheck);
    closeDrawer();
    $('#navLinks').classList.remove('open');
    $('#menuToggle').setAttribute('aria-expanded', 'false');
    currentRoadmap = null;
    $$('.nav-links a').forEach((a) => a.classList.toggle('active', a.dataset.nav === PAGE));

    const p = new URLSearchParams(location.search);
    const titles = { roadmap: 'Roadmaps', practice: 'Practice lab', interview: 'Interview prep', community: 'Community', career: 'Career', notes: 'Notes' };
    if (PAGE === 'home') renderHome();
    else if (PAGE === 'roadmap') p.get('m') ? renderModuleRoadmap(p.get('m')) : renderFullRoadmap();
    else if (PAGE === 'practice') renderPractice();
    else if (PAGE === 'interview') renderInterview();
    else if (PAGE === 'community') renderCommunity();
    else if (PAGE === 'career') renderCareer();
    else if (PAGE === 'notes') renderNotes(p.get('id'));
    else renderNotFound();

    const m = PAGE === 'roadmap' && p.get('m') && byId(p.get('m'));
    document.title = (m ? m.title + ' roadmap' : titles[PAGE] || 'Computer science roadmaps') + ' · Study Desk';
  }

  window.addEventListener('popstate', () => { if (PAGE === 'notes') route(); });
  renderNavUser();
  route();
  Auth.ready().then(() => { const u = Auth.current(); if (u && u.mustChangePassword) openPwModal(true); });

  // Expose a tiny API for tests and debugging.
  window.StudyDesk = { Auth, Progress, Notes, MODULES };
})();
