import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const cssPath = path.resolve('thunderbird-addon/sidebar/panel.css');
const css = fs.readFileSync(cssPath, 'utf8');

assert.match(css, /body\s*\{[\s\S]*min-height:\s*(6[2-9]0|[7-9]\d\d)px;/, 'popup body must define a concrete min-height >= 620px');
assert.match(css, /body\s*\{[\s\S]*min-width:\s*(5[6-9]0|[6-9]\d\d)px;/, 'popup body must define a concrete min-width >= 560px');

console.log('popup-layout css tests passed');
