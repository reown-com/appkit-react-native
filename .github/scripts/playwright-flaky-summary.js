#!/usr/bin/env node
/**
 * Lists Playwright tests that failed first and passed on retry (flaky) and tests that failed.
 * Reads every JSON report in the given folder (one per `playwright test` run), writes a table to
 * the GitHub job summary and adds a warning annotation for each flaky test.
 *
 * Usage: node .github/scripts/playwright-flaky-summary.js apps/native/playwright-results
 */
const fs = require('fs');
const path = require('path');

// Only read reports inside the working directory (the repository root in CI)
const root = process.cwd();
const dir = process.argv[2] ? path.resolve(root, process.argv[2]) : undefined;
if (dir && path.relative(root, dir).startsWith('..')) {
  console.error(`Report folder must be inside ${root}: ${process.argv[2]}`);
  process.exit(1);
}
const files = dir && fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')) : [];

const results = { flaky: [], unexpected: [] };
let total = 0;

function walk(suite, titles) {
  const nextTitles = suite.title ? [...titles, suite.title] : titles;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      total += 1;
      if (test.status === 'flaky' || test.status === 'unexpected') {
        results[test.status].push({
          title: [...nextTitles, spec.title].join(' › '),
          file: spec.file,
          line: spec.line,
          attempts: test.results?.length ?? 0
        });
      }
    }
  }
  for (const child of suite.suites ?? []) walk(child, nextTitles);
}

const unreadable = [];
for (const file of files) {
  let report;
  try {
    report = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  } catch {
    // A cancelled run can leave a cut-off report. Skip it and say so in the summary
    unreadable.push(file);
    continue;
  }
  // Top-level suites are the spec files, already shown in the File column
  for (const suite of report.suites ?? []) walk({ ...suite, title: '' }, []);
}

const lines = ['## Playwright results', ''];
if (!files.length) {
  lines.push('No Playwright JSON report was found.');
} else {
  lines.push(
    `${total} tests, ${results.flaky.length} flaky (passed on retry), ${results.unexpected.length} failed.`
  );
  for (const [label, list] of [
    ['Flaky tests', results.flaky],
    ['Failed tests', results.unexpected]
  ]) {
    if (!list.length) continue;
    lines.push('', `### ${label}`, '', '| Test | File | Attempts |', '| --- | --- | --- |');
    for (const t of list) lines.push(`| ${t.title} | \`${t.file}:${t.line}\` | ${t.attempts} |`);
  }
}

if (unreadable.length) lines.push('', `Could not read: ${unreadable.join(', ')}`);

const summary = lines.join('\n') + '\n';
process.stdout.write(summary);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);

for (const t of results.flaky) {
  // `file` is relative to the Playwright testDir (apps/native/tests)
  process.stdout.write(
    `::warning file=apps/native/tests/${t.file},line=${t.line},title=Flaky Playwright test::${t.title} passed only after ${t.attempts} attempts\n`
  );
}
