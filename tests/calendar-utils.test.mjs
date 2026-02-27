import assert from 'node:assert/strict';
import calendarUtils from '../thunderbird-addon/common/calendar-utils.js';

const {
  toCalendarIdentity,
  toCalendarDisplayName,
  isCalendarWritable,
  normalizeCalendars
} = calendarUtils;

const rawCalendars = [
  { calendarId: 'acc-1', displayName: 'Work', readOnly: false },
  { id: 'id-2', name: 'ReadOnly', readOnly: true },
  { uri: { spec: 'moz-storage-calendar://local' }, title: 'Local', enabled: true }
];

assert.equal(toCalendarIdentity(rawCalendars[0], 0), 'acc-1');
assert.equal(toCalendarIdentity(rawCalendars[2], 2), 'moz-storage-calendar://local');
assert.equal(toCalendarDisplayName(rawCalendars[0], 'x'), 'Work');
assert.equal(isCalendarWritable(rawCalendars[0]), true);
assert.equal(isCalendarWritable(rawCalendars[1]), false);

const normalized = normalizeCalendars(rawCalendars);
assert.equal(normalized.length, 2);
assert.equal(normalized[0].name, 'Local');
assert.equal(normalized[1].name, 'Work');

console.log('calendar-utils tests passed');
