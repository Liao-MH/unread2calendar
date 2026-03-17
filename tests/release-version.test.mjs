import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync(path.resolve('thunderbird-addon/manifest.json'), 'utf8'));
const readmeZh = fs.readFileSync(path.resolve('README.md'), 'utf8');
const readmeEn = fs.readFileSync(path.resolve('README.en.md'), 'utf8');
const changelog = fs.readFileSync(path.resolve('docs/CHANGELOG.md'), 'utf8');

assert.equal(manifest.version, '4.0.0', 'manifest version should be bumped to 4.0.0');
assert.match(readmeZh, /unread2calendar-thunderbird-4\.0\.0\.xpi/, 'Chinese README should reference the 4.0.0 package');
assert.match(readmeEn, /unread2calendar-thunderbird-4\.0\.0\.xpi/, 'English README should reference the 4.0.0 package');
assert.match(readmeZh, /当前文档对应插件版本：`v4\.0\.0`/, 'Chinese README should target v4.0.0');
assert.match(readmeEn, /This README targets add-on version: `v4\.0\.0`/, 'English README should target v4.0.0');
assert.match(changelog, /^## v4\.0\.0 - 2026-03-17/m, 'CHANGELOG should contain a top-level v4.0.0 entry');

console.log('release version tests passed');
