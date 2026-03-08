import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const impl = fs.readFileSync(path.resolve('thunderbird-addon/api/tbMailPane/implementation.js'), 'utf8');

assert.match(impl, /host\.style\.opacity\s*=\s*"1"/, 'mailpane host should start fully opaque');
assert.match(impl, /paneState\.onMouseEnter\s*=\s*\(\)\s*=>\s*\{[\s\S]*opacity\s*=\s*"1"/, 'mailpane host should restore full opacity on pointer enter');
assert.match(impl, /paneState\.onMouseLeave\s*=\s*\(\)\s*=>\s*\{[\s\S]*opacity\s*=\s*"0\.3"/, 'mailpane host should dim to 30 percent on pointer leave');
assert.match(impl, /host\.removeEventListener\("mouseenter",\s*paneState\.onMouseEnter,\s*true\)/, 'cleanup should remove mouseenter listener');
assert.match(impl, /host\.removeEventListener\("mouseleave",\s*paneState\.onMouseLeave,\s*true\)/, 'cleanup should remove mouseleave listener');

console.log('mailpane dimming tests passed');
