import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync(path.resolve('thunderbird-addon/manifest.json'), 'utf8'));
const readmeZh = fs.readFileSync(path.resolve('README.md'), 'utf8');
const readmeEn = fs.readFileSync(path.resolve('README.en.md'), 'utf8');
const changelog = fs.readFileSync(path.resolve('docs/CHANGELOG.md'), 'utf8');

assert.equal(manifest.version, '2.0.3', 'manifest version should be bumped to 2.0.3');
assert.match(readmeZh, /unread2calendar-thunderbird-2\.0\.3\.xpi/, 'Chinese README should reference the 2.0.3 package');
assert.match(readmeEn, /unread2calendar-thunderbird-2\.0\.3\.xpi/, 'English README should reference the 2.0.3 package');
assert.match(readmeZh, /当前文档对应插件版本：`v2\.0\.3`/, 'Chinese README should target v2.0.3');
assert.match(readmeEn, /This README targets add-on version: `v2\.0\.3`/, 'English README should target v2.0.3');
assert.match(changelog, /^## v2\.0\.3 - 2026-03-08/m, 'CHANGELOG should contain a top-level v2.0.3 entry');

console.log('release version tests passed');
