// Reads reports/results.json (Playwright JSON reporter) and writes reports/summary.md: a short, human run summary.
// In CI the same text is added to the job summary page.   Usage: node tools/summary.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'reports', 'results.json');
if (!fs.existsSync(file)) { console.error('No reports/results.json. Run the tests first.'); process.exit(1); }
const json = JSON.parse(fs.readFileSync(file, 'utf8'));

const rows = [];
(function walk(suite, trail) {
  for (const s of suite.suites || []) walk(s, [...trail, s.title]);
  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      const results = t.results || [];
      const last = results[results.length - 1] || {};
      rows.push({ file: suite.file || trail[0], title: spec.title, project: t.projectName, status: t.status, retries: Math.max(0, results.length - 1), ms: results.reduce((n, r) => n + (r.duration || 0), 0), last: last.status, error: last.error && (last.error.message || '').split('\n')[0] });
    }
  }
})({ suites: json.suites, specs: [] }, []);

const real = rows.filter((r) => r.project !== 'setup');
const count = (f) => real.filter(f).length;
const known = real.filter((r) => /@known-bug/.test(r.title));
const normal = real.filter((r) => !/@known-bug/.test(r.title));
const unexpected = real.filter((r) => r.status === 'unexpected');
const flaky = real.filter((r) => r.status === 'flaky');
const projects = [...new Set(real.map((r) => r.project))];
const secs = (ms) => (ms / 1000).toFixed(1);

const out = [];
out.push('## UI test summary', '');
out.push(`**${unexpected.length === 0 ? 'No unexpected failures.' : `${unexpected.length} UNEXPECTED FAILURE(S).`}** ${real.length} test runs on ${projects.join(', ')}.`, '');
out.push('| | Count |', '|---|---|');
out.push(`| Passed as expected | ${count((r) => r.status === 'expected' && !/@known-bug/.test(r.title))} |`);
out.push(`| Known defects still failing as expected (@known-bug) | ${known.filter((r) => r.status === 'expected').length} |`);
out.push(`| **Known defects that now PASS (fixed? remove the annotation)** | ${known.filter((r) => r.status === 'unexpected').length} |`);
out.push(`| Flaky (passed only after a retry) | ${flaky.length} |`);
out.push(`| Unexpected failures | ${unexpected.length} |`);
out.push(`| Skipped | ${count((r) => r.status === 'skipped')} |`);
out.push(`| Total test time (sum over tests) | ${secs(real.reduce((n, r) => n + r.ms, 0))} s |`, '');

if (unexpected.length) { out.push('### Unexpected failures', '', ...unexpected.map((r) => `- ${r.project}: ${r.title}${r.error ? ` (${r.error})` : ''}`), ''); }
if (flaky.length) { out.push('### Flaky tests', '', ...flaky.map((r) => `- ${r.project}: ${r.title} (${r.retries} retr${r.retries === 1 ? 'y' : 'ies'})`), ''); }
const fixed = known.filter((r) => r.status === 'unexpected');
if (fixed.length) { out.push('### Known defects that now pass', '', ...fixed.map((r) => `- ${r.title}`), ''); }

out.push('### Slowest tests', '', '| Test | Project | Time |', '|---|---|---|');
for (const r of [...normal].sort((a, b) => b.ms - a.ms).slice(0, 5)) out.push(`| ${r.title.replace(/\|/g, '\\|')} | ${r.project} | ${secs(r.ms)} s |`);
out.push('');

fs.writeFileSync(path.join(__dirname, '..', 'reports', 'summary.md'), out.join('\n'));
console.log(out.join('\n'));
