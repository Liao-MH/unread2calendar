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
assert.match(panelCss, /body\[data-layout="mailpane"\]\s*\{[\s\S]*height:\s*100%;/, 'mailpane body must fill the embedded host height without forcing viewport geometry');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s*\{[\s\S]*width:\s*100%;/, 'mailpane body should fully occupy the embedded host width');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s*\{[\s\S]*--e2c-mailpane-control-gap:\s*clamp\(/, 'mailpane should define a width-sensitive control gap');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s*\{[\s\S]*--e2c-mailpane-group-gap:\s*clamp\(/, 'mailpane should define a height-sensitive content gap');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.app-shell\s*\{[\s\S]*display:\s*grid;/, 'mailpane app shell should use an embedded grid shell');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.app-shell\s*\{[\s\S]*grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)\s+auto;/, 'mailpane app shell should dedicate the middle row to flexible scrolling content');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.top-fixed\s*\{[\s\S]*display:\s*flex;/, 'mailpane top area should become a fluid stack instead of a popup grid');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.top-fixed\s*\{[\s\S]*flex-direction:\s*column;/, 'mailpane top area should stack its control modules');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.topbar\s*\{[\s\S]*display:\s*flex;/, 'mailpane toolbar should use a wrapped flex row');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.topbar\s*\{[\s\S]*flex-wrap:\s*wrap;/, 'mailpane toolbar should wrap only when width runs out');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.topbar\s*\{[\s\S]*gap:\s*var\(--e2c-mailpane-control-row-gap\)\s+var\(--e2c-mailpane-control-gap\);/, 'mailpane toolbar should scale button spacing with available width');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.taskbar\s*\{[\s\S]*display:\s*flex;/, 'mailpane taskbar should use a wrapped flex row');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.taskbar\s*\{[\s\S]*flex-wrap:\s*wrap;/, 'mailpane taskbar should wrap only when width runs out');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.taskbar\s*\{[\s\S]*gap:\s*var\(--e2c-mailpane-control-row-gap\)\s+var\(--e2c-mailpane-control-gap\);/, 'mailpane taskbar should scale button spacing with available width');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.topbar\s*>\s*button,\s*body\[data-layout="mailpane"\]\s+\.taskbar\s*>\s*button\s*\{[\s\S]*flex:\s*0\s+1\s+/, 'mailpane buttons should keep a stable basis instead of stretching to fill every row');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.groups\s*\{[\s\S]*min-height:\s*0;/, 'mailpane groups area should absorb remaining height and stay scrollable');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.groups\s*\{[\s\S]*overflow:\s*auto;/, 'mailpane groups area should own the main scroll behavior');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.groups\s*\{[\s\S]*gap:\s*var\(--e2c-mailpane-group-gap\);/, 'mailpane groups area should compress internal vertical spacing as height shrinks');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.footer\s*\{[\s\S]*display:\s*grid;/, 'mailpane footer should remain a stable stacked tail section');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.footer\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\);/, 'mailpane footer should stack modules vertically in narrow widths');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.status-box\s*\{[\s\S]*white-space:\s*normal;/, 'mailpane status box should wrap instead of clipping in narrow columns');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.group-header\s*\{[\s\S]*display:\s*grid;/, 'mailpane group headers should switch to a fluid title/action grid');
assert.match(panelCss, /body\[data-layout="mailpane"\]\s+\.group-header\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto;/, 'mailpane group headers should keep the title flexible and the action compact');

console.log('mailpane layout tests passed');
