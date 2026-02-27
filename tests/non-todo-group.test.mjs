import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const bgPath = path.resolve('thunderbird-addon/background.js');
const panelPath = path.resolve('thunderbird-addon/sidebar/panel.js');
const bg = fs.readFileSync(bgPath, 'utf8');
const panel = fs.readFileSync(panelPath, 'utf8');

assert.match(
  bg,
  /"nonTodo":\s*\{\s*"summary":\s*"\.\.\."/,
  'default llm prompt should require nonTodo.summary output for non-actionable mails'
);
assert.match(
  bg,
  /const UNRECOGNIZED_GROUP_KEY = 'unrecognized';/,
  'background should define fixed unrecognized group key'
);
assert.match(
  bg,
  /createNonTodoItem\(message,\s*llmResult\.nonTodoSummary[\s\S]*fallbackNonTodoSummary/,
  'llm branch should create non-todo items when no events are returned'
);
assert.match(
  bg,
  /createNonTodoItem\(message,\s*fallbackNonTodoSummary\(message\)\)/,
  'local-rules branch should create non-todo items when extraction yields no todo'
);
assert.match(
  bg,
  /if \(unrecognizedIndex >= 0\)\s*\{\s*orderedRegularGroups\.push\(regularGroups\[unrecognizedIndex\]\);/,
  'unrecognized group should be rendered as last regular group'
);

assert.match(
  panel,
  /if \(item\.kind === 'non_todo'\)[\s\S]*await call\('todo:mark-non-todo-seen'/,
  'panel click should mark non-todo item as seen'
);
assert.match(
  panel,
  /summaryPrefix:\s*'摘要：'/,
  'panel should render non-todo summary detail'
);

console.log('non-todo group tests passed');
