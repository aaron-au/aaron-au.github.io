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

    setupPages();
  }

  /* Home pages (widgets / apps): scroll-snap does the swiping, this just
     keeps the dots honest and makes them clickable (mouse fallback). */
  function setupPages() {
    const pages = document.getElementById("ios-pages");
    const dotsNav = document.getElementById("ios-page-dots");
    dotsNav.textContent = "";
    const dots = [...pages.children].map((page, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", "Page " + (i + 1) + ": " + (page.getAttribute("aria-label") || ""));
      dot.addEventListener("click", () =>
        pages.scrollTo({ left: i * pages.clientWidth, behavior: "smooth" }));
      dotsNav.appendChild(dot);
      return dot;
    });
    const reflect = () => {
      // clientWidth is 0 while iOS mode is display:none — treat as page 0
      const w = pages.clientWidth;
      const i = w ? clamp(Math.round(pages.scrollLeft / w), 0, dots.length - 1) : 0;
      dots.forEach((d, j) => d.classList.toggle("active", j === i));
    };
    pages.addEventListener("scroll", () => requestAnimationFrame(reflect), { passive: true });
    // Mode switches arrive via browser resize; re-sync the dots then too
    window.addEventListener("resize", () => requestAnimationFrame(reflect));
    reflect();
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
