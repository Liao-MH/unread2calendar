"use strict";

(function(exports) {
  const STORE = {
    visible: "extensions.email2calendar.pane.visible",
    width: "extensions.email2calendar.pane.width"
  };

  const UI = {
    hostId: "e2c-todo-pane-host",
    splitterId: "e2c-todo-pane-splitter",
    frameId: "e2c-todo-pane-frame",
    minWidth: 360,
    maxWidth: 960,
    defaultWidth: 520
  };

  let ExtensionErrorClass = Error;
  const paneByWindow = new Map();
  let extensionBase = "";

  function getServices() {
    if (typeof Services !== "undefined") return Services;
    return ChromeUtils.importESModule("resource://gre/modules/Services.sys.mjs").Services;
  }

  function getExtensionErrorClass() {
    try {
      const mod = ChromeUtils.importESModule("resource://gre/modules/ExtensionUtils.sys.mjs");
      if (mod && mod.ExtensionError) return mod.ExtensionError;
    } catch (_) {
      // Ignore.
    }
    return Error;
  }

  function fail(message) {
    throw new ExtensionErrorClass(String(message || "TbMailPane error"));
  }

  function loadPrefBool(prefName, fallback) {
    try {
      return !!getServices().prefs.getBoolPref(prefName, !!fallback);
    } catch (_) {
      return !!fallback;
    }
  }

  function loadPrefInt(prefName, fallback) {
    try {
      return Number(getServices().prefs.getIntPref(prefName, Number(fallback) || 0)) || Number(fallback) || 0;
    } catch (_) {
      return Number(fallback) || 0;
    }
  }

  function savePrefBool(prefName, value) {
    try {
      getServices().prefs.setBoolPref(prefName, !!value);
    } catch (_) {
      // Best effort.
    }
  }

  function savePrefInt(prefName, value) {
    try {
      getServices().prefs.setIntPref(prefName, Math.max(UI.minWidth, Math.round(Number(value) || UI.defaultWidth)));
    } catch (_) {
      // Best effort.
    }
  }

  function clampWidth(width) {
    const n = Math.round(Number(width) || UI.defaultWidth);
    return Math.max(UI.minWidth, Math.min(UI.maxWidth, n));
  }

  function getMailWindows() {
    const out = [];
    const wm = getServices().wm;
    const it = wm.getEnumerator("mail:3pane");
    while (it && it.hasMoreElements()) {
      const win = it.getNext();
      if (win && win.document) out.push(win);
    }
    return out;
  }

  function getCurrentMailWindow() {
    const win = getServices().wm.getMostRecentWindow("mail:3pane");
    return (win && win.document) ? win : null;
  }

  function todayPaneOffsetRight(doc) {
    try {
      const today = doc.getElementById("today-pane-panel");
      if (!today || today.hidden || today.collapsed) return 0;
      const rect = today.getBoundingClientRect();
      const splitter = doc.getElementById("today-splitter");
      const splitRect = splitter && !splitter.hidden ? splitter.getBoundingClientRect() : null;
      const width = Math.max(0, Math.round(rect.width || 0));
      const splitWidth = splitRect ? Math.max(0, Math.round(splitRect.width || 0)) : 0;
      return width + splitWidth;
    } catch (_) {
      return 0;
    }
  }

  function topOffset(doc) {
    const nav = doc.getElementById("navigation-toolbox") || doc.getElementById("mail-toolbox");
    if (!nav || typeof nav.getBoundingClientRect !== "function") return 0;
    const rect = nav.getBoundingClientRect();
    return Math.max(0, Math.round(rect.bottom || 0));
  }

  function ensurePaneForWindow(win) {
    if (!win || !win.document) return null;
    const doc = win.document;
    let host = doc.getElementById(UI.hostId);
    let splitter = doc.getElementById(UI.splitterId);
    let frame = doc.getElementById(UI.frameId);

    if (!host) {
      host = doc.createXULElement("vbox");
      host.setAttribute("id", UI.hostId);
      host.setAttribute("orient", "vertical");
      host.style.position = "fixed";
      host.style.bottom = "0";
      host.style.display = "none";
      host.style.zIndex = "2147483000";
      host.style.borderInlineStart = "1px solid color-mix(in srgb, currentColor 22%, transparent)";
      host.style.background = "var(--toolbar-bgcolor, #f3f4f6)";
      host.style.boxSizing = "border-box";

      frame = doc.createXULElement("browser");
      frame.setAttribute("id", UI.frameId);
      frame.setAttribute("type", "content");
      frame.setAttribute("disablehistory", "true");
      frame.setAttribute("context", "");
      frame.setAttribute("src", `${extensionBase}sidebar/panel.html?layout=mailpane`);
      frame.setAttribute("flex", "1");
      frame.style.minWidth = `${UI.minWidth}px`;
      frame.style.width = "100%";
      frame.style.border = "0";
      host.appendChild(frame);

      splitter = doc.createXULElement("vbox");
      splitter.setAttribute("id", UI.splitterId);
      splitter.style.position = "fixed";
      splitter.style.bottom = "0";
      splitter.style.width = "6px";
      splitter.style.cursor = "ew-resize";
      splitter.style.display = "none";
      splitter.style.zIndex = "2147483001";
      splitter.style.background = "transparent";

      doc.documentElement.appendChild(splitter);
      doc.documentElement.appendChild(host);

      const paneState = {
        host,
        splitter,
        frame,
        width: clampWidth(loadPrefInt(STORE.width, UI.defaultWidth)),
        visible: loadPrefBool(STORE.visible, true),
        dragging: false,
        observer: null,
        onResize: null,
        onUnload: null,
        onMouseDown: null,
        onMouseMove: null,
        onMouseUp: null
      };

      paneState.onResize = () => applyPaneGeometry(win, paneState);
      paneState.onUnload = () => cleanupWindow(win);
      paneState.onMouseDown = (event) => {
        if (event.button !== 0) return;
        paneState.dragging = true;
        event.preventDefault();
      };
      paneState.onMouseMove = (event) => {
        if (!paneState.dragging) return;
        const viewportWidth = Math.max(0, Math.round(win.innerWidth || 0));
        const offset = todayPaneOffsetRight(doc);
        const next = clampWidth(viewportWidth - Math.round(event.clientX || 0) - offset);
        paneState.width = next;
        savePrefInt(STORE.width, next);
        applyPaneGeometry(win, paneState);
      };
      paneState.onMouseUp = () => {
        paneState.dragging = false;
      };

      splitter.addEventListener("mousedown", paneState.onMouseDown, true);
      win.addEventListener("mousemove", paneState.onMouseMove, true);
      win.addEventListener("mouseup", paneState.onMouseUp, true);
      win.addEventListener("resize", paneState.onResize);
      win.addEventListener("unload", paneState.onUnload, { once: true });
      try {
        const todayPane = doc.getElementById("today-pane-panel");
        paneState.observer = new win.MutationObserver(() => applyPaneGeometry(win, paneState));
        paneState.observer.observe(doc.documentElement, {
          attributes: true,
          childList: false,
          subtree: true,
          attributeFilter: ["hidden", "collapsed", "style", "class"]
        });
        if (todayPane) {
          paneState.observer.observe(todayPane, {
            attributes: true,
            childList: false,
            subtree: false,
            attributeFilter: ["hidden", "collapsed", "style", "class"]
          });
        }
      } catch (_) {
        paneState.observer = null;
      }

      paneByWindow.set(win, paneState);
      setVisible(win, paneState.visible);
      return paneState;
    }

    const existing = paneByWindow.get(win) || {
      host,
      splitter,
      frame,
      width: clampWidth(loadPrefInt(STORE.width, UI.defaultWidth)),
      visible: host.style.display !== "none",
      dragging: false
    };
    paneByWindow.set(win, existing);
    applyPaneGeometry(win, existing);
    return existing;
  }

  function applyPaneGeometry(win, paneState) {
    if (!paneState || !paneState.host || !paneState.splitter) return;
    const doc = win.document;
    const top = topOffset(doc);
    const right = todayPaneOffsetRight(doc);
    const width = clampWidth(paneState.width);
    paneState.width = width;

    paneState.host.style.top = `${top}px`;
    paneState.host.style.right = `${right}px`;
    paneState.host.style.width = `${width}px`;
    paneState.host.style.height = `calc(100vh - ${top}px)`;

    paneState.splitter.style.top = `${top}px`;
    paneState.splitter.style.right = `${right + width}px`;
    paneState.splitter.style.height = `calc(100vh - ${top}px)`;

    const visible = paneState.visible;
    paneState.host.style.display = visible ? "-moz-box" : "none";
    paneState.splitter.style.display = visible ? "-moz-box" : "none";
  }

  function setVisible(win, visible) {
    const paneState = ensurePaneForWindow(win);
    if (!paneState) return false;
    paneState.visible = !!visible;
    savePrefBool(STORE.visible, paneState.visible);
    applyPaneGeometry(win, paneState);
    return paneState.visible;
  }

  function cleanupWindow(win) {
    const paneState = paneByWindow.get(win);
    if (!paneState) return;
    try {
      if (paneState.splitter && paneState.onMouseDown) {
        paneState.splitter.removeEventListener("mousedown", paneState.onMouseDown, true);
      }
      if (paneState.onMouseMove) win.removeEventListener("mousemove", paneState.onMouseMove, true);
      if (paneState.onMouseUp) win.removeEventListener("mouseup", paneState.onMouseUp, true);
      if (paneState.onResize) win.removeEventListener("resize", paneState.onResize);
      if (paneState.observer) paneState.observer.disconnect();
    } catch (_) {
      // Ignore cleanup errors.
    }
    paneByWindow.delete(win);
  }

  var TbMailPane = class extends ExtensionCommon.ExtensionAPI {
    getAPI(context) {
      ExtensionErrorClass = getExtensionErrorClass();
      extensionBase = context.extension.baseURI.spec;
      return {
        TbMailPane: {
          async show() {
            const windows = getMailWindows();
            if (!windows.length) fail("No mail:3pane window available");
            windows.forEach((win) => setVisible(win, true));
            return true;
          },
          async hide() {
            const windows = getMailWindows();
            windows.forEach((win) => setVisible(win, false));
            return true;
          },
          async toggle() {
            const win = getCurrentMailWindow();
            if (!win) fail("No mail:3pane window available");
            const paneState = ensurePaneForWindow(win);
            const next = !paneState.visible;
            setVisible(win, next);
            return next;
          },
          async getState() {
            const win = getCurrentMailWindow();
            if (!win) {
              return { visible: false, width: clampWidth(loadPrefInt(STORE.width, UI.defaultWidth)) };
            }
            const paneState = ensurePaneForWindow(win);
            return { visible: !!paneState.visible, width: clampWidth(paneState.width) };
          }
        }
      };
    }

    onShutdown(isAppShutdown) {
      if (isAppShutdown) return;
      for (const [win, paneState] of paneByWindow.entries()) {
        try {
          if (paneState.splitter && paneState.splitter.parentNode) paneState.splitter.remove();
          if (paneState.host && paneState.host.parentNode) paneState.host.remove();
        } catch (_) {
          // Ignore removal failures.
        }
        cleanupWindow(win);
      }
    }
  };

  exports.TbMailPane = TbMailPane;
})(this);
