import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const panelPath = path.resolve('thunderbird-addon/sidebar/panel.js');
const panel = fs.readFileSync(panelPath, 'utf8');

assert.match(
  panel,
  /accountPickerHint\.textContent\s*=\s*currentLang\(\)\s*===\s*'zh'\s*\?\s*'即将开始扫描（1秒）…'\s*:\s*'Starting in 1s\.\.\.'/,
  'account picker should show 1-second start hint before scanning'
);

assert.match(
  panel,
  /await new Promise\(\(resolve\) => setTimeout\(resolve, 1000\)\);\s*[\s\S]*closeAccountPicker\(\);\s*[\s\S]*await call\('todo:scan-unread-by-accounts'/,
  'account picker should close before scan API is called'
);

assert.doesNotMatch(
  panel,
  /collapseAllDuringProcessing\(vm\.groups\)/,
  'render should not forcibly collapse all groups during running/paused scan'
);

assert.match(
  panel,
  /el\.expandAllBtn\.disabled\s*=\s*false;/,
  'expand-all button should remain available while scan runs or pauses'
);

console.log('scan interaction tests passed');
