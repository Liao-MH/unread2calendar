"use strict";

(function(exports) {
  const STORE = {
    visible: "extensions.unread2calendar.pane.visible",
    width: "extensions.unread2calendar.pane.width"
  };

  const UI = {
    hostId: "e2c-todo-pane-host",
    stackId: "e2c-todo-pane-stack",
    splitterId: "e2c-todo-pane-splitter",
    frameId: "e2c-todo-pane-frame",
    overlayId: "e2c-todo-pane-overlay",
    overlayMessageId: "e2c-todo-pane-overlay-message",
    retryButtonId: "e2c-todo-pane-retry",
    minWidth: 360,
    maxWidth: 960,
    defaultWidth: 520,
    readyTimeoutMs: 3000
  };

  let ExtensionErrorClass = Error;
  const paneByWindow = new Map();
  let extensionBase = "";
  let extensionBrowserConfig = {
    remote: false,
    remoteType: "",
    browsingContextGroupId: null
  };

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

  function nextLoadToken() {
    return `mailpane-${Math.random().toString(36).slice(2, 10)}`;
  }

  function nextFrame(win) {
    return new Promise((resolve) => {
      try {
        win.requestAnimationFrame(() => resolve());
      } catch (_) {
        win.setTimeout(resolve, 16);
      }
    });
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

  function getTabmail(win) {
    if (!win || !win.document) return null;
    return win.document.getElementById("tabmail");
  }

  function getPaneContainer(doc) {
    if (!doc) return null;
    return doc.getElementById("tabmail-container");
  }

  function buildPanelSrc(token) {
    const base = `${extensionBase}sidebar/panel.html`;
    const query = `layout=mailpane&mailpaneToken=${encodeURIComponent(String(token || ""))}`;
    return `${base}?${query}`;
  }

  function whenFrameLoaderReady(frame, isRemote) {
    if (!frame || !isRemote) return Promise.resolve();
    return new Promise((resolve) => {
      const onReady = () => resolve();
      frame.addEventListener("XULFrameLoaderCreated", onReady, { once: true });
    });
  }

  function configureExtensionBrowser(frame) {
    if (!frame) return Promise.resolve();
    frame.setAttribute("type", "content");
    frame.setAttribute("disableglobalhistory", "true");
    frame.setAttribute("messagemanagergroup", "webext-browsers");
    frame.setAttribute("manualactiveness", "true");
    frame.setAttribute("nodefaultsrc", "true");
    frame.setAttribute("webextension-view-type", "sidebar");
    frame.setAttribute("context", "");
    frame.setAttribute("flex", "1");

    const isRemote = !!extensionBrowserConfig.remote;
    if (isRemote) {
      frame.setAttribute("remote", "true");
      if (extensionBrowserConfig.remoteType) {
        frame.setAttribute("remoteType", String(extensionBrowserConfig.remoteType));
      }
      if (extensionBrowserConfig.browsingContextGroupId !== null && extensionBrowserConfig.browsingContextGroupId !== undefined) {
        frame.setAttribute("initialBrowsingContextGroupId", String(extensionBrowserConfig.browsingContextGroupId));
      }
    }

    return whenFrameLoaderReady(frame, isRemote);
  }

  function clearLoadTimer(paneState) {
    if (!paneState || !paneState.loadTimer) return;
    try {
      paneState.host.ownerGlobal.clearTimeout(paneState.loadTimer);
    } catch (_) {
      // Ignore.
    }
    paneState.loadTimer = null;
  }

  function renderPaneFallback(paneState) {
    if (!paneState || !paneState.overlay || !paneState.overlayMessage || !paneState.retryButton) return;
    const state = paneState.loadState;
    if (state === "ready") {
      paneState.overlay.hidden = true;
      return;
    }
    paneState.overlay.hidden = false;
    if (state === "error") {
      paneState.overlayMessage.textContent = "Todo Sidebar failed to load.";
      paneState.retryButton.hidden = false;
      return;
    }
    paneState.overlayMessage.textContent = "Loading Todo Sidebar...";
    paneState.retryButton.hidden = true;
  }

  function setPaneLoadState(paneState, loadState, detail) {
    if (!paneState) return;
    paneState.loadState = String(loadState || "loading");
    paneState.contentReady = paneState.loadState === "ready";
    paneState.loadError = detail ? String(detail) : "";
    if (paneState.loadState !== "loading") {
      clearLoadTimer(paneState);
    }
    renderPaneFallback(paneState);
  }

  function findPaneByToken(token) {
    const key = String(token || "");
    if (!key) return null;
    for (const [win, paneState] of paneByWindow.entries()) {
      if (paneState && paneState.loadToken === key) {
        return { win, paneState };
      }
    }
    return null;
  }

  function beginPanelLoad(win, paneState, options) {
    if (!win || !paneState || !paneState.frame) return;
    const force = !!(options && options.force);
    if (!force && paneState.contentReady) {
      setPaneLoadState(paneState, "ready");
      return;
    }
    const token = nextLoadToken();
    const src = buildPanelSrc(token);
    paneState.loadToken = token;
    paneState.contentReady = false;
    setPaneLoadState(paneState, "loading");
    clearLoadTimer(paneState);
    Promise.resolve(paneState.frameLoaderReadyPromise)
      .then(() => {
        if (paneState.loadToken !== token) return;
        paneState.frame.setAttribute("src", src);
      })
      .catch((error) => {
        if (paneState.loadToken !== token) return;
        setPaneLoadState(paneState, "error", error && error.message ? error.message : "Frame loader setup failed");
      });
    paneState.loadTimer = win.setTimeout(() => {
      if (paneState.loadToken !== token || paneState.loadState === "ready") return;
      setPaneLoadState(paneState, "error", "Panel ready signal timed out");
    }, UI.readyTimeoutMs);
  }

  async function waitForPanelOutcome(win, paneState) {
    const timeoutAt = Date.now() + UI.readyTimeoutMs + 250;
    while (Date.now() < timeoutAt) {
      if (paneState.loadState === "ready" || paneState.loadState === "error") {
        return paneState.loadState;
      }
      await nextFrame(win);
    }
    if (paneState.loadState === "loading") {
      setPaneLoadState(paneState, "error", "Panel ready signal timed out");
    }
    return paneState.loadState;
  }

  function isPaneActuallyVisible(win, paneState) {
    if (!win || !paneState || !paneState.host) return false;
    const host = paneState.host;
    if (!host.isConnected || host.hidden) return false;
    try {
      const style = win.getComputedStyle(host);
      if (!style) return false;
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = host.getBoundingClientRect();
      return !!rect && rect.width > 0 && rect.height > 0;
    } catch (_) {
      return false;
    }
  }

  async function verifyPaneVisible(win, paneState) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (isPaneActuallyVisible(win, paneState)) return true;
      applyPaneGeometry(win, paneState);
      await nextFrame(win);
    }
    return isPaneActuallyVisible(win, paneState);
  }

  function isMailThreePaneTabActive(win) {
    const tabmail = getTabmail(win);
    const currentTabInfo = tabmail && tabmail.currentTabInfo;
    const modeName = currentTabInfo && currentTabInfo.mode && currentTabInfo.mode.name;
    return modeName === "mail3PaneTab";
  }

  function shouldShowPaneInWindow(win, paneState) {
    return !!(paneState && paneState.visible && isMailThreePaneTabActive(win));
  }

  function ensurePaneForWindow(win) {
    if (!win || !win.document) return null;
    const doc = win.document;
    let host = doc.getElementById(UI.hostId);
    let splitter = doc.getElementById(UI.splitterId);
    let stack = doc.getElementById(UI.stackId);
    let frame = doc.getElementById(UI.frameId);
    let overlay = doc.getElementById(UI.overlayId);
    let overlayMessage = doc.getElementById(UI.overlayMessageId);
    let retryButton = doc.getElementById(UI.retryButtonId);

    if (!host) {
      const paneContainer = getPaneContainer(doc);
      if (!paneContainer) return null;
      host = doc.createXULElement("vbox");
      host.setAttribute("id", UI.hostId);
      host.setAttribute("orient", "vertical");
      host.setAttribute("flex", "0");
      host.style.borderInlineStart = "1px solid color-mix(in srgb, currentColor 22%, transparent)";
      host.style.background = "var(--toolbar-bgcolor, #f3f4f6)";
      host.style.boxSizing = "border-box";
      host.style.overflow = "hidden";
      host.style.minWidth = `${UI.minWidth}px`;
      host.style.maxWidth = `${UI.maxWidth}px`;
      host.style.width = `${UI.defaultWidth}px`;
      host.style.minHeight = "0";
      host.style.height = "100%";
      host.style.opacity = "1";
      host.style.transition = "opacity 140ms ease";
      host.hidden = true;

      stack = doc.createXULElement("stack");
      stack.setAttribute("id", UI.stackId);
      stack.setAttribute("flex", "1");
      stack.style.width = "100%";
      stack.style.height = "100%";

      frame = doc.createXULElement("browser");
      frame.setAttribute("id", UI.frameId);
      const frameLoaderReadyPromise = configureExtensionBrowser(frame);
      frame.style.minWidth = `${UI.minWidth}px`;
      frame.style.width = "100%";
      frame.style.height = "100%";
      frame.style.border = "0";
      stack.appendChild(frame);

      overlay = doc.createXULElement("vbox");
      overlay.setAttribute("id", UI.overlayId);
      overlay.setAttribute("pack", "center");
      overlay.setAttribute("align", "center");
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.padding = "16px";
      overlay.style.gap = "10px";
      overlay.style.textAlign = "center";
      overlay.style.background = "linear-gradient(180deg, rgba(244,245,248,0.96), rgba(244,245,248,0.92))";

      overlayMessage = doc.createXULElement("description");
      overlayMessage.setAttribute("id", UI.overlayMessageId);
      overlayMessage.style.maxWidth = "260px";
      overlayMessage.style.color = "var(--toolbar-color, #111827)";

      retryButton = doc.createXULElement("button");
      retryButton.setAttribute("id", UI.retryButtonId);
      retryButton.setAttribute("label", "Retry");
      retryButton.hidden = true;

      overlay.appendChild(overlayMessage);
      overlay.appendChild(retryButton);
      stack.appendChild(overlay);
      host.appendChild(stack);

      splitter = doc.createXULElement("vbox");
      splitter.setAttribute("id", UI.splitterId);
      splitter.setAttribute("flex", "0");
      splitter.style.width = "6px";
      splitter.style.minWidth = "6px";
      splitter.style.cursor = "ew-resize";
      splitter.style.background = "transparent";
      splitter.hidden = true;

      paneContainer.appendChild(splitter);
      paneContainer.appendChild(host);

      const paneState = {
        container: paneContainer,
        host,
        stack,
        splitter,
        frame,
        overlay,
        overlayMessage,
        retryButton,
        width: clampWidth(loadPrefInt(STORE.width, UI.defaultWidth)),
        visible: loadPrefBool(STORE.visible, true),
        dragging: false,
        frameLoaderReadyPromise,
        loadToken: "",
        loadTimer: null,
        loadState: "loading",
        contentReady: false,
        loadError: "",
        observer: null,
        onResize: null,
        onUnload: null,
        onTabSelect: null,
        onMouseDown: null,
        onMouseMove: null,
        onMouseUp: null,
        onMouseEnter: null,
        onMouseLeave: null,
        onRetry: null
      };

      paneState.onResize = () => applyPaneGeometry(win, paneState);
      paneState.onUnload = () => cleanupWindow(win);
      paneState.onTabSelect = () => applyPaneGeometry(win, paneState);
      paneState.onMouseDown = (event) => {
        if (event.button !== 0) return;
        paneState.dragging = true;
        event.preventDefault();
      };
      paneState.onMouseMove = (event) => {
        if (!paneState.dragging) return;
        const rect = paneState.container && typeof paneState.container.getBoundingClientRect === "function"
          ? paneState.container.getBoundingClientRect()
          : null;
        const right = rect ? Math.round(rect.right || 0) : Math.round(win.innerWidth || 0);
        const next = clampWidth(right - Math.round(event.clientX || 0));
        paneState.width = next;
        savePrefInt(STORE.width, next);
        applyPaneGeometry(win, paneState);
      };
      paneState.onMouseUp = () => {
        paneState.dragging = false;
      };
      paneState.onMouseEnter = () => {
        host.style.opacity = "1";
      };
      paneState.onMouseLeave = () => {
        host.style.opacity = "0.3";
      };
      paneState.onRetry = () => {
        beginPanelLoad(win, paneState, { force: true });
      };

      splitter.addEventListener("mousedown", paneState.onMouseDown, true);
      host.addEventListener("mouseenter", paneState.onMouseEnter, true);
      host.addEventListener("mouseleave", paneState.onMouseLeave, true);
      retryButton.addEventListener("command", paneState.onRetry, true);
      win.addEventListener("mousemove", paneState.onMouseMove, true);
      win.addEventListener("mouseup", paneState.onMouseUp, true);
      win.addEventListener("resize", paneState.onResize);
      win.addEventListener("unload", paneState.onUnload, { once: true });
      const tabmail = getTabmail(win);
      if (tabmail && tabmail.tabContainer) {
        tabmail.tabContainer.addEventListener("TabSelect", paneState.onTabSelect, true);
      }
      try {
        paneState.observer = new win.MutationObserver(() => applyPaneGeometry(win, paneState));
        if (tabmail && tabmail.tabContainer) {
          paneState.observer.observe(tabmail.tabContainer, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ["selected", "collapsed", "hidden", "style", "class"]
          });
        }
      } catch (_) {
        paneState.observer = null;
      }

      paneByWindow.set(win, paneState);
      beginPanelLoad(win, paneState, { force: true });
      setVisible(win, paneState.visible);
      return paneState;
    }

    const existing = paneByWindow.get(win) || {
      container: getPaneContainer(doc),
      host,
      stack,
      splitter,
      frame,
      overlay,
      overlayMessage,
      retryButton,
      width: clampWidth(loadPrefInt(STORE.width, UI.defaultWidth)),
      visible: !host.hidden,
      dragging: false,
      frameLoaderReadyPromise: Promise.resolve(),
      loadToken: "",
      loadTimer: null,
      loadState: "loading",
      contentReady: false,
      loadError: ""
    };
    paneByWindow.set(win, existing);
    applyPaneGeometry(win, existing);
    renderPaneFallback(existing);
    return existing;
  }

  function applyPaneGeometry(win, paneState) {
    if (!paneState || !paneState.host || !paneState.splitter) return;
    const width = clampWidth(paneState.width);
    paneState.width = width;
    paneState.host.style.width = `${width}px`;
    paneState.host.style.minWidth = `${UI.minWidth}px`;
    paneState.host.style.maxWidth = `${UI.maxWidth}px`;
    paneState.host.style.height = "100%";
    paneState.splitter.style.height = "100%";

    const visible = shouldShowPaneInWindow(win, paneState);
    paneState.host.hidden = !visible;
    paneState.splitter.hidden = !visible;
  }

  function setVisible(win, visible) {
    const paneState = ensurePaneForWindow(win);
    if (!paneState) return false;
    paneState.visible = !!visible;
    savePrefBool(STORE.visible, paneState.visible);
    applyPaneGeometry(win, paneState);
    if (paneState.visible && !paneState.contentReady && paneState.loadState !== "loading") {
      beginPanelLoad(win, paneState, { force: true });
    }
    return paneState.visible;
  }

  function cleanupWindow(win) {
    const paneState = paneByWindow.get(win);
    if (!paneState) return;
    try {
      if (paneState.splitter && paneState.onMouseDown) {
        paneState.splitter.removeEventListener("mousedown", paneState.onMouseDown, true);
      }
      if (paneState.host && paneState.onMouseEnter) {
        paneState.host.removeEventListener("mouseenter", paneState.onMouseEnter, true);
      }
      if (paneState.host && paneState.onMouseLeave) {
        paneState.host.removeEventListener("mouseleave", paneState.onMouseLeave, true);
      }
      if (paneState.retryButton && paneState.onRetry) {
        paneState.retryButton.removeEventListener("command", paneState.onRetry, true);
      }
      if (paneState.onMouseMove) win.removeEventListener("mousemove", paneState.onMouseMove, true);
      if (paneState.onMouseUp) win.removeEventListener("mouseup", paneState.onMouseUp, true);
      if (paneState.onResize) win.removeEventListener("resize", paneState.onResize);
      const tabmail = getTabmail(win);
      if (tabmail && tabmail.tabContainer && paneState.onTabSelect) {
        tabmail.tabContainer.removeEventListener("TabSelect", paneState.onTabSelect, true);
      }
      if (paneState.observer) paneState.observer.disconnect();
      clearLoadTimer(paneState);
    } catch (_) {
      // Ignore cleanup errors.
    }
    paneByWindow.delete(win);
  }

  var TbMailPane = class extends ExtensionCommon.ExtensionAPI {
    getAPI(context) {
      ExtensionErrorClass = getExtensionErrorClass();
      extensionBase = context.extension.baseURI.spec;
      extensionBrowserConfig = {
        remote: !!context.extension.remote,
        remoteType: context.extension.remoteType || "",
        browsingContextGroupId: context.extension.browsingContextGroupId ?? null
      };
      return {
        TbMailPane: {
          async show() {
            const windows = getMailWindows();
            if (!windows.length) fail("No mail:3pane window available");
            for (const win of windows) {
              setVisible(win, true);
            }
            const current = getCurrentMailWindow() || windows[0];
            const paneState = current ? ensurePaneForWindow(current) : null;
            if (!current || !paneState) fail("Mail pane host was not created");
            const visible = await verifyPaneVisible(current, paneState);
            if (!visible) fail("Mail pane host is still not visible after show()");
            await waitForPanelOutcome(current, paneState);
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
            if (next) {
              const visible = await verifyPaneVisible(win, paneState);
              if (!visible) fail("Mail pane host is still not visible after toggle()");
              await waitForPanelOutcome(win, paneState);
            }
            return next;
          },
          async getState() {
            const win = getCurrentMailWindow();
            if (!win) {
              return {
                visible: false,
                width: clampWidth(loadPrefInt(STORE.width, UI.defaultWidth)),
                contentReady: false,
                loadState: "loading"
              };
            }
            const paneState = ensurePaneForWindow(win);
            return {
              visible: isPaneActuallyVisible(win, paneState),
              width: clampWidth(paneState.width),
              contentReady: !!paneState.contentReady,
              loadState: paneState.loadState
            };
          },
          async showFailureAlert(message) {
            const services = getServices();
            const win = getCurrentMailWindow() || services.wm.getMostRecentWindow(null);
            const text = String(message || "Todo Sidebar pane failed to open.");
            services.prompt.alert(win, "Todo Sidebar", text);
            return true;
          },
          async markPanelReady(token) {
            const found = findPaneByToken(token);
            if (!found) return false;
            setPaneLoadState(found.paneState, "ready");
            return true;
          },
          async markPanelLoadFailed(token, reason) {
            const found = findPaneByToken(token);
            if (!found) return false;
            setPaneLoadState(found.paneState, "error", reason);
            return true;
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
