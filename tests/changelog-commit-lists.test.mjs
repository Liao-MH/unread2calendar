import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'e2c-changelog-test-'));
const repoDir = path.join(tmpRoot, 'repo');
fs.mkdirSync(repoDir, { recursive: true });

const run = (...args) => execFileSync(args[0], args.slice(1), { cwd: repoDir, encoding: 'utf8' }).trim();

run('git', 'init');
run('git', 'config', 'user.name', 'Codex');
run('git', 'config', 'user.email', 'codex@example.com');

const touchCommit = (filename, content, subject) => {
  fs.writeFileSync(path.join(repoDir, filename), content);
  run('git', 'add', filename);
  run('git', 'commit', '-m', subject);
  return run('git', 'rev-parse', '--short=7', 'HEAD');
};

const prevHash = touchCommit('a.txt', 'old\n', 'prev release');
const planHash = touchCommit('b.txt', 'plan\n', 'plan work');
const fixHash = touchCommit('c.txt', 'fix\n', 'fix issue');

const changelogPath = path.join(repoDir, 'CHANGELOG.md');
fs.writeFileSync(
  changelogPath,
  `# Changelog

## v1.0.1 - 2026-03-09

### Commit 列表

## v1.0.0 - 2026-03-08

### Commit 列表
- \`prev release\`
`
);

execFileSync(
  'python3',
  [
    path.resolve('scripts/update_changelog_commit_lists.py'),
    '--repo', repoDir,
    '--file', changelogPath,
    '--normalize-existing',
    '--refresh-latest'
  ],
  { encoding: 'utf8' }
);

const updated = fs.readFileSync(changelogPath, 'utf8');
assert.match(updated, new RegExp(`- \`${prevHash} prev release\``), 'existing commit subjects should be normalized to short hashes');
assert.match(updated, new RegExp(`- \`${planHash} plan work\``), 'latest version should include intermediate commits since previous release');
assert.match(updated, new RegExp(`- \`${fixHash} fix issue\``), 'latest version should include the newest fix commit');

console.log('changelog commit list script tests passed');
