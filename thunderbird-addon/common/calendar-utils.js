'use strict';

(function initCalendarUtils(root) {
  function priorityScore(calendar) {
    const hay = `${calendar && calendar.name ? calendar.name : ''} ${calendar && calendar.type ? calendar.type : ''}`.toLowerCase();
    if (/\bicloud\b|\bapple\b|\bical\b/.test(hay)) return 0;
    return 1;
  }

  function toCalendarIdentity(calendar, idx) {
    const raw = calendar || {};
    const id = raw.id || raw.calendarId || raw.uid || raw.uuid || (raw.uri && (raw.uri.spec || raw.uri.path || String(raw.uri))) || raw.url;
    if (id) return String(id);
    return `calendar-${idx + 1}`;
  }

  function toCalendarDisplayName(calendar, fallbackId) {
    const raw = calendar || {};
    return String(raw.name || raw.displayName || raw.title || fallbackId || '');
  }

  function isCalendarWritable(calendar) {
    const raw = calendar || {};
    if (raw.readOnly === true || raw.readonly === true || raw.isReadOnly === true) return false;
    if (raw.disabled === true || raw.isDisabled === true || raw.enabled === false) return false;
    return true;
  }

  function normalizeCalendars(rawCalendars) {
    return (Array.isArray(rawCalendars) ? rawCalendars : [])
      .map((c, idx) => ({ raw: c, idx }))
      .filter(({ raw }) => raw && typeof raw === 'object' && isCalendarWritable(raw))
      .map(({ raw, idx }) => {
        const id = toCalendarIdentity(raw, idx);
        return {
          id,
          name: toCalendarDisplayName(raw, id),
          type: String(raw.type || ''),
          readOnly: !!(raw.readOnly || raw.readonly || raw.isReadOnly)
        };
      })
      .sort((a, b) => {
        const sa = priorityScore(a);
        const sb = priorityScore(b);
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name);
      });
  }

  const api = {
    priorityScore,
    toCalendarIdentity,
    toCalendarDisplayName,
    isCalendarWritable,
    normalizeCalendars
  };

  root.CalendarUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
