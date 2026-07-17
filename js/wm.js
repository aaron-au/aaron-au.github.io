/* macOS window manager: create/drag/resize/focus/minimize/maximize/close,
   viewport clamping, and per-app geometry persistence. */
"use strict";

const WM = (() => {
  const MENUBAR_H = 28;
  const MIN_W = 280;
  const MIN_H = 180;
  const MIN_VISIBLE = 60;   // px of titlebar that must stay reachable
  const ANIM_MS = 300;

  const openWins = new Map(); // id -> { el, minimized }
  let focusStack = [];        // ids, last = frontmost
  let cascade = 0;
  let suspendedOpenIds = null;

  const desktop = () => document.getElementById("desktop");

  /* ---------- geometry ---------- */

  function clampPos(x, y, w) {
    return {
      x: clamp(x, MIN_VISIBLE - w, window.innerWidth - MIN_VISIBLE),
      y: clamp(y, MENUBAR_H, Math.max(MENUBAR_H, window.innerHeight - 48)),
    };
  }

  function applyRect(el, rect) {
    el.style.left = rect.x + "px";
    el.style.top = rect.y + "px";
    el.style.width = rect.w + "px";
    el.style.height = rect.h + "px";
  }

  function currentRect(el) {
    return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
  }

  function persistRect(id, el) {
    if (el.classList.contains("maximized")) return;
    safeStore.set("win:" + id, currentRect(el));
  }

  function initialRect(app) {
    const stored = safeStore.get("win:" + app.id);
    if (stored && [stored.x, stored.y, stored.w, stored.h].every(Number.isFinite)) {
      const pos = clampPos(stored.x, stored.y, stored.w);
      return { x: pos.x, y: pos.y, w: stored.w, h: stored.h };
    }
    const w = Math.min(app.width, window.innerWidth - 40);
    const h = Math.min(app.height, window.innerHeight - MENUBAR_H - 110);
    const x = Math.max(20, (window.innerWidth - w) / 2 - 120 + cascade * 26);
    const y = Math.max(MENUBAR_H + 12, (window.innerHeight - h) / 2 - 40 + cascade * 26);
    cascade = (cascade + 1) % 6;
    const pos = clampPos(x, y, w);
    return { x: pos.x, y: pos.y, w, h };
  }

  /* ---------- focus / z-order ---------- */

  function zRefresh() {
    focusStack.forEach((id, i) => {
      const win = openWins.get(id);
      if (!win) return;
      win.el.style.zIndex = 10 + i;
      win.el.classList.toggle("focused", i === focusStack.length - 1);
    });
  }

  function bringToFront(id) {
    const i = focusStack.indexOf(id);
    if (i !== -1) focusStack.splice(i, 1);
    focusStack.push(id);
    zRefresh();
  }

  function focusedId() {
    for (let i = focusStack.length - 1; i >= 0; i--) {
      const win = openWins.get(focusStack[i]);
      if (win && !win.minimized) return focusStack[i];
    }
    return null;
  }

  /* ---------- window construction ---------- */

  function buildWindow(app) {
    const el = document.createElement("section");
    el.className = "window";
    el.dataset.appId = app.id;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", app.title || "About this site");
    if (app.resizable === false) el.classList.add("fixed-size");

    const titlebar = document.createElement("div");
    titlebar.className = "titlebar";

    const lights = document.createElement("div");
    lights.className = "traffic-lights";
    const mkLight = (cls, label) => {
      const b = document.createElement("button");
      b.className = cls;
      b.setAttribute("aria-label", label + " " + app.title);
      lights.appendChild(b);
      return b;
    };
    const btnClose = mkLight("tl-close", "Close");
    const btnMin = mkLight("tl-minimize", "Minimise");
    const btnMax = mkLight("tl-maximize", "Zoom");

    const title = document.createElement("span");
    title.className = "window-title";
    title.textContent = app.title;

    titlebar.appendChild(lights);
    titlebar.appendChild(title);

    const body = document.createElement("div");
    body.className = "window-body";

    el.appendChild(titlebar);
    el.appendChild(body);

    btnClose.addEventListener("click", () => close(app.id));
    btnMin.addEventListener("click", () => minimize(app.id));
    if (app.resizable === false) {
      btnMax.disabled = true;
    } else {
      btnMax.addEventListener("click", () => toggleMaximize(app.id));
      titlebar.addEventListener("dblclick", (e) => {
        if (!e.target.closest(".traffic-lights")) toggleMaximize(app.id);
      });
    }

    // Any press inside the window focuses it (capture so children can't stop it)
    el.addEventListener("pointerdown", () => bringToFront(app.id), true);

    // Drag by titlebar
    let dragStart = null;
    makeDraggable(titlebar, {
      ignore: ".traffic-lights",
      onStart() {
        if (el.classList.contains("maximized")) return false;
        dragStart = { x: el.offsetLeft, y: el.offsetTop };
      },
      onMove({ dx, dy }) {
        const pos = clampPos(dragStart.x + dx, dragStart.y + dy, el.offsetWidth);
        el.style.left = pos.x + "px";
        el.style.top = pos.y + "px";
      },
      onEnd() { persistRect(app.id, el); },
    });

    // Resize from any edge or corner, macOS-style
    if (app.resizable !== false) {
      ["n", "s", "e", "w", "ne", "nw", "se", "sw"].forEach((dir) => {
        const grip = document.createElement("div");
        grip.className = "resize-edge re-" + dir;
        grip.setAttribute("aria-hidden", "true");
        el.appendChild(grip);

        let start = null;
        makeDraggable(grip, {
          onStart() {
            if (el.classList.contains("maximized")) return false;
            start = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
          },
          onMove({ dx, dy }) {
            let { x, y, w, h } = start;
            if (dir.includes("e")) w = start.w + dx;
            if (dir.includes("s")) h = start.h + dy;
            if (dir.includes("w")) { w = start.w - dx; x = start.x + dx; }
            if (dir.includes("n")) { h = start.h - dy; y = start.y + dy; }
            // enforce minimums without letting the anchored edge drift
            if (w < MIN_W) { if (dir.includes("w")) x -= MIN_W - w; w = MIN_W; }
            if (h < MIN_H) { if (dir.includes("n")) y -= MIN_H - h; h = MIN_H; }
            if (y < MENUBAR_H) { h -= MENUBAR_H - y; y = MENUBAR_H; }
            el.style.left = x + "px";
            el.style.top = y + "px";
            el.style.width = Math.min(w, window.innerWidth) + "px";
            el.style.height = Math.min(h, window.innerHeight - MENUBAR_H) + "px";
          },
          onEnd() { persistRect(app.id, el); },
        });
      });
    }

    return el;
  }

  /* Snapshot the open set (order = z-order) so a soft refresh can restore it */
  function saveSession() {
    sessionStore.set("wm-windows", focusStack.map((id) => {
      const win = openWins.get(id);
      return { id, min: !!win.minimized, max: win.el.classList.contains("maximized") };
    }));
  }

  function restoreSession() {
    const saved = sessionStore.get("wm-windows");
    if (!saved || !saved.length) return false;
    saved.forEach((s) => {
      if (!Apps.get(s.id)) return;
      open(s.id);
      if (s.max) toggleMaximize(s.id);
      if (s.min) minimize(s.id);
    });
    return true;
  }

  /* ---------- public operations ---------- */

  function open(id) {
    const existing = openWins.get(id);
    if (existing) {
      if (existing.minimized) restore(id);
      else bringToFront(id);
      Dock.update();
      return;
    }
    const app = Apps.get(id);
    if (!app) return;

    const el = buildWindow(app);
    applyRect(el, initialRect(app));
    el.querySelector(".window-body").appendChild(Apps.getContent(id));
    desktop().appendChild(el);
    openWins.set(id, { el, minimized: false });
    bringToFront(id);
    Dock.update();
    saveSession();
    if (!app.hidden) setUrlHash(id); // deep-linkable; blog refines this further
  }

  function close(id) {
    const win = openWins.get(id);
    if (!win) return;
    persistRect(id, win.el);
    Apps.notifyClose(id);
    Apps.stash(id);
    win.el.remove();
    openWins.delete(id);
    focusStack = focusStack.filter((x) => x !== id);
    zRefresh();
    Dock.update();
    saveSession();
  }

  function minimize(id) {
    const win = openWins.get(id);
    if (!win || win.minimized) return;
    win.minimized = true;
    win.el.classList.add("mini");
    setTimeout(() => { if (win.minimized) win.el.style.display = "none"; }, ANIM_MS);
    // Focus falls to the next non-minimized window
    focusStack = focusStack.filter((x) => x !== id);
    focusStack.unshift(id);
    zRefresh();
    Dock.update();
    saveSession();
  }

  function restore(id) {
    const win = openWins.get(id);
    if (!win || !win.minimized) return;
    win.minimized = false;
    win.el.style.display = "";
    requestAnimationFrame(() => win.el.classList.remove("mini"));
    bringToFront(id);
    Dock.update();
    saveSession();
  }

  function toggleMaximize(id) {
    const win = openWins.get(id);
    if (!win) return;
    const el = win.el;
    if (el.classList.contains("maximized")) {
      el.classList.remove("maximized");
      const prev = JSON.parse(el.dataset.prevRect || "null");
      if (prev) applyRect(el, prev);
    } else {
      el.dataset.prevRect = JSON.stringify(currentRect(el));
      el.style.left = el.style.top = el.style.width = el.style.height = "";
      el.classList.add("maximized");
    }
    bringToFront(id);
    saveSession();
  }

  function closeFocused() {
    const id = focusedId();
    if (id) close(id);
  }

  function isOpen(id) { return openWins.has(id); }
  function isMinimized(id) {
    const win = openWins.get(id);
    return !!(win && win.minimized);
  }
  function isFocused(id) { return focusedId() === id; }

  /* Dock click semantics: not open → open; minimized → restore; else focus. */
  function activate(id) {
    if (!openWins.has(id)) open(id);
    else if (isMinimized(id)) restore(id);
    else { bringToFront(id); Dock.update(); }
  }

  function reclampAll() {
    openWins.forEach((win, id) => {
      if (win.el.classList.contains("maximized")) return;
      const pos = clampPos(win.el.offsetLeft, win.el.offsetTop, win.el.offsetWidth);
      win.el.style.left = pos.x + "px";
      win.el.style.top = pos.y + "px";
    });
  }

  /* ---------- mode switching ---------- */

  function suspend() {
    suspendedOpenIds = [...focusStack];
    openWins.forEach((win, id) => Apps.stash(id));
  }

  function resume() {
    // Reattach content to any windows that survived (their chrome stayed in the DOM)
    openWins.forEach((win, id) => {
      win.el.querySelector(".window-body").appendChild(Apps.getContent(id));
    });
    zRefresh();
    Dock.update();
    suspendedOpenIds = null;
  }

  return {
    open, close, minimize, restore, toggleMaximize, activate, closeFocused,
    isOpen, isMinimized, isFocused, reclampAll, suspend, resume, bringToFront,
    restoreSession,
    focusedApp: focusedId,
  };
})();
