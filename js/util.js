/* Shared helpers used by every module. Loaded first. */
"use strict";

/* localStorage can throw (Safari private mode, blocked storage) — the site
   must run fine with zero persistence. */
const safeStore = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch (e) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  },
};

/* One pointer-drag implementation for windows, resize handles, the sticky
   note, and the iOS home-indicator swipe. Handles mouse + touch + pen via
   Pointer Events; the handle element needs `touch-action: none` in CSS. */
function makeDraggable(handle, { onStart, onMove, onEnd, ignore } = {}) {
  handle.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (ignore && e.target.closest(ignore)) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let started = false;

    const ctx = { startX, startY, event: e };
    if (onStart && onStart(ctx) === false) return;
    started = true;

    handle.setPointerCapture(e.pointerId);
    document.body.classList.add("dragging");

    const move = (ev) => {
      if (!started) return;
      onMove && onMove({ dx: ev.clientX - startX, dy: ev.clientY - startY, event: ev });
    };
    const finish = (ev) => {
      started = false;
      document.body.classList.remove("dragging");
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", finish);
      handle.removeEventListener("pointercancel", finish);
      onEnd && onEnd({ dx: ev.clientX - startX, dy: ev.clientY - startY, event: ev });
    };

    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
  });
}

/* Tab-scoped storage (survives soft refresh, not new tabs). Same throw-safety
   rules as safeStore. */
const sessionStore = {
  get(key) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch (e) { return null; }
  },
  set(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },
  remove(key) {
    try { sessionStorage.removeItem(key); } catch (e) {}
  },
};

/* Update the address bar without adding history entries (deep links). */
function setUrlHash(hash) {
  try {
    history.replaceState(null, "", hash ? "#" + hash : location.pathname + location.search);
  } catch (e) {}
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function svgIcon(symbolId, size) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", "#" + symbolId);
  svg.appendChild(use);
  return svg;
}
