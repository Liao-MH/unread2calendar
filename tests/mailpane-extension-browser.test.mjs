import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const impl = fs.readFileSync(path.resolve('thunderbird-addon/api/tbMailPane/implementation.js'), 'utf8');

assert.match(impl, /messagemanagergroup["']\s*,\s*["']webext-browsers["']/, 'mailpane browser host should join the webext browser message manager group');
assert.match(impl, /manualactiveness["']\s*,\s*["']true["']/, 'mailpane browser host should opt into manual activeness like Thunderbird extension views');
assert.match(impl, /nodefaultsrc["']\s*,\s*["']true["']/, 'mailpane browser host should suppress the default source before loading the extension page');
assert.match(impl, /webextension-view-type["']\s*,\s*["']sidebar["']/, 'mailpane browser host should identify the embedded page as an extension sidebar view');
assert.match(impl, /XULFrameLoaderCreated/, 'mailpane browser host should wait for the XUL frame loader before navigating remote extension pages');
assert.match(impl, /frameLoaderReady(?:Promise)?/, 'mailpane browser host should track when the embedded frame is ready to navigate');

console.log('mailpane extension browser tests passed');
