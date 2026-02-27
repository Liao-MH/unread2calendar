import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const background = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');

assert.match(
  background,
  /function isInboxFolder\(folder\)/,
  'background should define inbox folder detector'
);

assert.match(
  background,
  /if \(type === 'inbox'\) return true;/,
  'inbox detector should prioritize folder.type === inbox'
);

assert.match(
  background,
  /async function listInboxFoldersByAccountIds\(accountIds\)/,
  'background should list inbox-scoped folders for account scans'
);

assert.match(
  background,
  /const inboxRoots = collectInboxRoots\(roots\);[\s\S]*for \(const root of inboxRoots\) walk\(root\);/,
  'background should traverse only inbox roots and descendants'
);

assert.match(
  background,
  /const \{ folders \} = await listInboxFoldersByAccountIds\(accountIds\);/,
  'scanUnreadByAccounts should use inbox-only folder list'
);

console.log('inbox scan scope tests passed');
