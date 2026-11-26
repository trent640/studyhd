// Content integrity tests: every module, lesson, certification, project and challenge is complete and consistent.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

global.window = {};
const dir = path.join(__dirname, '..', 'js', 'content');
for (const f of fs.readdirSync(dir).sort()) require(path.join(dir, f));
const { SD_MODULES: M, SD_PATH, SD_CERTS, SD_PROJECTS, SD_CHALLENGES, SD_JOBPATHS } = window;
const ids = new Set(M.map((m) => m.id));

test('modules have every field and a valid quiz', () => {
  assert.equal(ids.size, M.length, 'unique ids');
  for (const m of M) {
    for (const k of ['id', 'title', 'cat', 'code', 'desc', 'outcome', 'sourceUrl', 'example', 'exercise', 'quiz']) assert.ok(m[k], `${m.id}.${k}`);
    assert.ok(m.jobSkills.length > 0, m.id + ' jobSkills');
    assert.ok(m.answer >= 0 && m.answer < m.quizChoices.length, m.id + ' quiz answer');
    assert.match(m.sourceUrl, /^https:\/\//);
    assert.ok(m.lessons.length >= 5, m.id + ' has at least 5 lessons');
  }
});

test('every lesson is complete and its check is a real question', () => {
  for (const m of M) m.lessons.forEach((l, i) => {
    for (const k of ['title', 'objective', 'example', 'code', 'practice', 'check', 'answer']) assert.ok(l[k] && l[k].trim(), `${m.id}:${i}.${k}`);
    assert.match(l.check.trim(), /\?$/, `${m.id}:${i} check should be a question`);
    assert.notEqual(l.check.trim(), l.answer.trim(), `${m.id}:${i} check repeats answer`);
  });
});

test('path, certifications and projects reference real items and cover every module', () => {
  assert.deepEqual([...SD_PATH].sort(), [...ids].sort());
  const pids = new Set(SD_PROJECTS.map((p) => p.id));
  const covered = SD_CERTS.flatMap((c) => c.modules);
  for (const c of SD_CERTS) {
    c.modules.forEach((id) => assert.ok(ids.has(id), 'cert module ' + id));
    c.projects.forEach((id) => assert.ok(pids.has(id), 'cert project ' + id));
  }
  assert.deepEqual([...covered].sort(), [...ids].sort(), 'each module is in exactly one certification');
  for (const p of SD_PROJECTS) assert.ok(p.stories.length >= 5 && p.cv && p.stretch.length, p.id);
});

test('job paths reference real certifications and cover the two careers', () => {
  const certIds = new Set(SD_CERTS.map((c) => c.id));
  assert.ok(SD_JOBPATHS.length >= 2, 'at least two job paths');
  for (const jp of SD_JOBPATHS) {
    assert.ok(jp.id && jp.title && jp.desc, jp.id);
    assert.ok(jp.certs.length > 0, jp.id + ' has certs');
    jp.certs.forEach((id) => assert.ok(certIds.has(id), jp.id + ' -> ' + id));
  }
  const bb = SD_JOBPATHS.find((p) => p.id === 'bug-bounty');
  assert.ok(bb && bb.certs.includes('cybersecurity'), 'bug bounty path includes the cybersecurity certification');
});

test('security modules are flagged as ethics modules and teach authorisation first', () => {
  const sec = SD_CERTS.find((c) => c.id === 'cybersecurity').modules.map((id) => M.find((m) => m.id === id));
  assert.ok(sec.length >= 10, 'cybersecurity has a full module set');
  for (const m of sec) assert.equal(m.ethics, true, m.id + ' must be flagged ethics:true');
  assert.equal(sec[0].id, 'hacking-ethics', 'ethics and law is the first module');
});

test('challenge reference solutions pass and starters fail', () => {
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const passes = (c, src) => {
    const F = new Function(src + '\nreturn ' + c.fn + ';')();
    return c.tests.filter((t) => {
      try { return eq(c.custom ? new Function(c.fn, t.run)(F) : F(...structuredClone(t.args)), t.expected); } catch (e) { return false; }
    }).length;
  };
  for (const c of SD_CHALLENGES) {
    assert.ok(ids.has(c.module), c.id + ' module');
    if (c.kind === 'html') {
      // HTML/CSS challenges are checked in a real browser by tests/app.test.js.
      assert.ok(c.tests.every((t) => t.name && typeof t.check === 'function'), c.id + ' checks');
      continue;
    }
    if (c.kind === 'sql' || c.kind === 'java') {
      // SQL runs in SQLite and Java in javac/java: both are checked for real by tests/server.test.js.
      assert.ok(c.kind === 'sql' ? c.schema && c.expected && c.starter && c.solution : c.javaTests && c.javaStarter && c.javaSolution, c.id + ' fields');
      continue;
    }
    assert.equal(passes(c, c.solution), c.tests.length, c.id + ' solution');
    assert.ok(passes(c, c.starter) < c.tests.length, c.id + ' starter should not pass');
    assert.ok(c.java && c.hint && c.complexity, c.id + ' extras');
  }
});

test('further-reading links are W3Schools or freeCodeCamp https pages', () => {
  const withRefs = M.filter((m) => m.refs);
  assert.ok(withRefs.length >= 20, 'most modules link to further reading');
  for (const m of withRefs) for (const [url, title, source] of m.refs) {
    assert.match(url, /^https:\/\/www\.(w3schools\.com|freecodecamp\.org)\//, m.id + ' ' + url);
    assert.ok(title && ['W3Schools', 'freeCodeCamp'].includes(source), m.id);
  }
});
