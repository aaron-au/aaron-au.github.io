/* iOS shell: home-screen grid, full-screen app view with zoom-from-icon
   animation, and the home indicator (tap or swipe up to go home). */
"use strict";

const IOS = (() => {
  const ANIM_MS = 340;
  let currentAppId = null;
  let closeTimer = null;

  const appview = () => document.getElementById("ios-appview");
  const appviewBody = () => document.getElementById("ios-appview-body");

  function render() {
    const home = document.getElementById("ios-icon-grid");
    home.textContent = "";
    Apps.all().filter((a) => !a.hidden).forEach((app) => {
      const btn = document.createElement("button");
      btn.className = "ios-app-icon";
      btn.setAttribute("aria-label", "Open " + app.title);

      const tile = document.createElement("span");
      tile.className = "icon-tile " + app.tile;
      tile.appendChild(svgIcon(app.icon, 32));

      const label = document.createElement("span");
      label.className = "ios-app-label";
      label.textContent = app.title;

      btn.appendChild(tile);
      btn.appendChild(label);
      btn.addEventListener("click", () => open(app.id, tile));
      home.appendChild(btn);
    });

    const indicator = document.getElementById("ios-home-indicator");
    indicator.addEventListener("click", goHome);
    // Swipe up ≥ 50px on the home indicator also goes home
    makeDraggable(indicator, {
      onEnd({ dy }) { if (dy < -50) goHome(); },
    });
  }

  function open(id, originEl) {
    const app = Apps.get(id);
    if (!app || currentAppId === id) return;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    if (currentAppId !== null) Apps.stash(currentAppId);
    currentAppId = id;

    const view = appview();
    if (originEl) {
      const r = originEl.getBoundingClientRect();
      view.style.transformOrigin = (r.left + r.width / 2) + "px " + (r.top + r.height / 2) + "px";
    } else {
      view.style.transformOrigin = "50% 50%";
    }

    document.getElementById("ios-appview-title").textContent = app.title;
    // Clear any leftovers (e.g. a node orphaned by a mid-animation app switch
    // or a content reset) before attaching the new app
    const body = appviewBody();
    const stashEl = document.getElementById("content-stash");
    while (body.firstChild) stashEl.appendChild(body.firstChild);
    body.appendChild(Apps.getContent(id));
    view.setAttribute("aria-hidden", "false");
    sessionStore.set("ios-app", id);
    if (!app.hidden) setUrlHash(id);
    // Two frames so the initial (scaled-down) state paints before transitioning
    requestAnimationFrame(() => requestAnimationFrame(() => view.classList.add("open")));
  }

  function goHome() {
    if (currentAppId === null) return;
    const id = currentAppId;
    currentAppId = null;
    sessionStore.remove("ios-app");
    const view = appview();
    view.classList.remove("open");
    view.setAttribute("aria-hidden", "true");
    closeTimer = setTimeout(() => {
      Apps.notifyClose(id);
      Apps.stash(id);
      closeTimer = null;
    }, ANIM_MS);
  }

  /* ---------- mode switching ---------- */

  function suspend() {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    if (currentAppId !== null) {
      Apps.stash(currentAppId);
      currentAppId = null;
    }
    const view = appview();
    view.classList.remove("open");
    view.setAttribute("aria-hidden", "true");
  }

  function resume() {
    /* iOS mode always resumes at the home screen — simple and natural. */
  }

  function activeApp() { return currentAppId; }

  return { render, open, goHome, suspend, resume, activeApp };
})();
