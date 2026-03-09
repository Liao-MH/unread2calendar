import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync(path.resolve('thunderbird-addon/manifest.json'), 'utf8'));
const readmeZh = fs.readFileSync(path.resolve('README.md'), 'utf8');
const readmeEn = fs.readFileSync(path.resolve('README.en.md'), 'utf8');
const changelog = fs.readFileSync(path.resolve('docs/CHANGELOG.md'), 'utf8');

assert.equal(manifest.version, '2.0.17', 'manifest version should be bumped to 2.0.17');
assert.match(readmeZh, /unread2calendar-thunderbird-2\.0\.17\.xpi/, 'Chinese README should reference the 2.0.17 package');
assert.match(readmeEn, /unread2calendar-thunderbird-2\.0\.17\.xpi/, 'English README should reference the 2.0.17 package');
assert.match(readmeZh, /当前文档对应插件版本：`v2\.0\.17`/, 'Chinese README should target v2.0.17');
assert.match(readmeEn, /This README targets add-on version: `v2\.0\.17`/, 'English README should target v2.0.17');
assert.match(changelog, /^## v2\.0\.17 - 2026-03-09/m, 'CHANGELOG should contain a top-level v2.0.17 entry');

console.log('release version tests passed');
