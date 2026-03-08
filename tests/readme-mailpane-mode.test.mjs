import assert from 'node:assert/strict';
import fs from 'node:fs';

const readme = fs.readFileSync('README.md', 'utf8');
const readmeEn = fs.readFileSync('README.en.md', 'utf8');

assert.match(readme, /第四栏|右侧栏|邮件页右侧/, 'Chinese README should describe the mailpane host entry');
assert.match(readmeEn, /fourth column|right-side pane|mailpane/i, 'English README should describe the mailpane host entry');

console.log('readme mailpane mode tests passed');
