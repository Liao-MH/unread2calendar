import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const panelJs = fs.readFileSync(path.resolve('thunderbird-addon/sidebar/panel.js'), 'utf8');
const panelCss = fs.readFileSync(path.resolve('thunderbird-addon/sidebar/panel.css'), 'utf8');

assert.match(panelJs, /new URLSearchParams\(window\.location\.search\)/, 'panel should read layout mode from query string');
assert.match(panelJs, /document\.body\.dataset\.layout\s*=\s*layoutMode/, 'panel should expose layout mode on body');
assert.match(panelJs, /const mailPaneToken = layoutParams\.get\(['"]mailpaneToken['"]\)/, 'panel should read a mailpane readiness token from query string');
assert.match(panelJs, /browser\.TbMailPane\.markPanelReady\(mailPaneToken\)/, 'panel should report when the embedded mailpane UI becomes ready');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s*\{[\s\S]*min-width:\s*0;/, 'mailpane body must remove popup min-width');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s*\{[\s\S]*height:\s*100vh;/, 'mailpane body must fill the host height');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s*\{[\s\S]*width:\s*100%;/, 'mailpane body should fully occupy the embedded host width');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.topbar\s*\{[\s\S]*flex-wrap:\s*wrap;/, 'mailpane toolbar should wrap controls as width shrinks');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.taskbar\s*\{[\s\S]*flex-wrap:\s*wrap;/, 'mailpane taskbar should wrap controls as width shrinks');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.groups\s*\{[\s\S]*min-height:\s*0;/, 'mailpane groups area should absorb remaining height and stay scrollable');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.footer\s*\{[\s\S]*min-height:\s*0;/, 'mailpane footer should remain embeddable in shorter panes');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.status-box\s*\{[\s\S]*white-space:\s*normal;/, 'mailpane status box should wrap instead of clipping in narrow columns');
assert.match(panelCss, /\.app-shell\s*\{[\s\S]*min-height:\s*0;/, 'app shell should remain embeddable inside the mailpane host');

console.log('mailpane layout tests passed');
