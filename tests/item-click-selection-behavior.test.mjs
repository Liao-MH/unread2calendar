import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const panelPath = path.resolve('thunderbird-addon/sidebar/panel.js');
const panel = fs.readFileSync(panelPath, 'utf8');

assert.match(
  panel,
  /const isCurrentlySelected = item\.id === vm\.selectedTodoId;/,
  'item click behavior should distinguish selected and unselected events'
);

assert.match(
  panel,
  /if \(!isCurrentlySelected\)\s*\{[\s\S]*expandItem\(groupKey, item\.id\);[\s\S]*\}\s*else\s*\{/,
  'first click on unselected item should expand instead of collapsing'
);

assert.match(
  panel,
  /parent\.addEventListener\('click', async \(ev\) => \{[\s\S]*await call\('todo:open-message', \{ messageId: sourceMessageId \}\);/,
  'clicking a parent event should open the related source mail'
);

console.log('item click selection behavior tests passed');
