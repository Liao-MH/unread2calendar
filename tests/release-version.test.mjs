import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync(path.resolve('thunderbird-addon/manifest.json'), 'utf8'));
const readmeZh = fs.readFileSync(path.resolve('README.md'), 'utf8');
const readmeEn = fs.readFileSync(path.resolve('README.en.md'), 'utf8');
const changelog = fs.readFileSync(path.resolve('docs/CHANGELOG.md'), 'utf8');

assert.equal(manifest.version, '3.0.1', 'manifest version should be bumped to 3.0.1');
assert.match(readmeZh, /unread2calendar-thunderbird-3\.0\.1\.xpi/, 'Chinese README should reference the 3.0.1 package');
assert.match(readmeEn, /unread2calendar-thunderbird-3\.0\.1\.xpi/, 'English README should reference the 3.0.1 package');
assert.match(readmeZh, /当前文档对应插件版本：`v3\.0\.1`/, 'Chinese README should target v3.0.1');
assert.match(readmeEn, /This README targets add-on version: `v3\.0\.1`/, 'English README should target v3.0.1');
assert.match(changelog, /^## v3\.0\.1 - 2026-03-14/m, 'CHANGELOG should contain a top-level v3.0.1 entry');

console.log('release version tests passed');
