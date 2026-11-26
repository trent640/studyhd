/* Study Desk — a calm, structured computer science study app.
   Vanilla JS, one HTML file per page (<body data-page="...">), data in localStorage. */
(function () {
  'use strict';

  /* ================= Data ================= */
  const RAW = window.SD_MODULES || [];
  const PATH = window.SD_PATH || RAW.map((m) => m.id);
  const MODULES = PATH.map((id) => RAW.find((m) => m.id === id)).filter(Boolean);
  const CERTS = window.SD_CERTS || [];
  const PROJECTS = window.SD_PROJECTS || [];
  const CHALLENGES = window.SD_CHALLENGES || [];
  const JOBPATHS = window.SD_JOBPATHS || [];
  const certById = (id) => CERTS.find((c) => c.id === id);
  const byId = (id) => MODULES.find((m) => m.id === id);
  const certOf = (mid) => CERTS.find((c) => c.modules.includes(mid));
  const projectById = (id) => PROJECTS.find((p) => p.id === id);
  const challengeById = (id) => CHALLENGES.find((c) => c.id === id);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const PAGE = document.body.dataset.page || 'home';
  const params = new URLSearchParams(location.search);
  const STATUS_LABEL = { pending: 'Not started', learning: 'In progress', done: 'Done', skipped: 'Skipped' };
  const CATEGORIES = ['All', 'Foundations', 'Engineering', 'Data', 'Java', 'Web', 'Security', 'Career'];

  /* ================= Shared page chrome ================= */
  const NAV = [
    ['learn', 'learn.html', 'Learn'], ['roadmap', 'roadmap.html', 'Roadmap'], ['practice', 'practice.html', 'Practice'],
    ['projects', 'projects.html', 'Projects'], ['interview', 'interview.html', 'Interview'], ['career', 'career.html', 'Career'],
    ['community', 'community.html', 'Community'], ['notes', 'notes.html', 'Notes'],
  ];
  document.body.insertAdjacentHTML('afterbegin', `
<a class="skip-link" href="#app">Skip to content</a>
<header class="topnav">
  <div class="container">
    <a class="logo" href="index.html"><span class="logo-mark" aria-hidden="true">sd</span>study desk</a>
    <nav class="nav-links" id="navLinks" aria-label="Main navigation">
      ${NAV.map(([k, href, label]) => `<a href="${href}" data-nav="${k}">${label}</a>`).join('')}
    </nav>
    <div class="nav-right" id="navRight"></div>
    <button class="icon-btn" id="settingsBtn" type="button" aria-label="Comfort settings" title="Comfort settings">⚙</button>
    <button class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">☰</button>
  </div>
</header>`);
  document.body.insertAdjacentHTML('beforeend', `
<footer class="footer">
  <div class="container">Study Desk keeps your progress, notes and discussions in this browser only. Accounts are local to this device. Use ⚙ to change text size, fonts, colours, motion and break reminders.</div>
</footer>
<div class="drawer-backdrop" id="drawerBackdrop"></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" aria-hidden="true">
  <div class="drawer-top">
    <label class="sr-only" for="drawerStatus">Update status</label>
    <select id="drawerStatus">
      <option value="pending">Not started</option>
      <option value="learning">In progress</option>
      <option value="done">Done</option>
      <option value="skipped">Skip</option>
    </select>
    <span class="status-pill" id="drawerPill">Not started</span>
    <button class="x" id="drawerClose" aria-label="Close">×</button>
  </div>
  <div class="drawer-body readable" id="drawerBody"></div>
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
<div class="modal-backdrop" id="settingsModal" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
  <div class="modal wide">
    <button class="x" id="settingsClose" aria-label="Close">×</button>
    <h2 id="settingsTitle">Comfort settings</h2>
    <p class="sub">Make the page easier to read and focus on. Changes apply straight away and are saved on this device.</p>
    <form id="settingsForm"></form>
  </div>
</div>
<div class="modal-backdrop" id="breakModal" role="dialog" aria-modal="true" aria-labelledby="breakTitle">
  <div class="modal">
    <h2 id="breakTitle">Time for a short break?</h2>
    <p class="sub" id="breakText">You have been studying for a while. Standing up, drinking water or looking away from the screen for 5 minutes helps you remember more.</p>
    <div class="btn-row">
      <button class="btn dark" id="breakTake" type="button">Start a 5-minute break</button>
      <button class="btn" id="breakSkip" type="button">Keep going</button>
    </div>
  </div>
</div>
<div class="focus-overlay" id="focusOverlay" role="dialog" aria-modal="true" aria-labelledby="focusLabel">
  <div class="kicker" id="focusLabel" style="color:#9b9ba6">Focus mode</div>
  <div class="timer" id="focusTimer">25:00</div>
  <p id="focusText">One task. Everything else can wait. Press <kbd>Esc</kbd> to leave.</p>
  <div class="btn-row">
    <button class="btn yellow" id="focusStart">Start</button>
    <button class="btn" id="focusReset">Reset</button>
    <button class="btn" id="focusExit">Exit</button>
  </div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`);

  /* ================= Utilities ================= */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function hashStr(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
  function fmtDate(ts) { try { return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; } }
  function fmtTime(sec) { return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function today() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 2600);
  }
  // Estimated minutes for a lesson: reading at ~150 wpm, code, plus practice time.
  function lessonMinutes(l) {
    const words = [l.objective, l.example, l.practice, l.check, l.answer].join(' ').split(/\s+/).length;
    const codeLines = (l.code || '').split('\n').length;
    return Math.max(5, Math.round((words / 150 + codeLines * 0.2 + 5) / 5) * 5);
  }
  const moduleMinutes = (m) => m.lessons.reduce((s, l) => s + lessonMinutes(l), 0);
  function fmtMinutes(min) { return min < 60 ? min + ' min' : (Math.round(min / 6) / 10) + ' h'; }

  /* ================= Storage ================= */
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { toast('Could not save — browser storage is unavailable.'); return false; } },
    remove(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } },
  };
  const userKey = (name) => 'sd:' + (Auth.current() ? Auth.current().username : 'guest') + ':' + name;

  /* ================= Auth (server-side accounts via /api) ================= */
  const Auth = (function () {
    let user = null;        // { username, role } for the signed-in user
    let available = false;  // true when the Study Desk server answered /api/me
    store.remove('sd:users'); store.remove('sd:session'); // drop old browser-only accounts

    async function call(path, body) {
      let res;
      try {
        res = await fetch(path, body === undefined
          ? { credentials: 'same-origin', headers: { Accept: 'application/json' } }
          : { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      } catch (e) { return { ok: false, message: 'Cannot reach the Study Desk server.' }; }
      let data = {};
      try { data = await res.json(); } catch (e) { /* not JSON: probably no server */ }
      if (!res.ok) {
        const message = data.error || (res.status === 404 || res.status === 501 ? 'Accounts need the Study Desk server. Start it with "npm start".' : 'Something went wrong (' + res.status + ').');
        return { ok: false, status: res.status, message };
      }
      return { ok: true, ...data };
    }
    async function init() {
      const r = await call('/api/me');
      available = r.ok;
      user = r.ok ? r.user : null;
    }
    async function login(username, password) {
      if (!username.trim() || !password) return { ok: false, message: 'Enter your username and password.' };
      const r = await call('/api/login', { username: username.trim(), password });
      if (r.ok) user = r.user;
      return r;
    }
    async function register(username, password, confirm) {
      if (password !== confirm) return { ok: false, message: 'Passwords do not match.' };
      const r = await call('/api/register', { username: username.trim(), password });
      if (r.ok) user = r.user;
      return r;
    }
    async function changePassword(currentPassword, newPassword, confirmPw) {
      if (newPassword !== confirmPw) return { ok: false, message: 'New passwords do not match.' };
      return call('/api/password', { currentPassword, newPassword });
    }
    async function logout() { await call('/api/logout', {}); user = null; }
    return {
      init, login, register, changePassword, logout,
      current: () => user,
      isAdmin: () => !!user && user.role === 'admin',
      available: () => available,
    };
  })();

  /* ================= Progress ================= */
  const Progress = {
    all() { return store.get(userKey('progress'), {}); },
    get(key) { return this.all()[key] || 'pending'; },
    set(key, status) {
      const p = this.all();
      const was = p[key];
      if (status === 'pending') delete p[key]; else p[key] = status;
      store.set(userKey('progress'), p);
      if (status === 'done' && was !== 'done') Daily.add();
    },
    moduleStats(m) {
      const p = this.all();
      let done = 0, learning = 0, skipped = 0;
      m.lessons.forEach((_, i) => {
        const s = p[m.id + ':' + i];
        if (s === 'done') done++; else if (s === 'learning') learning++; else if (s === 'skipped') skipped++;
      });
      const total = m.lessons.length;
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
    next(list = MODULES) {
      for (const m of list) for (let i = 0; i < m.lessons.length; i++) {
        const s = this.get(m.id + ':' + i);
        if (s !== 'done' && s !== 'skipped') return { m, i };
      }
      return null;
    },
  };
  const Daily = {
    count() { return (store.get(userKey('daily'), {})[today()]) || 0; },
    add() { const d = store.get(userKey('daily'), {}); d[today()] = (d[today()] || 0) + 1; store.set(userKey('daily'), d); },
  };
  const ProjectProgress = {
    get(pid) { return store.get(userKey('projects'), {})[pid] || { stories: {}, repo: '' }; },
    set(pid, value) { const all = store.get(userKey('projects'), {}); all[pid] = value; store.set(userKey('projects'), all); },
    count(p) { const s = this.get(p.id).stories; return p.stories.filter((_, i) => s[i]).length; },
    complete(p) { return this.count(p) === p.stories.length; },
  };
  const Solved = {
    all() { return store.get(userKey('solved'), {}); },
    has(id) { return !!this.all()[id]; },
    add(id) { const s = this.all(); s[id] = Date.now(); store.set(userKey('solved'), s); },
  };
  function certStats(c) {
    const mods = c.modules.map(byId).filter(Boolean);
    const o = Progress.overall(mods);
    const projDone = c.projects.filter((id) => ProjectProgress.complete(projectById(id))).length;
    const stepsDone = o.done + o.skipped;
    return { ...o, stepsDone, projDone, projTotal: c.projects.length,
      pct: Math.round(((stepsDone + projDone * 5) / (o.total + c.projects.length * 5 || 1)) * 100),
      complete: stepsDone === o.total && projDone === c.projects.length };
  }

  /* ================= Notes ================= */
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
  function goNote(id) {
    const url = 'notes.html' + (id ? '?id=' + encodeURIComponent(id) : '');
    if (PAGE === 'notes') { history.pushState(null, '', url); renderNotes(id); }
    else location.href = url;
  }

  /* ================= Comfort settings ================= */
  const SETTINGS_KEY = 'sd:settings';
  const DEFAULT_SETTINGS = { textSize: 'm', font: 'default', spacing: 'normal', theme: 'light', calm: false, reduceMotion: false, breakMinutes: 25, dailyGoal: 3, showTimes: true };
  const Settings = {
    get() { return { ...DEFAULT_SETTINGS, ...store.get(SETTINGS_KEY, {}) }; },
    set(patch) { store.set(SETTINGS_KEY, { ...this.get(), ...patch }); applySettings(); },
  };
  function applySettings() {
    const s = Settings.get();
    const b = document.body;
    ['text-l', 'text-xl', 'text-s'].forEach((c) => b.classList.remove(c));
    if (s.textSize !== 'm') b.classList.add('text-' + s.textSize);
    b.classList.toggle('font-readable', s.font === 'readable');
    b.classList.toggle('spacing-relaxed', s.spacing === 'relaxed');
    b.classList.toggle('theme-dark', s.theme === 'dark');
    b.classList.toggle('calm', !!s.calm);
    b.classList.toggle('reduce-motion', !!s.reduceMotion);
    b.classList.toggle('hide-times', !s.showTimes);
    if (typeof drawWires === 'function') requestAnimationFrame(drawWires);
  }
  function renderSettingsForm() {
    const s = Settings.get();
    const radio = (name, value, label, desc) => `<label class="opt"><input type="radio" name="${name}" value="${value}"${String(s[name]) === String(value) ? ' checked' : ''}><span><b>${label}</b>${desc ? `<small>${desc}</small>` : ''}</span></label>`;
    const toggle = (name, label, desc) => `<label class="opt"><input type="checkbox" name="${name}"${s[name] ? ' checked' : ''}><span><b>${label}</b><small>${desc}</small></span></label>`;
    $('#settingsForm').innerHTML = `
      <fieldset><legend>Text size (lessons and reading areas)</legend><div class="opt-row">
        ${radio('textSize', 's', 'Small')}${radio('textSize', 'm', 'Medium')}${radio('textSize', 'l', 'Large')}${radio('textSize', 'xl', 'Extra large')}</div></fieldset>
      <fieldset><legend>Font</legend><div class="opt-row">
        ${radio('font', 'default', 'Standard', 'Inter')}${radio('font', 'readable', 'Extra readable', 'Atkinson Hyperlegible: clearer letter shapes')}</div></fieldset>
      <fieldset><legend>Line spacing</legend><div class="opt-row">
        ${radio('spacing', 'normal', 'Normal')}${radio('spacing', 'relaxed', 'Relaxed', 'More space between lines')}</div></fieldset>
      <fieldset><legend>Colours</legend><div class="opt-row">
        ${radio('theme', 'light', 'Light')}${radio('theme', 'dark', 'Dark', 'Less glare')}</div>
        ${toggle('calm', 'Calm colours', 'Softer yellows and lower contrast for less visual intensity')}</fieldset>
      <fieldset><legend>Movement and time</legend>
        ${toggle('reduceMotion', 'Reduce motion', 'Turn off slides, fades and animations')}
        ${toggle('showTimes', 'Show time estimates', 'Show how long each step usually takes')}</fieldset>
      <fieldset><legend>Break reminders</legend><div class="opt-row">
        ${radio('breakMinutes', 0, 'Off')}${radio('breakMinutes', 25, 'Every 25 min')}${radio('breakMinutes', 45, 'Every 45 min')}${radio('breakMinutes', 60, 'Every 60 min')}</div></fieldset>
      <fieldset><legend>Daily goal</legend><div class="opt-row">
        ${radio('dailyGoal', 1, '1 step')}${radio('dailyGoal', 3, '3 steps')}${radio('dailyGoal', 5, '5 steps')}</div>
        <p class="hint-text">Small goals are easier to start. Missing a day is fine — there are no streaks to lose.</p></fieldset>
      <div class="btn-row"><button type="button" class="btn" id="settingsReset">Reset to defaults</button><button type="button" class="btn dark" id="settingsDone">Done</button></div>`;
  }
  $('#settingsForm').addEventListener('change', (e) => {
    const t = e.target;
    let v = t.type === 'checkbox' ? t.checked : t.value;
    if (t.name === 'breakMinutes' || t.name === 'dailyGoal') v = Number(v);
    Settings.set({ [t.name]: v });
    if (t.name === 'breakMinutes') BreakTimer.restart();
  });
  $('#settingsForm').addEventListener('click', (e) => {
    if (e.target.id === 'settingsReset') { store.set(SETTINGS_KEY, {}); applySettings(); renderSettingsForm(); BreakTimer.restart(); toast('Settings reset.'); }
    if (e.target.id === 'settingsDone') closeModal('settingsModal');
  });
  function openSettings() { renderSettingsForm(); openModal('settingsModal'); }
  $('#settingsBtn').addEventListener('click', openSettings);
  $('#settingsClose').addEventListener('click', () => closeModal('settingsModal'));

  /* ================= Modals ================= */
  let modalReturnFocus = null;
  function openModal(id) {
    modalReturnFocus = document.activeElement;
    $('#' + id).classList.add('open');
    setTimeout(() => { const f = $('#' + id + ' input, #' + id + ' button.btn'); if (f) f.focus(); }, 0);
  }
  function closeModal(id) {
    $('#' + id).classList.remove('open');
    if (modalReturnFocus && document.contains(modalReturnFocus)) modalReturnFocus.focus();
  }
  ['settingsModal', 'authModal'].forEach((id) => $('#' + id).addEventListener('click', (e) => { if (e.target.id === id) closeModal(id); }));

  /* ================= Break reminders ================= */
  const BreakTimer = {
    id: null,
    restart() {
      clearInterval(this.id);
      try { sessionStorage.setItem('sd:studyStart', String(Date.now())); } catch (e) { /* ignore */ }
      this.start();
    },
    start() {
      clearInterval(this.id);
      const mins = Settings.get().breakMinutes;
      if (!mins) return;
      let start;
      try { start = Number(sessionStorage.getItem('sd:studyStart')); if (!start) { start = Date.now(); sessionStorage.setItem('sd:studyStart', String(start)); } }
      catch (e) { start = Date.now(); }
      this.id = setInterval(() => {
        if (document.hidden || $('#focusOverlay').classList.contains('open')) return;
        if (Date.now() - start >= mins * 60000) {
          $('#breakText').textContent = `You have been studying for ${mins} minutes. Standing up, drinking water or looking away from the screen for 5 minutes helps you remember more.`;
          openModal('breakModal');
          clearInterval(this.id);
        }
      }, 15000);
    },
  };
  $('#breakSkip').addEventListener('click', () => { closeModal('breakModal'); BreakTimer.restart(); });
  $('#breakTake').addEventListener('click', () => { closeModal('breakModal'); openFocus('break'); startFocus(); });

  /* ================= Rendering helpers ================= */
  const app = $('#app');
  function setPage(html, { dark = false } = {}) {
    document.body.classList.toggle('dark-page', dark);
    app.innerHTML = html;
  }
  function linkRow([href, title, source]) {
    return `<a class="resource-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer"><span class="tag">${esc(source)}</span>${esc(title)}<span class="out">↗</span></a>`;
  }
  function pageHead({ crumbs = [], title, desc, actions = '', extra = '' }) {
    const c = crumbs.length ? `<nav class="crumbs" aria-label="Breadcrumb">${crumbs.map(([h, t]) => h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`).join(' <span aria-hidden="true">›</span> ')}</nav>` : '';
    return `<div class="page-head">${c}<h1>${esc(title)}</h1>${desc ? `<p>${desc}</p>` : ''}${actions ? `<div class="head-actions">${actions}</div>` : ''}${extra}</div>`;
  }
  function bar(pct, label) {
    return `<div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${esc(label || 'Progress')}"><div class="progress-fill" style="width:${pct}%"></div></div>`;
  }
  function orderedChoices(m) {
    const n = m.quizChoices.length;
    const shift = hashStr(m.id) % n;
    const items = m.quizChoices.map((text, i) => ({ text, i }));
    return items.map((_, k) => items[(k + shift) % n]);
  }
  function quizBlock(id, question, choices, correctIndex) {
    return `<div class="quiz" data-quiz="${esc(id)}" data-answer="${correctIndex}">
      <p class="quiz-q">${esc(question)}</p>
      <div class="quiz-options">${choices.map((c) => `<button type="button" class="quiz-option" data-choice="${c.i}">${esc(c.text)}</button>`).join('')}</div>
      <div class="feedback" aria-live="polite">Choose an answer. You can try as many times as you like.</div></div>`;
  }
  function wireQuizzes(root, explanations = {}) {
    $$('.quiz', root).forEach((q) => {
      if (q.dataset.wired) return;
      q.dataset.wired = '1';
      q.addEventListener('click', (e) => {
        const btn = e.target.closest('.quiz-option');
        if (!btn) return;
        const right = btn.dataset.choice === q.dataset.answer;
        $$('.quiz-option', q).forEach((b) => b.classList.remove('correct', 'wrong'));
        btn.classList.add(right ? 'correct' : 'wrong');
        const fb = $('.feedback', q);
        const exp = explanations[q.dataset.quiz];
        fb.className = 'feedback ' + (right ? 'good' : 'bad');
        fb.textContent = right ? 'Correct. ' + (exp ? exp.right : 'Well reasoned.') : (exp ? exp.wrong : 'Not this one. Have another look and try again.');
      });
    });
  }
  const lessonUrl = (mid, i) => `lesson.html?m=${encodeURIComponent(mid)}&i=${i}`;
  function stepSquares(m, currentIndex = -1) {
    return `<ol class="steps" aria-label="${esc(m.title)} steps">${m.lessons.map((l, i) => {
      const st = Progress.get(m.id + ':' + i);
      return `<li><a class="step ${st}${i === currentIndex ? ' current' : ''}" href="${lessonUrl(m.id, i)}" title="Step ${i + 1}: ${esc(l.title)} (${STATUS_LABEL[st]})" aria-label="Step ${i + 1}: ${esc(l.title)}, ${STATUS_LABEL[st]}"${i === currentIndex ? ' aria-current="step"' : ''}>${i + 1}</a></li>`;
    }).join('')}</ol>`;
  }
  function timeTag(min) { return `<span class="time-tag">⏱ about ${fmtMinutes(min)}</span>`; }
  // Read text aloud with the browser's speech synthesis.
  function speak(text, btn) {
    if (!('speechSynthesis' in window)) { toast('Read aloud is not supported in this browser.'); return; }
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); if (btn) btn.textContent = '🔊 Read aloud'; return; }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onend = () => { if (btn) btn.textContent = '🔊 Read aloud'; };
    speechSynthesis.speak(u);
    if (btn) btn.textContent = '■ Stop reading';
  }

  /* ================= Home ================= */
  let homeFilter = 'All';
  function continueCard(dark) {
    const n = Progress.next();
    const goal = Settings.get().dailyGoal;
    const doneToday = Daily.count();
    if (!n) return `<div class="continue ${dark ? 'dark' : ''}"><div><div class="kicker">All steps done</div><h2>You have finished every step. 🎉</h2><p>Build the projects, or practise challenges to stay sharp.</p></div><a class="btn yellow" href="projects.html">Go to projects →</a></div>`;
    const l = n.m.lessons[n.i];
    return `<div class="continue ${dark ? 'dark' : ''}">
      <div>
        <div class="kicker">Your next step</div>
        <h2>${esc(l.title)}</h2>
        <p>${esc(n.m.title)} · Step ${n.i + 1} of ${n.m.lessons.length} ${timeTag(lessonMinutes(l))}</p>
        <div class="goal-line"><span>Today: ${Math.min(doneToday, goal)} of ${goal} step${goal > 1 ? 's' : ''}</span>${bar(Math.min(100, Math.round((doneToday / goal) * 100)), 'Daily goal')}</div>
      </div>
      <a class="btn yellow big" href="${lessonUrl(n.m.id, n.i)}" id="continueBtn">Continue →</a>
    </div>`;
  }
  function renderHome() {
    const ov = Progress.overall();
    const tiles = MODULES.filter((m) => homeFilter === 'All' || m.cat === homeFilter).map(moduleTile).join('');
    setPage(`<section class="home"><div class="container">
      <div class="hero">
        <h1>Learn computer science<br>one small step at a time</h1>
        <p>A calm, structured study space built for <b>ADHD and autistic learners</b>. ${MODULES.length} modules and ${ov.total} short steps, shaped by what Irish software internship job posts ask for.</p>
        <div class="hero-cta">
          <a class="btn yellow" href="learn.html">Start learning →</a>
          <a class="btn" href="roadmap.html">See the roadmap</a>
          <button class="btn" type="button" data-action="focus">Focus mode</button>
        </div>
      </div>
      ${continueCard(true)}
      <ul class="calm-list" aria-label="How Study Desk helps">
        <li><b>Small steps.</b> Each step takes about 5–15 minutes and has one clear goal.</li>
        <li><b>Same layout every time.</b> Goal, example, code, try it, check yourself.</li>
        <li><b>You control the senses.</b> Text size, fonts, colours, motion and breaks in ⚙.</li>
      </ul>
      <div class="section-label"><span>Job paths</span></div>
      <p class="paths-intro">Follow a curated route to a specific career. Each path is a sequence of certifications.</p>
      <div class="tile-grid">${JOBPATHS.map((jp) => {
        const certs = jp.certs.map(certById).filter(Boolean);
        const o = certs.reduce((a, c) => { const s = certStats(c); a.done += s.stepsDone + s.projDone; a.total += s.total + s.projTotal; return a; }, { done: 0, total: 0 });
        const pct = o.total ? Math.round((o.done / o.total) * 100) : 0;
        return `<a class="tile path-tile" href="learn.html?path=${jp.id}"><span>${esc(jp.title)}<small>${certs.length} certifications · ${esc(jp.desc)}</small></span><span class="tile-tag">${pct}%</span><i class="tile-bar" style="width:${pct}%"></i></a>`;
      }).join('')}</div>
      <div class="section-label"><span>Certifications</span></div>
      <div class="tile-grid">${CERTS.map((c) => { const s = certStats(c); return `<a class="tile cert-tile" href="learn.html#cert-${c.id}"><span>${esc(c.title)}<small>${c.modules.length} modules · ${s.total} steps · ${c.projects.length} project${c.projects.length > 1 ? 's' : ''}</small></span>${s.complete ? '<span class="tile-tag done">✓ Complete</span>' : `<span class="tile-tag">${s.pct}%</span>`}<i class="tile-bar" style="width:${s.pct}%"></i></a>`; }).join('')}</div>
      <div class="section-label"><span>Module roadmaps</span></div>
      <div class="chip-row" role="group" aria-label="Filter modules">${CATEGORIES.map((c) => `<button type="button" class="chip${c === homeFilter ? ' active' : ''}" data-filter="${c}" aria-pressed="${c === homeFilter}">${c}</button>`).join('')}</div>
      <div class="tile-grid" id="moduleTiles">${tiles || '<p style="color:var(--night-mute)">No modules in this category.</p>'}</div>
      <div class="section-label"><span>Practice and career</span></div>
      <div class="tile-grid">
        <a class="tile" href="practice.html"><span>Coding challenges<small>${CHALLENGES.length} assessment-style problems with tests</small></span><span class="tile-tag">Practice</span></a>
        <a class="tile" href="projects.html"><span>Portfolio projects<small>${PROJECTS.length} projects with user stories</small></span><span class="tile-tag">Build</span></a>
        <a class="tile" href="interview.html"><span>Interview prep<small>Technical and STAR behavioural prompts</small></span><span class="tile-tag">Career</span></a>
        <a class="tile" href="career.html"><span>Irish internships<small>What employers ask for, plan and job links</small></span><span class="tile-tag">Career</span></a>
        <a class="tile" href="community.html"><span>Community<small>Start a focused discussion</small></span><span class="tile-tag">Forum</span></a>
        <a class="tile" href="notes.html"><span>Notes<small>Save what you learn</small></span><span class="tile-tag">Personal</span></a>
      </div>
    </div></section>`, { dark: true });
    $$('.chip', app).forEach((b) => b.addEventListener('click', () => { homeFilter = b.dataset.filter; renderHome(); }));
  }
  function moduleTile(m) {
    const s = Progress.moduleStats(m);
    return `<a class="tile" href="roadmap.html?m=${esc(m.id)}" data-module="${esc(m.id)}"><span>${esc(m.title)}<small>${m.lessons.length} steps${s.done ? ' · ' + s.done + ' done' : ''}</small></span><span class="tile-tag">${esc(m.cat)}</span><i class="tile-bar" style="width:${s.pct}%"></i></a>`;
  }

  /* ================= Learn (certifications) ================= */
  function renderLearn() {
    const open = store.get('sd:openCerts', null);
    const pathId = params.get('path');
    const jobPath = JOBPATHS.find((p) => p.id === pathId);
    const shownCerts = jobPath ? jobPath.certs.map(certById).filter(Boolean) : CERTS;
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Learn']], title: jobPath ? jobPath.title : 'Learn',
        desc: jobPath ? esc(jobPath.desc) + ' Finish each certification\'s steps and projects in order.' : `${CERTS.length} certifications. Each one is a set of modules made of short, numbered steps. Finish the steps, then build the projects to earn the certification. Go in order or pick what you need.` })}
      <div class="path-switch" role="group" aria-label="Choose a job path">
        <span>Job path:</span>
        <a class="chip light${!jobPath ? ' active' : ''}" href="learn.html"${!jobPath ? ' aria-current="true"' : ''}>All certifications</a>
        ${JOBPATHS.map((p) => `<a class="chip light${jobPath && jobPath.id === p.id ? ' active' : ''}" href="learn.html?path=${p.id}"${jobPath && jobPath.id === p.id ? ' aria-current="true"' : ''}>${esc(p.title)}</a>`).join('')}
      </div>
      ${continueCard(false)}
      <div class="how-it-works card">
        <h2>How each step works</h2>
        <ol class="flow"><li><b>Goal</b> what you will be able to do</li><li><b>Example</b> a real situation</li><li><b>Code</b> to read and run</li><li><b>Try it</b> a small task</li><li><b>Check</b> one question</li></ol>
      </div>
      ${shownCerts.map((c, ci) => {
        const s = certStats(c);
        const isOpen = open ? open.includes(c.id) : (jobPath ? ci === 0 : ci === 0);
        return `<details class="cert" id="cert-${c.id}" data-cert="${c.id}"${isOpen ? ' open' : ''}>
          <summary>
            <span class="cert-title"><span class="cert-num">${ci + 1}</span>${esc(c.title)}${s.complete ? ' <span class="badge-done">✓ Certified</span>' : ''}</span>
            <span class="cert-meta">${s.stepsDone}/${s.total} steps · ${s.projDone}/${s.projTotal} projects</span>
            ${bar(s.pct, c.title + ' progress')}
          </summary>
          <p class="cert-desc">${esc(c.desc)}</p>
          ${c.modules.map(byId).filter(Boolean).map((m) => {
            const ms = Progress.moduleStats(m);
            return `<section class="block" aria-labelledby="blk-${m.id}">
              <div class="block-head">
                <div><h3 id="blk-${m.id}">${esc(m.title)}</h3><p>${esc(m.desc)}</p></div>
                <div class="block-meta">${ms.done + ms.skipped}/${ms.total} steps ${timeTag(moduleMinutes(m))}</div>
              </div>
              ${stepSquares(m)}
              <div class="block-links"><a href="${lessonUrl(m.id, (Progress.next([m]) || { i: 0 }).i)}" class="btn small dark">${ms.done + ms.skipped === 0 ? 'Start' : ms.done + ms.skipped === ms.total ? 'Review' : 'Continue'} →</a><a href="lesson.html?m=${m.id}&review=1" class="btn small">Module quiz</a><a href="roadmap.html?m=${m.id}" class="btn small ghost">Roadmap view</a></div>
            </section>`;
          }).join('')}
          <div class="cert-projects"><h3>Certification projects</h3>
            ${c.projects.map(projectById).map((p) => `<a class="project-row" href="projects.html?p=${p.id}"><span class="proj-check ${ProjectProgress.complete(p) ? 'done' : ''}" aria-hidden="true">${ProjectProgress.complete(p) ? '✓' : ''}</span><span><b>${esc(p.title)}</b><small>${esc(p.stack)} · ${ProjectProgress.count(p)}/${p.stories.length} user stories</small></span><span class="out">→</span></a>`).join('')}
          </div>
        </details>`;
      }).join('')}
    </div></div>`);
    $$('details.cert', app).forEach((d) => d.addEventListener('toggle', () => {
      store.set('sd:openCerts', $$('details.cert', app).filter((x) => x.open).map((x) => x.dataset.cert));
    }));
    if (location.hash) { const t = $(location.hash); if (t && t.tagName === 'DETAILS') { t.open = true; t.scrollIntoView(); } }
  }

  /* ================= Lesson (one step per page) ================= */
  function renderLesson() {
    const m = byId(params.get('m'));
    if (!m) return renderNotFound();
    if (params.get('review') === '1') return renderModuleReview(m);
    const i = Math.min(Math.max(0, Number(params.get('i')) || 0), m.lessons.length - 1);
    const l = m.lessons[i];
    const key = m.id + ':' + i;
    const st = Progress.get(key);
    const cert = certOf(m.id);
    const answers = store.get(userKey('answers'), {});
    const minutes = lessonMinutes(l);
    const isLast = i === m.lessons.length - 1;
    document.title = l.title + ' · ' + m.title + ' · Study Desk';
    setPage(`<div class="page lesson-page"><div class="container narrow">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="learn.html">Learn</a> › ${cert ? `<a href="learn.html#cert-${cert.id}">${esc(cert.title)}</a> › ` : ''}<span>${esc(m.title)}</span></nav>
      <div class="lesson-top">
        <div class="step-count">Step ${i + 1} of ${m.lessons.length}</div>
        ${stepSquares(m, i)}
      </div>
      ${m.ethics ? '<div class="ethics-banner" role="note"><b>⚖ Only test what you are allowed to test.</b> Use your own lab or a program that invites testing, and stay inside its scope. Unauthorised access is a criminal offence in Ireland (Criminal Justice (Offences Relating to Information Systems) Act 2017).</div>' : ''}
      <article class="card lesson readable" aria-labelledby="lessonTitle">
        <div class="lesson-head">
          <h1 id="lessonTitle">${esc(l.title)}</h1>
          <div class="lesson-tools">
            <span class="status-pill ${st}" id="lessonStatus">${STATUS_LABEL[st]}</span>
            ${timeTag(minutes)}
            <button class="btn small" type="button" id="readAloud">🔊 Read aloud</button>
            <button class="btn small" type="button" id="focusReading" aria-pressed="${document.body.classList.contains('focus-reading')}">Focus reading</button>
          </div>
        </div>
        <div class="goal-box"><span class="chunk-label">Goal</span><p>${esc(l.objective)}</p></div>
        <section class="chunk"><h2><span class="chunk-num">1</span>Example</h2><p>${esc(l.example)}</p></section>
        <section class="chunk"><h2><span class="chunk-num">2</span>Code</h2>
          <div class="code-wrap"><button class="copy-btn" type="button" data-copy>Copy</button><pre class="code"><code>${esc(l.code)}</code></pre></div></section>
        <section class="chunk"><h2><span class="chunk-num">3</span>Try it</h2><p>${esc(l.practice)}</p>
          <label class="field"><span>Your notes or answer (saved automatically)</span><textarea class="textarea" id="lessonAnswer" placeholder="Write what you tried, or paste your code…">${esc(answers[key] || '')}</textarea></label></section>
        <section class="chunk"><h2><span class="chunk-num">4</span>Check yourself</h2>
          <p class="check-q">${esc(l.check)}</p>
          <p class="hint-text">Think of your answer first, then reveal it.</p>
          <button class="btn small" type="button" id="revealAnswer" aria-expanded="false" aria-controls="answerBox">Show the answer</button>
          <div class="answer-box" id="answerBox" hidden><p>${esc(l.answer)}</p>
            <div class="btn-row"><span class="hint-text" style="margin:0;align-self:center">Did you get it?</span><button class="btn small" type="button" data-self="yes">Yes</button><button class="btn small" type="button" data-self="no">Not yet</button></div>
            <p class="feedback" id="selfFeedback" aria-live="polite"></p></div>
        </section>
        <section class="chunk"><h2><span class="chunk-num">5</span>Go further</h2>
          <div class="link-list">${m.sourceUrl ? linkRow([m.sourceUrl, m.sourceLabel || 'Official documentation', 'Docs']) : ''}
          <button type="button" class="resource-link as-button" data-note><span class="tag" style="background:#ede9fe;color:#5b21b6">Notes</span>Save this step to my notes<span class="out">→</span></button></div>
        </section>
      </article>
      <div class="lesson-nav">
        ${i > 0 ? `<a class="btn" href="${lessonUrl(m.id, i - 1)}" rel="prev">← Previous</a>` : '<span></span>'}
        <div class="btn-row">
          <button class="btn ghost" type="button" data-status="skipped">Skip for now</button>
          <button class="btn yellow big" type="button" id="completeNext">${isLast ? 'Complete and finish module →' : 'Complete and next step →'}</button>
        </div>
      </div>
      <p class="hint-text center">Keyboard: <kbd>D</kbd> done · <kbd>L</kbd> in progress · <kbd>S</kbd> skip · <kbd>R</kbd> reset</p>
    </div></div>`);

    if (st === 'pending') { Progress.set(key, 'learning'); $('#lessonStatus').className = 'status-pill learning'; $('#lessonStatus').textContent = STATUS_LABEL.learning; }
    lessonKey = key;
    const ta = $('#lessonAnswer');
    ta.addEventListener('input', () => { const a = store.get(userKey('answers'), {}); a[key] = ta.value; store.set(userKey('answers'), a); });
    $('#revealAnswer').addEventListener('click', (e) => {
      const box = $('#answerBox'); box.hidden = !box.hidden;
      e.target.setAttribute('aria-expanded', String(!box.hidden));
      e.target.textContent = box.hidden ? 'Show the answer' : 'Hide the answer';
    });
    app.querySelector('.answer-box').addEventListener('click', (e) => {
      const b = e.target.closest('[data-self]'); if (!b) return;
      const fb = $('#selfFeedback');
      if (b.dataset.self === 'yes') { fb.className = 'feedback good'; fb.textContent = 'Great. Mark the step complete when you are ready.'; }
      else { fb.className = 'feedback'; fb.textContent = 'That is normal. Re-read the example and code, or save this step to your notes and come back later. It stays "In progress".'; }
    });
    $('#readAloud').addEventListener('click', (e) => speak([l.title, 'Goal. ' + l.objective, 'Example. ' + l.example, 'Try it. ' + l.practice, 'Check yourself. ' + l.check].join('. '), e.target));
    $('#focusReading').addEventListener('click', (e) => {
      const on = document.body.classList.toggle('focus-reading');
      e.target.setAttribute('aria-pressed', String(on));
      try { sessionStorage.setItem('sd:focusReading', on ? '1' : ''); } catch (err) { /* ignore */ }
    });
    $('[data-copy]').addEventListener('click', (e) => copyText(l.code, e.target));
    $('[data-note]').addEventListener('click', () => {
      const note = Notes.add(l.title, `${m.title} — step ${i + 1}: ${l.title}\n\nGoal: ${l.objective}\n\nMy notes:\n${answers[key] || ''}`);
      goNote(note.id);
    });
    $('#completeNext').addEventListener('click', () => {
      Progress.set(key, 'done');
      location.href = isLast ? `lesson.html?m=${m.id}&review=1` : lessonUrl(m.id, i + 1);
    });
    $('[data-status="skipped"]').addEventListener('click', () => {
      Progress.set(key, 'skipped');
      location.href = isLast ? `lesson.html?m=${m.id}&review=1` : lessonUrl(m.id, i + 1);
    });
  }
  let lessonKey = null;
  function setLessonStatus(st) {
    if (!lessonKey) return;
    Progress.set(lessonKey, st);
    const pill = $('#lessonStatus');
    if (pill) { pill.className = 'status-pill ' + st; pill.textContent = STATUS_LABEL[st]; }
    const idx = Number(lessonKey.split(':')[1]);
    const sq = $$('.steps .step')[idx];
    if (sq) sq.className = 'step ' + st + ' current';
    toast('Marked as ' + STATUS_LABEL[st].toLowerCase() + '.');
  }
  function copyText(text, btn) {
    const done = () => { btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => toast('Copy failed — select the text instead.'));
    else toast('Copy is not available — select the text instead.');
  }

  function renderModuleReview(m) {
    const s = Progress.moduleStats(m);
    const idx = MODULES.indexOf(m);
    const next = MODULES[idx + 1];
    const cert = certOf(m.id);
    document.title = m.title + ' review · Study Desk';
    setPage(`<div class="page lesson-page"><div class="container narrow">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="learn.html">Learn</a> › ${cert ? `<a href="learn.html#cert-${cert.id}">${esc(cert.title)}</a> › ` : ''}<span>${esc(m.title)}</span></nav>
      <div class="lesson-top"><div class="step-count">Module review</div>${stepSquares(m)}</div>
      <article class="card lesson readable">
        <h1>${s.done + s.skipped === s.total ? 'Module complete: ' : ''}${esc(m.title)}</h1>
        <p>${s.done} of ${s.total} steps done${s.skipped ? `, ${s.skipped} skipped (you can go back to them any time)` : ''}.</p>
        <div class="goal-box"><span class="chunk-label">You can now</span><p>${esc(m.outcome)}</p></div>
        <section class="chunk"><h2><span class="chunk-num">1</span>Quick quiz</h2>${quizBlock('mod-' + m.id, m.quiz, orderedChoices(m), m.answer)}</section>
        <section class="chunk"><h2><span class="chunk-num">2</span>Real-world example</h2><p>${esc(m.example)}</p></section>
        <section class="chunk"><h2><span class="chunk-num">3</span>Exercise</h2><p>${esc(m.exercise)}</p>
          <button class="btn small" type="button" id="exerciseNote">Start a note for this exercise</button></section>
        <section class="chunk"><h2><span class="chunk-num">4</span>Why employers care</h2>
          <ul class="skills">${(m.jobSkills || []).map((j) => `<li>${esc(j)}</li>`).join('')}</ul></section>
      </article>
      <div class="lesson-nav">
        <a class="btn" href="learn.html${cert ? '#cert-' + cert.id : ''}">← Back to Learn</a>
        ${next ? `<a class="btn yellow big" href="${lessonUrl(next.id, 0)}">Next module: ${esc(next.title)} →</a>` : '<a class="btn yellow big" href="projects.html">Build the projects →</a>'}
      </div>
    </div></div>`);
    wireQuizzes(app, { ['mod-' + m.id]: { right: 'That is the key idea of this module.', wrong: 'Not this one. Look back at the steps and try again.' } });
    $('#exerciseNote').addEventListener('click', () => { const n = Notes.add(m.title + ' — exercise', `Exercise: ${m.exercise}\n\nMy approach:\n`); goNote(n.id); });
  }

  /* ================= Roadmap (visual map + drawer) ================= */
  let currentRoadmap = null;
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
          <div class="rm-side left">${left.map(nodeHtml).join('')}</div>
          <div class="rm-center">${nodeHtml(sec.main)}</div>
          <div class="rm-side right">${right.map(nodeHtml).join('')}</div>
        </div>`;
      }).join('')}
      <div class="rm-end"><span class="btn yellow" style="pointer-events:none">Keep building →</span></div>
      <div class="rm-legend">
        <span><i style="background:var(--node)"></i>Module</span>
        <span><i style="background:var(--node-sub)"></i>Step</span>
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
    const solid = (d) => parts.push(`<path d="${d}" fill="none" style="stroke:var(--wire)" stroke-width="3.5" stroke-linecap="round"/>`);
    const dashed = (d) => parts.push(`<path d="${d}" fill="none" style="stroke:var(--wire)" stroke-width="2.5" stroke-dasharray="0.8 7" stroke-linecap="round"/>`);
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
    return `<div class="progress-line" id="progressLine"><span class="progress-badge">${pct}% DONE</span><span class="progress-text">${o.done} of ${o.total} done · ${o.learning} in progress · ${o.skipped} skipped</span>${bar(pct, 'Roadmap progress')}</div>`;
  }
  function renderFullRoadmap() {
    const sections = MODULES.map((m) => ({ main: { key: 'module:' + m.id, label: m.title, kind: 'main' }, children: m.lessons.map((l, i) => ({ key: m.id + ':' + i, label: l.title, kind: 'sub' })) }));
    currentRoadmap = { modules: MODULES };
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Roadmap']], title: 'Computer science roadmap',
        desc: 'The whole path on one map, in a suggested order. Yellow boxes are modules; light boxes are steps. Click any box to preview it, change its status, or open the full step.',
        actions: '<button class="btn dark small" type="button" data-action="resume">Resume where I left off</button><a class="btn small" href="learn.html">Learn view</a><button class="btn small" type="button" data-action="reset-progress">Reset progress</button>',
        extra: progressLine(MODULES) })}
      <div class="roadmap-wrap">${roadmapHtml('Computer Science', sections)}</div>
    </div></div>`);
    afterRoadmapRender();
  }
  function renderModuleRoadmap(id) {
    const m = byId(id);
    if (!m) return renderNotFound();
    const sections = [
      { main: { key: 'module:' + m.id, label: m.title, kind: 'main' }, children: m.lessons.map((l, i) => ({ key: m.id + ':' + i, label: l.title, kind: 'sub' })) },
      { main: { key: 'practice:' + m.id, label: 'Check yourself', kind: 'main' }, children: [
        { key: 'extra:' + m.id + ':example', label: 'Real-world example', kind: 'sub' },
        { key: 'extra:' + m.id + ':quiz', label: 'Quick quiz', kind: 'sub' },
        { key: 'extra:' + m.id + ':exercise', label: 'Exercise', kind: 'sub' },
        { key: 'extra:' + m.id + ':docs', label: 'Official docs', kind: 'sub' },
      ] },
    ];
    const idx = MODULES.indexOf(m);
    const prev = MODULES[idx - 1], next = MODULES[idx + 1];
    currentRoadmap = { modules: [m] };
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], ['roadmap.html', 'Roadmap'], [null, m.title]], title: m.title + ' roadmap',
        desc: esc(m.desc) + `<br><b>By the end:</b> ${esc(m.outcome)}`,
        actions: `<a class="btn dark small" href="${lessonUrl(m.id, (Progress.next([m]) || { i: 0 }).i)}">Study step by step →</a><button class="btn small" type="button" data-action="resume">Preview next step</button><a class="btn small" href="${esc(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(m.sourceLabel || 'Docs')} ↗</a><button class="btn small" type="button" data-action="reset-progress">Reset progress</button>`,
        extra: progressLine([m]) })}
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
    $('#roadmap').addEventListener('click', (e) => { const n = e.target.closest('.node'); if (n) openDrawer(n.dataset.node); });
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

  /* ---------- Drawer ---------- */
  let drawerKey = null;
  let lastFocus = null;
  function lessonFromKey(key) {
    const [mid, idx] = String(key).split(':');
    const m = byId(mid);
    if (!m || !/^\d+$/.test(idx || '')) return null;
    return { m, i: Number(idx), l: m.lessons[Number(idx)] };
  }
  function openDrawer(key) {
    if (!key) return;
    const body = $('#drawerBody');
    const trackable = !!lessonFromKey(key);
    let html = '';
    if (trackable) {
      const { m, i, l } = lessonFromKey(key);
      html = `<div class="kicker">${esc(m.title)} · Step ${i + 1} of ${m.lessons.length} ${timeTag(lessonMinutes(l))}</div>
        <h2 id="drawerTitle">${esc(l.title)}</h2>
        <div class="goal-box"><span class="chunk-label">Goal</span><p>${esc(l.objective)}</p></div>
        <h4>Example</h4><p>${esc(l.example)}</p>
        <pre class="code"><code>${esc(l.code)}</code></pre>
        <h4>Try it</h4><p>${esc(l.practice)}</p>
        <h4>Check yourself</h4><details class="reveal"><summary>${esc(l.check)}</summary><p style="margin:0">${esc(l.answer)}</p></details>
        <div class="btn-row" style="margin-top:18px">
          <a class="btn dark small" href="${lessonUrl(m.id, i)}">Open full step →</a>
          <button class="btn small" type="button" data-drawer="done-next">Mark done and preview next</button>
        </div>`;
    } else {
      const [kind, mid, extra] = key.split(':');
      const m = byId(mid);
      if (!m) return;
      if (kind === 'module') {
        const s = Progress.moduleStats(m);
        html = `<div class="kicker">${esc(m.code)}</div><h2 id="drawerTitle">${esc(m.title)}</h2><p>${esc(m.desc)}</p>
          <h4>By the end</h4><p>${esc(m.outcome)}</p>
          <h4>Steps · ${s.done} of ${s.total} done</h4>
          <div class="link-list">${m.lessons.map((l, i) => `<button type="button" class="resource-link as-button" data-open="${m.id}:${i}"><span class="status-pill ${Progress.get(m.id + ':' + i)}">${STATUS_LABEL[Progress.get(m.id + ':' + i)]}</span>${esc(l.title)}<span class="out">→</span></button>`).join('')}</div>
          <div class="btn-row" style="margin-top:18px"><a class="btn dark small" href="${lessonUrl(m.id, 0)}">Study step by step →</a><a class="btn small" href="roadmap.html?m=${esc(m.id)}">Module roadmap</a></div>`;
      } else if (kind === 'practice') {
        html = `<div class="kicker">${esc(m.title)}</div><h2 id="drawerTitle">Check yourself</h2><p>Use the example, quiz and exercise to test what you learned in this module.</p><a class="btn dark small" href="lesson.html?m=${m.id}&review=1">Open module review →</a>`;
      } else if (extra === 'example') {
        html = `<div class="kicker">${esc(m.title)}</div><h2 id="drawerTitle">Real-world example</h2><p>${esc(m.example)}</p>`;
      } else if (extra === 'exercise') {
        html = `<div class="kicker">${esc(m.title)}</div><h2 id="drawerTitle">Exercise</h2><p>${esc(m.exercise)}</p><div class="btn-row"><button class="btn small" type="button" data-drawer="note-exercise">Start a note for this exercise</button></div>`;
      } else if (extra === 'quiz') {
        html = `<div class="kicker">${esc(m.title)}</div><h2 id="drawerTitle">Quick quiz</h2>${quizBlock('mod-' + m.id, m.quiz, orderedChoices(m), m.answer)}`;
      } else if (extra === 'docs') {
        html = `<div class="kicker">${esc(m.title)}</div><h2 id="drawerTitle">Official docs</h2><p>Read the primary source alongside the steps.</p><div class="link-list">${linkRow([m.sourceUrl, m.sourceLabel || 'Documentation', 'Docs'])}</div>`;
      }
    }
    drawerKey = key;
    body.innerHTML = html + (trackable ? '<div class="drawer-hint">Shortcuts: <kbd>D</kbd> done · <kbd>L</kbd> in progress · <kbd>S</kbd> skip · <kbd>R</kbd> reset · <kbd>Esc</kbd> close</div>' : '');
    $('#drawerStatus').hidden = !trackable;
    $('#drawerPill').hidden = !trackable;
    paintDrawerStatus();
    wireQuizzes(body, { ['mod-' + key.split(':')[1]]: { right: 'That is the key idea of this module.', wrong: 'Not this one. Re-read the steps and try again.' } });
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
    $('#drawerPill').className = 'status-pill ' + st;
    $('#drawerPill').textContent = STATUS_LABEL[st];
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
    const nm = list[list.indexOf(m) + 1];
    return nm ? nm.id + ':0' : null;
  }
  $('#drawerStatus').addEventListener('change', (e) => setDrawerStatus(e.target.value));
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#drawerBackdrop').addEventListener('click', closeDrawer);
  $('#drawerBody').addEventListener('click', (e) => {
    const t = e.target.closest('[data-drawer],[data-open]');
    if (!t) return;
    if (t.dataset.open) return openDrawer(t.dataset.open);
    if (t.dataset.drawer === 'done-next') {
      const key = drawerKey;
      setDrawerStatus('done');
      const nk = nextLessonKey(key);
      if (nk) openDrawer(nk); else { closeDrawer(); toast('Roadmap complete — well done!'); }
    } else if (t.dataset.drawer === 'note-exercise') {
      const m = byId(drawerKey.split(':')[1]);
      const note = Notes.add(m.title + ' — exercise', `Exercise: ${m.exercise}\n\nMy approach:\n`);
      closeDrawer();
      goNote(note.id);
    }
  });

  /* ================= Practice (challenge bank) ================= */
  const LEVELS = ['Warm-up', 'Easy', 'Medium'];
  let practiceFilter = 'All';
  function renderPractice() {
    const id = params.get('c');
    if (id) return renderChallenge(id);
    const solvedCount = CHALLENGES.filter((c) => Solved.has(c.id)).length;
    const list = CHALLENGES.filter((c) => practiceFilter === 'All' || c.level === practiceFilter);
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Practice']], title: 'Coding challenges',
        desc: 'Problems in the style of the HackerRank and Codility tests used by Irish employers. Write JavaScript in the browser and run the tests. Each one has hints and a reference solution in JavaScript and Java.',
        actions: '<button class="btn small" type="button" data-action="focus">Focus mode</button>',
        extra: `<div class="progress-line"><span class="progress-badge">${solvedCount}/${CHALLENGES.length}</span><span class="progress-text">challenges solved</span>${bar(Math.round((solvedCount / CHALLENGES.length) * 100), 'Challenges solved')}</div>` })}
      <div class="chip-row left" role="group" aria-label="Filter by level">${['All', ...LEVELS].map((l) => `<button type="button" class="chip light${l === practiceFilter ? ' active' : ''}" data-level="${l}" aria-pressed="${l === practiceFilter}">${l}</button>`).join('')}</div>
      <div class="challenge-list">${list.map((c) => `<a class="challenge-row" href="practice.html?c=${c.id}">
          <span class="proj-check ${Solved.has(c.id) ? 'done' : ''}" aria-hidden="true">${Solved.has(c.id) ? '✓' : ''}</span>
          <span class="challenge-main"><b>${esc(c.title)}</b><small>${esc(c.pattern)} · ${esc(byId(c.module).title)}</small></span>
          <span class="level ${c.level.toLowerCase()}">${c.level}</span>
          ${timeTag(c.minutes)}
          ${Solved.has(c.id) ? '<span class="sr-only">Solved</span>' : ''}</a>`).join('')}</div>
      <div class="h-section">Quick checks <span>No code, just reasoning</span></div>
      <div class="grid-2">
        <div class="card"><div class="kicker">Object-oriented design</div><h3>Give each class one job</h3>
          <p>In a checkout system, a <code class="inline">Cart</code> stores items and calculates a subtotal. A <code class="inline">TaxPolicy</code> applies the local tax rule.</p>
          ${quizBlock('oop-tax', 'Which class should change when the tax rate changes?', [{ text: 'Cart', i: 0 }, { text: 'TaxPolicy', i: 1 }, { text: 'Both of them', i: 2 }], 1)}</div>
        <div class="card"><div class="kicker">Algorithms</div><h3>Halve the range</h3>
          <p>For a sorted array, one search method repeatedly halves the remaining range.</p>
          ${quizBlock('bsearch', 'Which search method is it?', [{ text: 'Depth-first search', i: 0 }, { text: 'Binary search', i: 1 }, { text: 'Linear search', i: 2 }], 1)}</div>
      </div>
    </div></div>`);
    $$('[data-level]', app).forEach((b) => b.addEventListener('click', () => { practiceFilter = b.dataset.level; renderPractice(); }));
    wireQuizzes(app, {
      'oop-tax': { right: 'Tax rules live in TaxPolicy, so a rate change touches only that class.', wrong: 'Think about which class owns the tax rule. Cart should not need to change.' },
      bsearch: { right: 'Binary search halves the range each step, so it runs in O(log n).', wrong: 'That one does not use the sorted order. Which method halves the range?' },
    });
  }

  function renderChallenge(id) {
    const c = challengeById(id);
    if (!c) return renderNotFound();
    const drafts = store.get(userKey('drafts'), {});
    const idx = CHALLENGES.indexOf(c);
    const next = CHALLENGES[idx + 1];
    document.title = c.title + ' · Practice · Study Desk';
    setPage(`<div class="page"><div class="container wide">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="practice.html">Practice</a> › <span>${esc(c.title)}</span></nav>
      <div class="challenge-layout">
        <section class="card readable" aria-labelledby="chTitle">
          <div class="kicker">${esc(c.pattern)} · <a href="${lessonUrl(c.module, 0)}">${esc(byId(c.module).title)}</a></div>
          <h1 id="chTitle" class="ch-title">${esc(c.title)} <span class="level ${c.level.toLowerCase()}">${c.level}</span></h1>
          ${timeTag(c.minutes)}
          <p>${esc(c.prompt)}</p>
          <h4>Examples</h4>
          <pre class="code light">${c.examples.map(esc).join('\n')}</pre>
          <h4>Function to write</h4><p><code class="inline">${esc(c.fn)}</code></p>
          <details class="reveal"><summary>Show a hint</summary><p style="margin:0">${esc(c.hint)}</p></details>
          <details class="reveal" style="margin-top:8px" id="solutionBox"><summary>Show the reference solutions</summary>
            <p class="hint-text">Try for at least 15 minutes first. Reading a solution after a real attempt still teaches you a lot.</p>
            <div class="tabs" role="tablist"><button role="tab" type="button" class="tab active" data-tab="js" aria-selected="true">JavaScript</button><button role="tab" type="button" class="tab" data-tab="java" aria-selected="false">Java</button></div>
            <pre class="code" data-panel="js"><code>${esc(c.solution)}</code></pre>
            <pre class="code" data-panel="java" hidden><code>${esc(c.java)}</code></pre>
            <p><b>Complexity:</b> ${esc(c.complexity)}</p>
          </details>
        </section>
        <section class="card editor-card" aria-label="Code editor and tests">
          <label class="sr-only" for="challengeCode">Your code</label>
          <textarea class="textarea code-editor" id="challengeCode" spellcheck="false" autocapitalize="off" autocomplete="off">${esc(drafts[c.id] || c.starter)}</textarea>
          <div class="btn-row" style="margin-top:10px">
            <button class="btn dark" type="button" id="runChallenge">Run the tests (Ctrl + Enter)</button>
            <button class="btn" type="button" id="resetChallenge">Reset code</button>
            <button class="btn ghost" type="button" data-action="focus">Focus timer</button>
          </div>
          <h4>Tests</h4>
          <ul class="test-list" id="testList" aria-live="polite">${c.tests.map((t, i) => `<li class="test" data-test="${i}"><span class="test-icon" aria-hidden="true">○</span><span>${esc(testLabel(c, t))}</span></li>`).join('')}</ul>
          <div class="test-summary" id="testSummary">${Solved.has(c.id) ? '✓ You have solved this before.' : 'Run the tests to check your code.'}</div>
          ${next ? `<a class="btn small" style="margin-top:10px" href="practice.html?c=${next.id}">Next challenge: ${esc(next.title)} →</a>` : ''}
        </section>
      </div>
    </div></div>`);
    const code = $('#challengeCode');
    const saveDraft = () => { const d = store.get(userKey('drafts'), {}); d[c.id] = code.value; store.set(userKey('drafts'), d); };
    code.addEventListener('input', saveDraft);
    code.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); code.setRangeText('  ', code.selectionStart, code.selectionEnd, 'end'); saveDraft(); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runChallenge(c, code.value); }
    });
    $('#resetChallenge').addEventListener('click', () => { if (!confirm('Replace your code with the starter code?')) return; code.value = c.starter; saveDraft(); resetTests(); });
    $('#runChallenge').addEventListener('click', () => runChallenge(c, code.value));
    $$('.tab', app).forEach((t) => t.addEventListener('click', () => {
      $$('.tab', app).forEach((x) => { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', String(x === t)); });
      $$('[data-panel]', app).forEach((p) => { p.hidden = p.dataset.panel !== t.dataset.tab; });
    }));
  }
  function testLabel(c, t) {
    if (c.custom) return t.name + ' → ' + JSON.stringify(t.expected);
    return c.fn + '(' + t.args.map((a) => JSON.stringify(a)).join(', ') + ') → ' + JSON.stringify(t.expected);
  }
  function resetTests() {
    $$('#testList .test').forEach((li) => { li.className = 'test'; $('.test-icon', li).textContent = '○'; const d = $('.test-detail', li); if (d) d.remove(); });
    $('#testSummary').textContent = 'Run the tests to check your code.';
    $('#testSummary').className = 'test-summary';
  }
  // Runs user code in a Web Worker with a time limit so loops cannot freeze the page.
  function runChallenge(c, source) {
    const btn = $('#runChallenge');
    const summary = $('#testSummary');
    resetTests();
    summary.textContent = 'Running…';
    btn.disabled = true;
    const workerSrc = `self.onmessage = function (e) {
      const { source, fn, tests, custom } = e.data;
      let target;
      try { target = new Function(source + '\\n;return typeof ' + fn + ' !== "undefined" ? ' + fn + ' : undefined;')(); }
      catch (err) { self.postMessage({ error: 'Your code has a syntax error: ' + err.message }); return; }
      if (target === undefined) { self.postMessage({ error: 'Define ' + (custom ? 'a class' : 'a function') + ' named ' + fn + '.' }); return; }
      const results = tests.map((t) => {
        try {
          const got = custom ? new Function(fn, t.run)(target) : target(...t.args);
          const pass = JSON.stringify(got) === JSON.stringify(t.expected);
          return { pass, got: got === undefined ? 'undefined' : JSON.stringify(got) };
        } catch (err) { return { pass: false, got: 'Error: ' + err.message }; }
      });
      self.postMessage({ results });
    };`;
    let worker;
    try { worker = new Worker(URL.createObjectURL(new Blob([workerSrc], { type: 'text/javascript' }))); }
    catch (e) { summary.textContent = 'This browser blocked the code runner: ' + e.message; btn.disabled = false; return; }
    const finish = () => { clearTimeout(timer); worker.terminate(); btn.disabled = false; };
    const timer = setTimeout(() => { finish(); summary.className = 'test-summary bad'; summary.textContent = '✗ Stopped after 3 seconds. Check for a loop that never ends.'; }, 3000);
    worker.onmessage = (e) => {
      finish();
      if (e.data.error) { summary.className = 'test-summary bad'; summary.textContent = '✗ ' + e.data.error; return; }
      const r = e.data.results;
      r.forEach((res, i) => {
        const li = $(`#testList [data-test="${i}"]`);
        li.className = 'test ' + (res.pass ? 'pass' : 'fail');
        $('.test-icon', li).textContent = res.pass ? '✓' : '✗';
        if (!res.pass) li.insertAdjacentHTML('beforeend', `<small class="test-detail">Your result: ${esc(res.got)}</small>`);
      });
      const passed = r.filter((x) => x.pass).length;
      const all = passed === r.length;
      summary.className = 'test-summary ' + (all ? 'good' : 'bad');
      summary.textContent = all ? `✓ All ${r.length} tests pass. Well done! Now read the reference solution and compare.` : `${passed} of ${r.length} tests pass. Look at the first failing test — you are getting closer.`;
      if (all) { Solved.add(c.id); toast('Challenge solved!'); }
    };
    worker.onerror = (e) => { finish(); summary.className = 'test-summary bad'; summary.textContent = '✗ ' + (e.message || 'Error running code'); e.preventDefault(); };
    worker.postMessage({ source, fn: c.fn, tests: c.tests, custom: !!c.custom });
  }

  /* ================= Projects ================= */
  function renderProjects() {
    const id = params.get('p');
    if (id) return renderProject(id);
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Projects']], title: 'Portfolio projects',
        desc: 'Each certification ends with projects described as user stories, like a real ticket. Tick each story when your project meets it. These are the projects to link on your CV and GitHub.' })}
      ${CERTS.map((c) => `<div class="h-section">${esc(c.title)}</div><div class="grid-2">${c.projects.map(projectById).map((p) => {
        const n = ProjectProgress.count(p);
        return `<a class="card project-card" href="projects.html?p=${p.id}"><div class="kicker">${esc(p.stack)} · ${esc(p.hours)}</div><h3>${ProjectProgress.complete(p) ? '✓ ' : ''}${esc(p.title)}</h3><p>${esc(p.summary)}</p>
          <div class="progress-line" style="margin:0"><span class="progress-text">${n}/${p.stories.length} user stories</span>${bar(Math.round((n / p.stories.length) * 100), p.title)}</div></a>`;
      }).join('')}</div>`).join('')}
    </div></div>`);
  }
  function renderProject(id) {
    const p = projectById(id);
    if (!p) return renderNotFound();
    const cert = CERTS.find((c) => c.id === p.cert);
    const state = ProjectProgress.get(p.id);
    document.title = p.title + ' · Projects · Study Desk';
    setPage(`<div class="page"><div class="container narrow">
      ${pageHead({ crumbs: [['projects.html', 'Projects'], [null, cert.title]], title: p.title, desc: esc(p.summary) + `<br><b>Stack:</b> ${esc(p.stack)} · <b>Time:</b> ${esc(p.hours)}`, extra: `<div class="progress-line" id="projProgress"></div>` })}
      <div class="card readable">
        <h2>User stories</h2>
        <p class="hint-text">Tick a story when your project does it. Work on one at a time.</p>
        <div id="stories">${p.stories.map((s, i) => `<div class="check-row"><input type="checkbox" id="story-${i}" data-story="${i}"${state.stories[i] ? ' checked' : ''}><label for="story-${i}">${esc(s)}</label></div>`).join('')}</div>
        <h2 style="margin-top:20px">Stretch goals</h2>
        <ul>${p.stretch.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        <h2 style="margin-top:20px">Your repository</h2>
        <label class="field"><span>GitHub URL (saved on this device)</span><input class="input" id="repoUrl" type="url" placeholder="https://github.com/you/project" value="${esc(state.repo || '')}"></label>
        <h2 style="margin-top:20px">CV bullet</h2>
        <p class="cv-line" id="cvLine">${esc(p.cv)}</p>
        <button class="btn small" type="button" id="copyCv">Copy</button>
        <h2 style="margin-top:20px">Learn the skills</h2>
        <div class="link-list">${cert.modules.map(byId).map((m) => `<a class="resource-link" href="${lessonUrl(m.id, 0)}"><span class="tag" style="background:#fef9c3;color:#713f12">Module</span>${esc(m.title)}<span class="out">→</span></a>`).join('')}</div>
      </div>
    </div></div>`);
    const paint = () => {
      const n = ProjectProgress.count(p);
      $('#projProgress').innerHTML = `<span class="progress-badge">${n}/${p.stories.length}</span><span class="progress-text">${n === p.stories.length ? 'All user stories done — project complete!' : 'user stories done'}</span>${bar(Math.round((n / p.stories.length) * 100), 'Project progress')}`;
    };
    paint();
    $('#stories').addEventListener('change', (e) => {
      const i = e.target.dataset.story; if (i == null) return;
      const st = ProjectProgress.get(p.id);
      if (e.target.checked) st.stories[i] = true; else delete st.stories[i];
      ProjectProgress.set(p.id, st);
      paint();
      if (ProjectProgress.complete(p)) toast('Project complete. Add it to your CV!');
    });
    $('#repoUrl').addEventListener('change', (e) => { const st = ProjectProgress.get(p.id); st.repo = e.target.value.trim(); ProjectProgress.set(p.id, st); toast('Repository link saved.'); });
    $('#copyCv').addEventListener('click', (e) => copyText(p.cv, e.target));
  }

  /* ================= Interview prep ================= */
  const TECH_PROMPTS = [
    { q: 'Explain the difference between an ArrayList and a LinkedList.', hint: 'Access cost, insertion cost, memory, when you would use each.' },
    { q: 'How does a HashMap work internally?', hint: 'hashCode, buckets, collisions, resizing, equals/hashCode contract.' },
    { q: 'What happens when you type a URL into the browser?', hint: 'DNS, TCP/TLS, HTTP request, server, rendering.' },
    { q: 'What is the time complexity of binary search, and why?', hint: 'Each step halves the remaining range.' },
    { q: 'How would you find a slow database query?', hint: 'Query logs, EXPLAIN, indexes, N+1 queries.' },
    { q: 'What is the difference between a process and a thread?', hint: 'Memory, scheduling and one concurrency risk.' },
    { q: 'How do interfaces help keep a service testable?', hint: 'Dependency injection and test doubles.' },
    { q: 'How do you protect an app from SQL injection?', hint: 'Parameterised queries; why escaping is not enough.' },
    { q: 'What are the four pillars of OOP?', hint: 'Encapsulation, abstraction, inheritance, polymorphism — with an example each.' },
    { q: 'What is the difference between unit and integration tests?', hint: 'Scope, speed, what each catches.' },
  ];
  const STAR_PROMPTS = [
    { q: 'Tell me about a time you worked in a team.', hint: 'Your role, a challenge, what you did, the result.' },
    { q: 'Tell me about a mistake you made and what you learned.', hint: 'Own it, show the fix and what you changed.' },
    { q: 'Describe a time you had to learn something quickly.', hint: 'How you learned, how you checked understanding.' },
    { q: 'Tell me about a time you received feedback.', hint: 'Listen, act on it, show the result.' },
    { q: 'Describe a project you are proud of.', hint: 'Technical choices, a problem you solved, impact.' },
    { q: 'Tell me about a time you disagreed with someone.', hint: 'Respectful, evidence-based, outcome.' },
    { q: 'Why do you want to intern with us?', hint: 'Research the company: product, tech stack, values.' },
  ];
  let promptState = { deck: 'tech', index: -1 };
  const ivTimer = { total: 900, left: 900, id: null };
  function renderInterview() {
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Interview prep']], title: 'Interview prep',
        desc: 'Practise explaining your thinking out loud. Use the timer only if you want it — practising calmly first is a good way to start.',
        actions: '<a class="btn small" href="practice.html">Coding challenges →</a><a class="btn small" href="lesson.html?m=teamwork-career&i=3">Learn STAR →</a>' })}
      <div class="card process">
        <h2>What the process usually looks like in Ireland</h2>
        <ol class="flow"><li><b>Apply</b> online form and CV</li><li><b>Online test</b> often HackerRank: 1 easy + 1 medium problem, sometimes SQL</li><li><b>Behavioural</b> STAR questions about teamwork and learning</li><li><b>Technical</b> live coding and talking through your approach</li><li><b>Offer</b></li></ol>
        <p class="hint-text">Based on candidate reports from Microsoft, IBM, Udemy, HubSpot and Amazon in Dublin (2024–2025). Each company differs; ask the recruiter what to expect. It is fine to ask for adjustments, such as extra time or written questions, if you need them.</p>
      </div>
      <div class="grid-2" style="margin-top:14px">
        <div class="card"><div class="kicker">Prompt deck</div><h2>Practise a question</h2>
          <div class="tabs" role="tablist"><button role="tab" type="button" class="tab ${promptState.deck === 'tech' ? 'active' : ''}" data-deck="tech" aria-selected="${promptState.deck === 'tech'}">Technical</button><button role="tab" type="button" class="tab ${promptState.deck === 'star' ? 'active' : ''}" data-deck="star" aria-selected="${promptState.deck === 'star'}">Behavioural (STAR)</button></div>
          <div class="prompt-card" id="promptCard"><b>Press “Show a question” to begin.</b><span>${TECH_PROMPTS.length} technical and ${STAR_PROMPTS.length} behavioural questions.</span></div>
          <div class="btn-row"><button class="btn dark small" type="button" id="showPrompt">Show a question</button><button class="btn small" type="button" id="savePrompt" disabled>Answer in notes</button></div>
          <p class="hint-text" id="starHelp" ${promptState.deck === 'star' ? '' : 'hidden'}><b>STAR:</b> Situation (1–2 sentences) · Task (your responsibility) · Action (most of the answer, say "I") · Result (what changed and what you learned). Aim for about 2 minutes.</p>
        </div>
        <div class="card"><div class="kicker">Timed practice (optional)</div><h2>One focused round</h2>
          <p>Solve a challenge and narrate your approach before the timer ends.</p>
          <div class="timer" id="ivTimer" aria-live="off">${fmtTime(ivTimer.left)}</div>
          <div class="btn-row"><button class="btn dark small" type="button" id="ivStart">Start 15 min</button><button class="btn small" type="button" id="ivReset">Reset</button></div>
          <p class="hint-text" style="margin-top:12px">Method: understand → match a pattern → plan → implement → review → evaluate complexity.</p>
        </div>
      </div>
    </div></div>`);
    paintIvTimer();
    $$('[data-deck]', app).forEach((t) => t.addEventListener('click', () => { promptState = { deck: t.dataset.deck, index: -1 }; renderInterview(); }));
    $('#showPrompt').addEventListener('click', () => {
      const deck = promptState.deck === 'star' ? STAR_PROMPTS : TECH_PROMPTS;
      let n;
      do { n = Math.floor(Math.random() * deck.length); } while (deck.length > 1 && n === promptState.index);
      promptState.index = n;
      $('#promptCard').innerHTML = `<b>${esc(deck[n].q)}</b><span>${esc(deck[n].hint)}</span>`;
      $('#showPrompt').textContent = 'Next question';
      $('#savePrompt').disabled = false;
    });
    $('#savePrompt').addEventListener('click', () => {
      const deck = promptState.deck === 'star' ? STAR_PROMPTS : TECH_PROMPTS;
      const p = deck[promptState.index];
      const body = promptState.deck === 'star' ? `Question: ${p.q}\n\nSituation:\n\nTask:\n\nAction:\n\nResult:\n` : `Question: ${p.q}\nHint: ${p.hint}\n\nMy answer:\n`;
      const note = Notes.add('Interview: ' + p.q, body);
      goNote(note.id);
    });
    $('#ivStart').addEventListener('click', toggleIvTimer);
    $('#ivReset').addEventListener('click', () => { clearInterval(ivTimer.id); ivTimer.id = null; ivTimer.left = ivTimer.total; paintIvTimer(); });
  }
  function paintIvTimer() {
    const t = $('#ivTimer'), b = $('#ivStart');
    if (t) t.textContent = fmtTime(ivTimer.left);
    if (b) b.textContent = ivTimer.id ? 'Pause' : ivTimer.left === ivTimer.total ? 'Start 15 min' : ivTimer.left === 0 ? 'Start again' : 'Resume';
  }
  function toggleIvTimer() {
    if (ivTimer.id) { clearInterval(ivTimer.id); ivTimer.id = null; paintIvTimer(); return; }
    if (ivTimer.left === 0) ivTimer.left = ivTimer.total;
    ivTimer.id = setInterval(() => {
      ivTimer.left = Math.max(0, ivTimer.left - 1);
      if (ivTimer.left === 0) { clearInterval(ivTimer.id); ivTimer.id = null; toast('Practice round complete.'); }
      paintIvTimer();
    }, 1000);
    paintIvTimer();
  }

  /* ================= Community ================= */
  const TOPICS = 'sd:topics';
  function renderCommunity() {
    const user = Auth.current();
    const topics = store.get(TOPICS, []);
    const me = user ? user.username : 'Guest';
    setPage(`<div class="page"><div class="container narrow">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Community']], title: 'Community',
        desc: 'Ask a focused question about a step or exercise. Discussions are saved in this browser and shared between accounts on this device.',
        actions: '<button class="btn dark small" type="button" id="newTopic">Start a discussion</button>' })}
      <form class="card" id="topicForm" hidden style="margin-bottom:14px">
        <div class="kicker">New discussion · posting as ${esc(me)}</div>
        <label class="field"><span>Title</span><input class="input" id="topicTitle" maxlength="90" placeholder="What are you working through?"></label>
        <label class="field"><span>Details</span><textarea class="textarea" id="topicBody" maxlength="2000" placeholder="What did you try? What happened? What did you expect?"></textarea></label>
        <label class="field"><span>Module (optional)</span><select class="input" id="topicModule"><option value="">General</option>${MODULES.map((m) => `<option value="${m.id}">${esc(m.title)}</option>`).join('')}</select></label>
        <div class="form-error" id="topicError"></div>
        <div class="btn-row"><button class="btn dark small" type="submit">Post</button><button class="btn ghost small" type="button" id="cancelTopic">Cancel</button></div>
      </form>
      <div id="topicList">${topics.length ? topics.map((t) => {
        const canDelete = Auth.isAdmin() || t.author === me;
        const mod = t.module && byId(t.module);
        return `<article class="topic" data-id="${esc(t.id)}"><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p>
          <div class="topic-meta"><span class="avatar small" aria-hidden="true">${esc(t.author[0].toUpperCase())}</span>${esc(t.author)} · ${fmtDate(t.createdAt)}${mod ? ` · <a href="roadmap.html?m=${mod.id}">${esc(mod.title)}</a>` : ''}
          ${canDelete ? `<button class="btn ghost small danger" type="button" data-delete="${esc(t.id)}">Delete</button>` : ''}</div></article>`;
      }).join('') : '<div class="empty"><b>No discussions yet.</b>Ask about a concept, share a debugging clue or compare approaches to an exercise.<div style="margin-top:12px"><button class="btn small" type="button" id="emptyNewTopic">Start a discussion</button></div></div>'}</div>
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

  /* ================= Career ================= */
  const MUST_HAVE = [
    ['chk-lang', 'Coding proficiency in one language: Java, Python, C++ or JavaScript', 'java-fundamentals'],
    ['chk-ds', 'Data structures: arrays, hash maps, stacks, queues, linked lists, trees, heaps, graphs', 'data-structures'],
    ['chk-algo', 'Algorithms: searching, sorting, recursion, BFS/DFS, dynamic programming, Big-O', 'algorithms'],
    ['chk-oop', 'Object-oriented and software design principles', 'oop'],
    ['chk-oa', 'Solve an easy and a medium problem under time pressure (online assessment)', 'coding-assessments'],
    ['chk-comm', 'Communicate clearly: explain your code and answer STAR questions', 'teamwork-career'],
  ];
  const NICE_TO_HAVE = [
    ['chk-git', 'Git and GitHub: branches, pull requests, code review', 'git'],
    ['chk-test', 'Unit and integration testing (JUnit, Jest, pytest)', 'testing'],
    ['chk-api', 'Building or consuming REST APIs', 'rest-apis'],
    ['chk-sql', 'SQL and relational databases', 'databases'],
    ['chk-web', 'Modern web frameworks: React, TypeScript', 'web-development'],
    ['chk-agile', 'Agile / Scrum teamwork', 'teamwork-career'],
    ['chk-cloud', 'Linux, Docker, CI/CD and cloud basics', 'devops-cloud'],
    ['chk-sec', 'Secure coding awareness', 'security'],
  ];
  const WEEK_PLAN = [
    ['w1', 'Weeks 1–2', 'Java fundamentals and Object-oriented design. Build the Gradebook CLI.'],
    ['w3', 'Weeks 3–4', 'Data structures and Algorithms. Solve all Warm-up and Easy challenges.'],
    ['w5', 'Weeks 5–6', 'Git, Testing and Databases. Start the Task Tracker API with tests.'],
    ['w7', 'Weeks 7–8', 'REST APIs and Web security. Finish the Task Tracker API.'],
    ['w9', 'Weeks 9–10', 'Web development and TypeScript. Build the front end; deploy with Docker and CI.'],
    ['w11', 'Weeks 11–12', 'Coding assessments and STAR practice. Medium challenges, mock interviews, apply to 15 roles.'],
  ];
  const JOB_LINKS = [
    ['https://gradireland.com/internships', 'Internships and placements', 'gradireland'],
    ['https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern&location=Ireland', 'Software engineer intern roles', 'LinkedIn'],
    ['https://ie.indeed.com/q-software-intern-jobs.html', 'Software intern roles', 'Indeed'],
    ['https://www.irishjobs.ie/jobs/software-intern', 'Software intern roles', 'IrishJobs.ie'],
    ['https://builtindublin.ie/jobs/internships', 'Dublin tech internships', 'Built In Dublin'],
  ];
  const SOURCE_LINKS = [
    ['https://www.irishjobs.ie/job/software-engineering-intern/google-ireland-ltd-job105937367', 'Google: Software Engineering / SRE Intern, Dublin', 'Job post'],
    ['https://job-boards.greenhouse.io/mdbgeneralreferrals/jobs/7211860', 'MongoDB: Software Engineering Intern, Dublin', 'Job post'],
    ['https://internships-ireland.ie/internships/cmmih1t6r000tpbgiwcspo29n', 'Intel: Software Engineering Intern', 'Job post'],
    ['https://www.ziprecruiter.ie/jobs/648662250-software-engineering-intern-apple-services-dublin-ireland-at-apple', 'Apple: Software Engineering Intern, Dublin', 'Job post'],
    ['https://builtindublin.ie/job/intern-software-engineer/7625794', 'Autodesk: Intern Software Engineer, Dublin', 'Job post'],
    ['https://gradireland.com/career-sectors/it-and-telecoms/what-skills-are-employers-seeking-in-it-graduates', 'What skills employers seek in IT graduates', 'gradireland'],
  ];
  function renderCareer() {
    const checks = store.get(userKey('career'), {});
    const row = ([id, text, mod]) => `<div class="check-row"><input type="checkbox" id="${id}" data-check="${id}"${checks[id] ? ' checked' : ''}><label for="${id}">${esc(text)}${mod ? ` — <a href="${lessonUrl(mod, 0)}">${esc(byId(mod).title)}</a>` : ''}</label></div>`;
    const weekRow = ([id, when, text]) => `<div class="check-row"><input type="checkbox" id="${id}" data-check="${id}"${checks[id] ? ' checked' : ''}><label for="${id}"><b>${esc(when)}:</b> ${esc(text)}</label></div>`;
    const all = [...MUST_HAVE, ...NICE_TO_HAVE, ...WEEK_PLAN];
    const doneCount = all.filter(([id]) => checks[id]).length;
    setPage(`<div class="page"><div class="container">
      ${pageHead({ crumbs: [['index.html', 'Home'], [null, 'Career']], title: 'Software internships in Ireland',
        desc: 'What Irish employers ask for in software engineering internship posts (2024–2026), a 12-week plan, and where to search.',
        actions: '<button class="btn dark small" type="button" id="downloadChecklist">Download checklist</button>' })}
      <div class="progress-line" style="margin:0 0 14px"><span class="progress-badge" id="careerBadge">${doneCount}/${all.length}</span><span class="progress-text">checklist items complete</span></div>
      <div class="grid-2">
        <div class="card"><div class="kicker">Asked for in almost every post</div><h2>Core requirements</h2>${MUST_HAVE.map(row).join('')}</div>
        <div class="card"><div class="kicker">Often listed as preferred</div><h2>Stand-out skills</h2>${NICE_TO_HAVE.map(row).join('')}</div>
      </div>
      <div class="card" style="margin-top:14px"><h2>Also worth knowing</h2>
        <ul class="plain-list">
          <li>Most posts want a student in a computer science or related degree, often in the penultimate year, with at least one semester left after the internship.</li>
          <li>Some roles need the right to work in Ireland for the whole internship; sponsorship varies by employer.</li>
          <li>Internships usually run 10–17 weeks from May–July (6–12 months for some placements). Interns in Ireland are almost always paid.</li>
          <li>Employers surveyed by gradireland most often say graduates need stronger communication skills. Practise explaining your code.</li>
          <li>You can ask employers for reasonable accommodations in assessments and interviews. AHEAD (ahead.ie) runs the WAM programme supporting graduates with disabilities into work.</li>
        </ul></div>
      <div class="h-section">Your 12-week internship plan</div>
      <div class="card">${WEEK_PLAN.map(weekRow).join('')}</div>
      <div class="grid-2" style="margin-top:14px">
        <div><div class="h-section" style="margin-top:0">Where to search</div><div class="link-list">${JOB_LINKS.map(linkRow).join('')}</div></div>
        <div><div class="h-section" style="margin-top:0">Sources for these requirements</div><div class="link-list">${SOURCE_LINKS.map(linkRow).join('')}</div></div>
      </div>
    </div></div>`);
    app.addEventListener('change', onCareerCheck);
    $('#downloadChecklist').addEventListener('click', () => {
      const c = store.get(userKey('career'), {});
      const mark = (id) => (c[id] ? '[x]' : '[ ]');
      const text = ['STUDY DESK — IRISH SOFTWARE INTERNSHIP CHECKLIST', 'Generated ' + new Date().toLocaleDateString(), '',
        'CORE REQUIREMENTS', ...MUST_HAVE.map(([id, t]) => `${mark(id)} ${t}`), '',
        'STAND-OUT SKILLS', ...NICE_TO_HAVE.map(([id, t]) => `${mark(id)} ${t}`), '',
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
    const badge = $('#careerBadge');
    if (badge) badge.textContent = Object.keys(c).length + '/' + (MUST_HAVE.length + NICE_TO_HAVE.length + WEEK_PLAN.length);
  }

  /* ================= Notes ================= */
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
            : `<div class="empty" style="padding:20px">${notes.length ? 'No notes match your search.' : '<b>No notes yet</b>Click “New note”, or save any step from its lesson page.'}</div>`}</div>
        </div>
        <div>${active ? `<form class="card readable" id="noteEditor">
            <label class="field"><span>Title</span><input class="input" id="noteTitle" maxlength="120" value="${esc(active.title)}"></label>
            <label class="field"><span>Note</span><textarea class="textarea" id="noteBody" style="min-height:300px">${esc(active.body)}</textarea></label>
            <div class="btn-row"><button class="btn dark small" type="submit">Save</button><button class="btn ghost small danger" type="button" id="deleteNote">Delete</button><a class="btn ghost small" href="notes.html">Close</a>
            <span class="hint-text" style="margin:0 0 0 auto;align-self:center">Last saved ${fmtDate(active.updatedAt)}</span></div>
          </form>` : '<div class="empty"><b>Select a note</b>or create a new one.</div>'}</div>
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

  /* ================= Auth UI ================= */
  let authMode = 'login';
  function renderNavUser() {
    const u = Auth.current();
    $('#navRight').innerHTML = u
      ? `<button type="button" class="nav-user" id="accountBtn" title="${u.role === 'admin' ? 'Signed in as admin' : 'Change password'}"><span class="avatar" aria-hidden="true">${esc(u.username[0].toUpperCase())}</span><span class="uname">${esc(u.username)}</span>${u.role === 'admin' ? '<span class="role-badge">ADMIN</span>' : ''}</button><button class="btn small" type="button" id="logoutBtn">Log out</button>`
      : '<button class="btn small" type="button" id="loginBtn">Log in</button><button class="btn small light" type="button" id="signupBtn">Sign up</button>';
    const lo = $('#logoutBtn'); if (lo) lo.addEventListener('click', async () => { await Auth.logout(); renderNavUser(); route(); toast('Logged out.'); });
    const ab = $('#accountBtn'); if (ab) ab.addEventListener('click', () => {
      if (Auth.isAdmin()) { toast('The admin password is managed in the server settings.'); return; }
      openPwModal();
    });
    const li = $('#loginBtn'); if (li) li.addEventListener('click', () => openAuth('login'));
    const su = $('#signupBtn'); if (su) su.addEventListener('click', () => openAuth('register'));
  }
  function setAuthMode(mode) {
    authMode = mode;
    const reg = mode === 'register';
    $('#authTitle').textContent = reg ? 'Create an account' : 'Log in';
    $('#authSub').textContent = reg ? 'Keep your progress, notes and projects under your own name.' : 'Pick up where you left off.';
    $('#authConfirmWrap').hidden = !reg;
    $('#authSubmit').textContent = reg ? 'Create account' : 'Log in';
    $('#authPassword').setAttribute('autocomplete', reg ? 'new-password' : 'current-password');
    $('#authSwitchText').innerHTML = reg ? 'Already have an account? <button type="button" id="authSwitch">Log in</button>' : 'New here? <button type="button" id="authSwitch">Create an account</button>';
    $('#authSwitch').addEventListener('click', () => setAuthMode(reg ? 'login' : 'register'));
    $('#authError').textContent = '';
    $('#authNote').innerHTML = Auth.available()
      ? 'Your account is stored on the Study Desk server. Progress and notes stay in this browser.'
      : '<b>Accounts are unavailable:</b> the Study Desk server is not running. You can keep studying as a guest.';
  }
  function openAuth(mode) { setAuthMode(mode); $('#authForm').reset(); openModal('authModal'); }
  $('#authClose').addEventListener('click', () => closeModal('authModal'));
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
      closeModal('authModal');
      renderNavUser();
      route();
      toast(authMode === 'register' ? 'Welcome, ' + res.user.username + '!' : 'Welcome back, ' + res.user.username + '.');
    } catch (err) {
      $('#authError').textContent = err.message || 'Something went wrong.';
    } finally { btn.disabled = false; btn.textContent = label; }
  });

  function openPwModal() {
    $('#pwForm').reset();
    $('#pwError').textContent = '';
    openModal('pwModal');
  }
  function closePwModal() { closeModal('pwModal'); }
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
      closeModal('pwModal');
      toast('Password updated. Other devices have been signed out.');
    } catch (err) { $('#pwError').textContent = err.message || 'Something went wrong.'; }
    finally { btn.disabled = false; }
  });

  /* ================= Focus mode and breaks ================= */
  const focus = { total: 1500, left: 1500, id: null, mode: 'focus' };
  function paintFocus() {
    $('#focusTimer').textContent = fmtTime(focus.left);
    $('#focusStart').textContent = focus.id ? 'Pause' : focus.left === focus.total ? 'Start' : focus.left === 0 ? 'Start again' : 'Resume';
  }
  function openFocus(mode = 'focus') {
    if (focus.mode !== mode) { clearInterval(focus.id); focus.id = null; }
    focus.mode = mode;
    if (!focus.id) { focus.total = mode === 'break' ? 300 : 1500; if (focus.left > focus.total || focus.left === 0 || mode === 'break') focus.left = focus.total; }
    $('#focusLabel').textContent = mode === 'break' ? 'Break' : 'Focus mode';
    $('#focusText').innerHTML = mode === 'break' ? 'Stand up, stretch, drink some water. Press <kbd>Esc</kbd> to come back early.' : 'One task. Everything else can wait. Press <kbd>Esc</kbd> to leave.';
    $('#focusOverlay').classList.add('open');
    paintFocus();
    $('#focusStart').focus();
  }
  function startFocus() {
    if (focus.id) return;
    if (focus.left === 0) focus.left = focus.total;
    focus.id = setInterval(() => {
      focus.left = Math.max(0, focus.left - 1);
      if (focus.left === 0) {
        clearInterval(focus.id); focus.id = null;
        toast(focus.mode === 'break' ? 'Break over. Welcome back.' : 'Focus session complete. Time for a break!');
        if (focus.mode === 'break') { closeFocus(); BreakTimer.restart(); }
      }
      paintFocus();
    }, 1000);
    paintFocus();
  }
  function closeFocus() { $('#focusOverlay').classList.remove('open'); }
  $('#focusStart').addEventListener('click', () => { if (focus.id) { clearInterval(focus.id); focus.id = null; paintFocus(); } else startFocus(); });
  $('#focusReset').addEventListener('click', () => { clearInterval(focus.id); focus.id = null; focus.left = focus.total; paintFocus(); });
  $('#focusExit').addEventListener('click', closeFocus);

  /* ================= Global events ================= */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'focus') openFocus('focus');
    else if (act === 'resume' && currentRoadmap) {
      const n = Progress.next(currentRoadmap.modules);
      if (n) openDrawer(n.m.id + ':' + n.i); else toast('Everything here is done or skipped!');
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
      for (const id of ['settingsModal', 'authModal', 'breakModal']) if ($('#' + id).classList.contains('open')) return closeModal(id);
      return closeDrawer();
    }
    if (e.target.matches('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
    const st = { d: 'done', l: 'learning', s: 'skipped', r: 'pending' }[e.key.toLowerCase()];
    if (!st) return;
    if (drawerKey && lessonFromKey(drawerKey)) { e.preventDefault(); setDrawerStatus(st); }
    else if (PAGE === 'lesson' && lessonKey) { e.preventDefault(); setLessonStatus(st); }
  });
  $('#menuToggle').addEventListener('click', () => {
    const open = $('#navLinks').classList.toggle('open');
    $('#menuToggle').setAttribute('aria-expanded', String(open));
  });
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawWires, 80); });

  /* ================= Page rendering ================= */
  function route() {
    app.removeEventListener('change', onCareerCheck);
    closeDrawer();
    $('#navLinks').classList.remove('open');
    $('#menuToggle').setAttribute('aria-expanded', 'false');
    currentRoadmap = null;
    lessonKey = null;
    const activeNav = PAGE === 'lesson' ? 'learn' : PAGE;
    $$('.nav-links a').forEach((a) => { const on = a.dataset.nav === activeNav; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const p = new URLSearchParams(location.search);
    const titles = { learn: 'Learn', roadmap: 'Roadmap', practice: 'Practice', projects: 'Projects', interview: 'Interview prep', community: 'Community', career: 'Career', notes: 'Notes' };
    if (PAGE === 'home') renderHome();
    else if (PAGE === 'learn') renderLearn();
    else if (PAGE === 'lesson') renderLesson();
    else if (PAGE === 'roadmap') p.get('m') ? renderModuleRoadmap(p.get('m')) : renderFullRoadmap();
    else if (PAGE === 'practice') renderPractice();
    else if (PAGE === 'projects') renderProjects();
    else if (PAGE === 'interview') renderInterview();
    else if (PAGE === 'community') renderCommunity();
    else if (PAGE === 'career') renderCareer();
    else if (PAGE === 'notes') renderNotes(p.get('id'));
    else renderNotFound();
    if (!['lesson'].includes(PAGE) && !(PAGE === 'practice' && p.get('c')) && !(PAGE === 'projects' && p.get('p'))) {
      const m = PAGE === 'roadmap' && p.get('m') && byId(p.get('m'));
      document.title = (m ? m.title + ' roadmap' : titles[PAGE] || 'Computer science, one step at a time') + ' · Study Desk';
    }
  }

  window.addEventListener('popstate', () => { if (PAGE === 'notes') route(); });
  applySettings();
  try { if (PAGE === 'lesson' && sessionStorage.getItem('sd:focusReading')) document.body.classList.add('focus-reading'); } catch (e) { /* ignore */ }
  Auth.init().finally(() => {
    renderNavUser();
    route();
    BreakTimer.start();
  });

  // A small API for tests and debugging.
  window.StudyDesk = { Auth, Progress, Notes, Settings, MODULES, CERTS, PROJECTS, CHALLENGES, JOBPATHS };
})();
