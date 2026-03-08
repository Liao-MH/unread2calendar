import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const background = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');

assert.match(background, /async function ensureDefaultMailPaneVisible\(\)/, 'background should define startup mailpane visibility helper');
assert.match(background, /browser\.TbMailPane\.show\(/, 'startup mailpane helper should call TbMailPane.show');
assert.match(background, /void ensureDefaultMailPaneVisible\(\);/, 'background should request default mailpane visibility during startup');

console.log('mailpane default visibility tests passed');
