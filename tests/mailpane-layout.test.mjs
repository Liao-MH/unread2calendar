import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const panelJs = fs.readFileSync(path.resolve('thunderbird-addon/sidebar/panel.js'), 'utf8');
const panelCss = fs.readFileSync(path.resolve('thunderbird-addon/sidebar/panel.css'), 'utf8');

assert.match(panelJs, /new URLSearchParams\(window\.location\.search\)/, 'panel should read layout mode from query string');
assert.match(panelJs, /document\.body\.dataset\.layout\s*=\s*layoutMode/, 'panel should expose layout mode on body');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s*\{[\s\S]*min-width:\s*0;/, 'mailpane body must remove popup min-width');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s*\{[\s\S]*height:\s*100vh;/, 'mailpane body must fill the host height');

console.log('mailpane layout tests passed');
