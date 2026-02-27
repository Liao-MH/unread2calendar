import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const panelPath = path.resolve('thunderbird-addon/sidebar/panel.js');
const cssPath = path.resolve('thunderbird-addon/sidebar/panel.css');
const panel = fs.readFileSync(panelPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

assert.match(
  panel,
  /noTodosHint:\s*'暂无待办，请点击“扫描未读”或“刷新”'/,
  'zh locale should define one-line empty-state hint'
);

assert.match(
  panel,
  /if \(!renderedMainGroup\)\s*\{[\s\S]*emptyLine\.className = 'groups-empty';[\s\S]*emptyLine\.textContent = t\('noTodosHint'\);/,
  'renderGroups should render one-line empty hint when main groups are empty'
);

assert.match(
  css,
  /\.groups-empty\s*\{[\s\S]*color:\s*#8b95a7;/,
  'empty hint line should use subtle gray style'
);

console.log('empty-state line tests passed');
