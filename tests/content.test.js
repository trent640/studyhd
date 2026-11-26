// Content integrity tests: every module, lesson, certification, project and challenge is complete and consistent.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

global.window = {};
const dir = path.join(__dirname, '..', 'js', 'content');
for (const f of fs.readdirSync(dir).sort()) require(path.join(dir, f));
const { SD_MODULES: M, SD_PATH, SD_CERTS, SD_PROJECTS, SD_CHALLENGES } = window;
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
    assert.equal(passes(c, c.solution), c.tests.length, c.id + ' solution');
    assert.ok(passes(c, c.starter) < c.tests.length, c.id + ' starter should not pass');
    assert.ok(c.java && c.hint && c.complexity, c.id + ' extras');
  }
});
