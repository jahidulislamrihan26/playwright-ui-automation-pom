// Tests for the project's own tooling (run with: npm run test:tools). Uses Node's built-in test runner, no extra dependencies.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseCsv } = require('../csv');

test('parseCsv: plain rows', () => {
  assert.deepEqual(parseCsv('a,b\n1,2\n'), [['a', 'b'], ['1', '2']]);
});
test('parseCsv: commas and line breaks inside quotes stay in the cell', () => {
  assert.deepEqual(parseCsv('id,text\n1,"a, b"\n2,"line1\nline2"\n'), [['id', 'text'], ['1', 'a, b'], ['2', 'line1\nline2']]);
});
test('parseCsv: doubled quotes become one quote', () => {
  assert.deepEqual(parseCsv('x\n"say ""hi"""\n'), [['x'], ['say "hi"']]);
});
test('parseCsv: CRLF line endings and a leading BOM', () => {
  assert.deepEqual(parseCsv('﻿a,b\r\n1,2\r\n'), [['a', 'b'], ['1', '2']]);
});
test('parseCsv: last row without a trailing newline is kept', () => {
  assert.deepEqual(parseCsv('a,b\n1,2'), [['a', 'b'], ['1', '2']]);
});
test('parseCsv: empty cells are preserved', () => {
  assert.deepEqual(parseCsv('a,,c\n'), [['a', '', 'c']]);
});

// check-links.js is run as a black box inside a throw-away folder that mimics the repository layout.
function linkCheck(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'links-'));
  fs.mkdirSync(path.join(dir, 'tools'));
  fs.copyFileSync(path.join(__dirname, '..', 'check-links.js'), path.join(dir, 'tools', 'check-links.js'));
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  }
  const r = spawnSync(process.execPath, [path.join(dir, 'tools', 'check-links.js')], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return r;
}

test('check-links: passes when every relative link exists', () => {
  const r = linkCheck({ 'README.md': '[a](docs/a.md) [b](docs/a.md#top)', 'docs/a.md': '# A' });
  assert.equal(r.status, 0, r.stdout);
});
test('check-links: fails and names a broken link', () => {
  const r = linkCheck({ 'README.md': '[gone](docs/missing.md)' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /docs\/missing\.md/);
});
test('check-links: ignores web, mail and in-page links', () => {
  const r = linkCheck({ 'README.md': '[w](https://example.com) [m](mailto:a@b.c) [h](#section)' });
  assert.equal(r.status, 0, r.stdout);
});
test('check-links: resolves links relative to the file that contains them', () => {
  const r = linkCheck({ 'docs/a.md': '[up](../README.md) [sib](b.md)', 'docs/b.md': 'b', 'README.md': 'r' });
  assert.equal(r.status, 0, r.stdout);
});
test('check-links: handles percent-encoded paths', () => {
  const r = linkCheck({ 'README.md': '[s](my%20file.md)', 'my file.md': 'x' });
  assert.equal(r.status, 0, r.stdout);
});
