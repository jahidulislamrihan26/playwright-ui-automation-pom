// Downloads the latest manual test cases from the manual-testing repository into data/manual-test-cases.csv.
// The traceability report (tools/trace.js) reads this snapshot, so it is deterministic and CI needs no network for it.
//   Usage: npm run trace:refresh
const fs = require('fs');
const path = require('path');

const URL = 'https://raw.githubusercontent.com/jahidulislamrihan26/manual-testing-saucedemo/main/test-suite/test-cases.csv';
const target = path.join(__dirname, '..', 'data', 'manual-test-cases.csv');

fetch(URL)
  .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
  .then((text) => {
    fs.writeFileSync(target, text);
    console.log(`Saved ${text.split('\n').length - 1} lines to data/manual-test-cases.csv from ${URL}`);
  })
  .catch((e) => { console.error(`Could not download the manual test cases: ${e.message}`); process.exit(1); });
