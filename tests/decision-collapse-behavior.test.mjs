import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const panelPath = path.resolve('thunderbird-addon/sidebar/panel.js');
const panel = fs.readFileSync(panelPath, 'utf8');

assert.match(
  panel,
  /forceCollapsedItemsByGroup:\s*Object\.create\(null\)/,
  'ui state should track force-collapsed items to override group expand state'
);

assert.match(
  panel,
  /function collapseItem\(groupKey, itemId\)\s*\{[\s\S]*groupForceCollapsedItems\(groupKey\)\[itemId\]\s*=\s*true;/,
  'collapseItem should force-collapse the item even when group is expanded'
);

assert.match(
  panel,
  /function expandItem\(groupKey, itemId\)\s*\{[\s\S]*delete groupForceCollapsedItems\(groupKey\)\[itemId\];/,
  'expandItem should clear force-collapse so restore can reopen details'
);

assert.match(
  panel,
  /runWithOpenAndRefresh\('Restore'[\s\S]*\{\s*collapseAfter:\s*false,\s*expandAfter:\s*true\s*\}\)/,
  'restore action should reopen details with decision buttons'
);

console.log('decision collapse behavior tests passed');
