"use strict";

(function (exports) {
  let CalEventClass = null;
  let lastErrorText = "";

  function getServices() {
    if (typeof Services !== "undefined") return Services;
    try {
      const mod = ChromeUtils.importESModule("resource://gre/modules/Services.sys.mjs");
      if (mod && mod.Services) return mod.Services;
    } catch (_) {
      // Fall through.
    }
    try {
      const modLegacy = ChromeUtils.import("resource://gre/modules/Services.jsm");
      if (modLegacy && modLegacy.Services) return modLegacy.Services;
    } catch (_) {
      // Fall through.
    }
    throw new Error("Services module unavailable");
  }

  function loadExtensionErrorClass() {
    try {
      const mod = ChromeUtils.importESModule("resource://gre/modules/ExtensionUtils.sys.mjs");
      if (mod && mod.ExtensionError) return mod.ExtensionError;
    } catch (_) {
      // Fallback below.
    }
    return Error;
  }

  const ExtensionErrorClass = loadExtensionErrorClass();

  function stringifyError(error) {
    if (!error) return "Unknown error";
    const parts = [];
    if (error.name) parts.push(`name=${error.name}`);
    if (error.message) parts.push(`message=${error.message}`);
    if (typeof error.result !== "undefined") parts.push(`result=${error.result}`);
    if (error.fileName) parts.push(`file=${error.fileName}`);
    if (error.lineNumber) parts.push(`line=${error.lineNumber}`);
    if (error.stack) parts.push(`stack=${String(error.stack).split("\n").slice(0, 6).join(" | ")}`);
    if (!parts.length) parts.push(String(error));
    return parts.join(" ; ");
  }

  function setLastError(step, error, extra) {
    const suffix = extra ? ` ; ${extra}` : "";
    lastErrorText = `${step} failed ; ${stringifyError(error)}${suffix}`;
    return lastErrorText;
  }

  function fail(step, error, extra) {
    throw new ExtensionErrorClass(setLastError(step, error, extra));
  }

  function loadCalendarModule() {
    try {
      const m = ChromeUtils.importESModule("resource:///modules/calendar/calUtils.sys.mjs");
      const ev = ChromeUtils.importESModule("resource:///modules/CalEvent.sys.mjs");
      if (ev && ev.CalEvent) CalEventClass = ev.CalEvent;
      if (m && m.cal) return m.cal;
    } catch (_) {
      // Continue.
    }
    const legacy = ChromeUtils.import("resource:///modules/calendar/calUtils.jsm");
    try {
      const evLegacy = ChromeUtils.import("resource:///modules/CalEvent.jsm");
      if (evLegacy && evLegacy.CalEvent) CalEventClass = evLegacy.CalEvent;
    } catch (_) {
      // Ignore.
    }
    return legacy.cal;
  }

  function normalizeCalendar(calendar) {
    const id = calendar && calendar.id ? String(calendar.id) : "";
    const uri = calendar && calendar.uri ? String(calendar.uri.spec || calendar.uri.path || calendar.uri) : "";
    const fallbackId = uri || `calendar-${Math.random().toString(36).slice(2)}`;
    return {
      id: id || fallbackId,
      name: String((calendar && calendar.name) || id || fallbackId),
      type: String((calendar && calendar.type) || ""),
      readOnly: !!(calendar && calendar.readOnly)
    };
  }

  async function writeItemToCalendar(calendar, item) {
    if (calendar && typeof calendar.adoptItem === "function") {
      return calendar.adoptItem(item);
    }
    if (calendar && typeof calendar.addItem === "function") {
      return calendar.addItem(item);
    }
    throw new Error("Selected calendar does not support adoptItem/addItem");
  }

  async function verifyItemInCalendar(calendar, itemId) {
    if (!calendar || !itemId || typeof calendar.getItem !== "function") return false;
    try {
      const found = await calendar.getItem(String(itemId));
      return !!found;
    } catch (_) {
      return false;
    }
  }

  function toDateTime(cal, isoString) {
    if (cal && typeof cal.createDateTime === "function") {
      try {
        const parsed = cal.createDateTime(String(isoString));
        if (parsed) return parsed;
      } catch (_) {
        // Fall through.
      }
    }

    const jsDate = new Date(isoString);
    if (Number.isNaN(jsDate.getTime())) {
      throw new Error(`Invalid date: ${isoString}`);
    }
    if (cal && cal.dtz && typeof cal.dtz.jsDateToDateTime === "function") {
      return cal.dtz.jsDateToDateTime(jsDate, cal.dtz.UTC);
    }
    throw new Error("Calendar date conversion API unavailable");
  }

  function resolveTimeZoneObject(cal, timeZone) {
    const tz = String(timeZone || "").trim();
    if (!tz) {
      if (cal && cal.dtz && cal.dtz.defaultTimezone) return cal.dtz.defaultTimezone;
      return null;
    }
    if (cal && cal.timezoneService && typeof cal.timezoneService.getTimezone === "function") {
      try {
        const found = cal.timezoneService.getTimezone(tz);
        if (found) return found;
      } catch (_) {
        // Fall through.
      }
    }
    if (cal && cal.dtz && cal.dtz.defaultTimezone) return cal.dtz.defaultTimezone;
    return null;
  }

  function toDateTimeFromLocal(cal, localText, timeZone) {
    const src = String(localText || "").trim();
    const m = src.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
    if (!m) return null;
    if (cal && typeof cal.createDateTime === "function") {
      const basic = `${m[1]}${m[2]}${m[3]}T${m[4]}${m[5]}00`;
      const dt = cal.createDateTime(basic);
      const tzObj = resolveTimeZoneObject(cal, timeZone);
      if (dt && tzObj) {
        try {
          dt.timezone = tzObj;
        } catch (_) {
          // Ignore timezone assignment errors.
        }
      }
      return dt;
    }
    return null;
  }

  function createEventItem() {
    if (CalEventClass) {
      return new CalEventClass();
    }
    if (
      typeof Components !== "undefined" &&
      Components.classes &&
      Components.interfaces &&
      Components.classes["@mozilla.org/calendar/event;1"]
    ) {
      return Components.classes["@mozilla.org/calendar/event;1"]
        .createInstance(Components.interfaces.calIEvent);
    }
    throw new Error("Calendar event factory unavailable");
  }

  var TbCalendarAccess = class extends ExtensionCommon.ExtensionAPI {
    getAPI(_context) {
      return {
        TbCalendarAccess: {
          async listCalendars() {
            try {
              const cal = loadCalendarModule();
              const manager = cal && cal.manager;
              if (!manager || typeof manager.getCalendars !== "function") {
                return [];
              }
              const calendars = manager.getCalendars();
              return (Array.isArray(calendars) ? calendars : []).map(normalizeCalendar);
            } catch (error) {
              fail("TbCalendarAccess.listCalendars", error);
            }
          },
          async getLastError() {
            return String(lastErrorText || "");
          },
          async openCalendarAt(isoDate) {
            try {
              const services = getServices();
              const win = services.wm.getMostRecentWindow("mail:3pane");
              if (!win) throw new Error("No mail window available");
              if (typeof win.switchToCalendarTab === "function") {
                win.switchToCalendarTab();
              } else {
                const tabmail = win.document && win.document.getElementById("tabmail");
                if (tabmail && typeof tabmail.openTab === "function") {
                  tabmail.openTab("calendar", {});
                } else {
                  throw new Error("Cannot open calendar tab");
                }
              }
              const cal = loadCalendarModule();
              const dt = toDateTime(cal, isoDate);
              if (typeof win.currentView === "function") {
                const view = win.currentView();
                if (view && typeof view.goToDay === "function") {
                  view.goToDay(dt);
                }
                if (view && typeof view.scrollToMinute === "function") {
                  try {
                    const minute = (dt.hour || 0) * 60 + (dt.minute || 0);
                    view.scrollToMinute(minute);
                  } catch (_) {
                    // Ignore optional scroll errors.
                  }
                }
              }
              return true;
            } catch (error) {
              fail("TbCalendarAccess.openCalendarAt", error, `isoDate=${String(isoDate || "")}`);
            }
          },
          async createEvents(calendarId, events) {
            try {
              const cal = loadCalendarModule();
              const manager = cal && cal.manager;
              if (!manager || typeof manager.getCalendarById !== "function") {
                throw new Error("Calendar manager unavailable");
              }
              const target = manager.getCalendarById(String(calendarId));
              if (!target) {
                throw new Error("Selected calendar not found");
              }
              if (target.readOnly) {
                throw new Error("Selected calendar is read-only");
              }
              const list = Array.isArray(events) ? events : [];
              const results = [];
              for (let i = 0; i < list.length; i += 1) {
                const raw = list[i];
                try {
                  const item = createEventItem();
                  item.title = String(raw && raw.title ? raw.title : "");
                  const importTimeZone = raw && raw.importTimeZone ? String(raw.importTimeZone) : "";
                  const localStart = raw && raw.startLocal ? String(raw.startLocal) : "";
                  const localEnd = raw && raw.endLocal ? String(raw.endLocal) : "";
                  item.startDate = toDateTimeFromLocal(cal, localStart, importTimeZone) || toDateTime(cal, raw && raw.startDate);
                  item.endDate = toDateTimeFromLocal(cal, localEnd, importTimeZone) || toDateTime(cal, raw && raw.endDate);
                  if (raw && raw.location) {
                    item.setProperty("LOCATION", String(raw.location));
                  }
                  if (raw && raw.description) {
                    item.setProperty("DESCRIPTION", String(raw.description));
                  }
                  item.calendar = target;
                  const created = await writeItemToCalendar(target, item);
                  const createdId = String((created && created.id) || item.id || "");
                  const verified = await verifyItemInCalendar(target, createdId);
                  results.push({
                    status: verified ? "imported" : "unverified",
                    id: createdId,
                    title: String(raw && raw.title ? raw.title : ""),
                    startDate: String(raw && raw.startDate ? raw.startDate : ""),
                    endDate: String(raw && raw.endDate ? raw.endDate : ""),
                    location: String(raw && raw.location ? raw.location : ""),
                    reason: verified ? "" : "Created but not verified by getItem."
                  });
                } catch (eventError) {
                  const detail = `index=${i}; title=${raw && raw.title ? String(raw.title) : ""}; start=${raw && raw.startDate ? String(raw.startDate) : ""}; end=${raw && raw.endDate ? String(raw.endDate) : ""}`;
                  setLastError("TbCalendarAccess.createEvents.item", eventError, detail);
                  results.push({
                    status: "failed",
                    id: "",
                    title: String(raw && raw.title ? raw.title : ""),
                    startDate: String(raw && raw.startDate ? raw.startDate : ""),
                    endDate: String(raw && raw.endDate ? raw.endDate : ""),
                    location: String(raw && raw.location ? raw.location : ""),
                    reason: stringifyError(eventError)
                  });
                }
              }
              const imported = results.filter((r) => r.status === "imported").length;
              const unverified = results.filter((r) => r.status === "unverified").length;
              const failed = results.filter((r) => r.status === "failed").length;
              if (failed === 0) {
                lastErrorText = "";
              }
              return { imported, unverified, failed, results };
            } catch (error) {
              fail("TbCalendarAccess.createEvents", error, `calendarId=${String(calendarId || "")}`);
            }
          }
        }
      };
    }
  };

  exports.TbCalendarAccess = TbCalendarAccess;
})(this);
