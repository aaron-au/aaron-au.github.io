/* Boot + glue: theme, clock, mode switching, menu bar, sticky note, keys. */
"use strict";

(() => {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const phoneWidth = window.matchMedia("(max-width: 699px)");

  /* ---------- theme ---------- */

  function effectiveTheme() {
    return root.dataset.theme || (systemDark.matches ? "dark" : "light");
  }

  function reflectTheme() {
    root.dataset.effectiveTheme = effectiveTheme();
    const btn = document.getElementById("theme-toggle");
    btn.setAttribute("aria-pressed", String(effectiveTheme() === "dark"));
  }

  function toggleTheme() {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    safeStore.set("theme", next);
    reflectTheme();
  }

  /* ---------- clock (shared by menu bar + iOS status bar) ---------- */

  const menubarFmt = new Intl.DateTimeFormat(undefined, {
    weekday: "short", day: "numeric", month: "short",
    hour: "numeric", minute: "2-digit",
  });
  const iosFmt = new Intl.DateTimeFormat(undefined, {
    hour: "numeric", minute: "2-digit",
  });
  let lastClock = "";

  function tickClock() {
    const now = new Date();
    const text = menubarFmt.format(now);
    if (text === lastClock) return;
    lastClock = text;
    document.getElementById("menubar-clock").textContent = text;
    document.getElementById("ios-clock").textContent = iosFmt.format(now);
  }

  /* ---------- mode switching ---------- */

  let macosBooted = false;
  let iosBooted = false;

  function applyMode() {
    const mode = phoneWidth.matches ? "ios" : "macos";
    if (document.body.dataset.mode === mode) return;
    const previous = document.body.dataset.mode;
    document.body.dataset.mode = mode;

    if (previous === "macos") WM.suspend();
    if (previous === "ios") IOS.suspend();

    if (mode === "macos") {
      WM.resume();
      if (!macosBooted) {
        macosBooted = true;
        // A soft refresh restores whatever was open; otherwise the defaults
        if (!WM.restoreSession()) {
          Apps.all().filter((a) => a.defaultOpen).forEach((a) => WM.open(a.id));
        }
      }
    } else {
      IOS.resume();
      if (!iosBooted) {
        iosBooted = true;
        const saved = sessionStore.get("ios-app");
        if (saved && Apps.get(saved)) IOS.open(saved);
      }
    }
  }

  /* ---------- deep links: #app, #blog/<topic>, #blog/post/<slug> ---------- */

  function applyHash() {
    const raw = location.hash.slice(1);
    if (!raw) return;
    const parts = raw.split("/").map(decodeURIComponent);
    const app = Apps.get(parts[0]);
    if (!app || app.hidden) return;
    if (document.body.dataset.mode === "ios") IOS.open(app.id);
    else WM.open(app.id);
    if (app.id === "blog") {
      if (parts[1] === "post" && parts[2]) Blog.openSlug(parts[2]);
      else if (parts[1]) Blog.openTag(parts[1]);
    }
  }

  /* ---------- menu bar dropdown ---------- */

  function setupLogoMenu() {
    const logoBtn = document.getElementById("menu-logo");
    const menu = document.getElementById("logo-menu");

    const setOpen = (open) => {
      menu.hidden = !open;
      logoBtn.setAttribute("aria-expanded", String(open));
    };

    logoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(menu.hidden);
    });
    document.addEventListener("click", (e) => {
      if (!menu.hidden && !menu.contains(e.target)) setOpen(false);
    });
    menu.addEventListener("click", () => setOpen(false));
    document.getElementById("menu-restart").addEventListener("click", () => location.reload());
    document.getElementById("menu-logout").addEventListener("click", () => Login.lock());

    return { isOpen: () => !menu.hidden, close: () => setOpen(false) };
  }

  /* ---------- boot ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    Login.init();
    reflectTheme();
    systemDark.addEventListener("change", reflectTheme);
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

    tickClock();
    setInterval(tickClock, 1000);

    Dock.render();
    IOS.render();

    const logoMenu = setupLogoMenu();

    // Anything with data-open-app opens that app in the current shell
    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open-app]");
      if (!opener) return;
      const id = opener.dataset.openApp;
      if (document.body.dataset.mode === "ios") IOS.open(id, opener.querySelector(".icon-tile"));
      else WM.open(id);
      if (id === "blog" && opener.dataset.blogTag) Blog.openTag(opener.dataset.blogTag);
    });

    Widgets.init();

    // Escape: close the dropdown if open, otherwise the focused window
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (Login.isLocked()) return; // the login screen handles its own keys
      if (logoMenu.isOpen()) { logoMenu.close(); return; }
      if (Dock.isFanOpen()) { Dock.closeFan(); return; }
      if (document.body.dataset.mode === "macos") {
        const focused = Apps.get(WM.focusedApp());
        if (focused && focused.escCloses === false) return; // e.g. DOOM's own menu uses Esc
        WM.closeFocused();
      } else {
        const active = Apps.get(IOS.activeApp());
        if (active && active.escCloses === false) return;
        IOS.goHome();
      }
    });

    // Keep windows reachable when the browser resizes
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => WM.reclampAll(), 100);
    });

    phoneWidth.addEventListener("change", applyMode);
    applyMode();

    // Deep link on arrival (after session restore, so it lands focused on top)
    applyHash();
    // …and when the visitor edits the hash / follows an in-page anchor.
    // Our own navigation uses history.replaceState, which doesn't fire this.
    window.addEventListener("hashchange", applyHash);
  });
})();
