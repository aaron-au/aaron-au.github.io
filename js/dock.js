/* Dock: rendered from the app registry. Apps with a `folder` property are
   grouped into a folder item that fans out (macOS dock-folder style — ours
   fans rightward since the dock lives on the left edge). Magnification is
   pure CSS (see macos.css). */
"use strict";

const Dock = (() => {
  const items = new Map();   // appId -> button element (direct dock items)
  let folderBtn = null;
  let fanEl = null;
  let folderAppIds = [];

  function makeTile(app, size) {
    const tile = document.createElement("span");
    tile.className = "icon-tile " + app.tile;
    tile.appendChild(svgIcon(app.icon, size));
    return tile;
  }

  function makeLabel(text) {
    const label = document.createElement("span");
    label.className = "dock-label";
    label.textContent = text;
    return label;
  }

  function render() {
    const dock = document.getElementById("dock");
    dock.textContent = "";
    items.clear();
    folderAppIds = Apps.all().filter((a) => a.folder).map((a) => a.id);

    // Start button (visible only under the Windows skin; opens the system menu)
    const start = document.createElement("button");
    start.className = "dock-item win-start";
    start.setAttribute("aria-label", "Start");
    const startTile = document.createElement("span");
    startTile.className = "icon-tile";
    startTile.appendChild(svgIcon("icon-winlogo", 22));
    start.appendChild(startTile);
    start.addEventListener("click", (e) => {
      e.stopPropagation();
      document.getElementById("menu-logo").click();
    });
    dock.appendChild(start);

    Apps.all().filter((a) => !a.folder && !a.hidden).forEach((app) => {
      const btn = document.createElement("button");
      btn.className = "dock-item";
      btn.setAttribute("aria-label", "Open " + app.title);
      btn.appendChild(makeLabel(app.title));
      btn.appendChild(makeTile(app, 26));
      const dot = document.createElement("span");
      dot.className = "dock-dot";
      btn.appendChild(dot);
      btn.addEventListener("click", () => { closeFan(); WM.activate(app.id); });
      dock.appendChild(btn);
      items.set(app.id, btn);
    });

    if (folderAppIds.length) renderFolder(dock);
  }

  function renderFolder(dock) {
    folderBtn = document.createElement("button");
    folderBtn.className = "dock-item dock-folder";
    folderBtn.setAttribute("aria-label", "Games folder");
    folderBtn.setAttribute("aria-haspopup", "true");
    folderBtn.setAttribute("aria-expanded", "false");
    folderBtn.appendChild(makeLabel("Games"));

    const tile = document.createElement("span");
    tile.className = "icon-tile tile-games";
    tile.appendChild(svgIcon("icon-folder", 26));
    folderBtn.appendChild(tile);

    const dot = document.createElement("span");
    dot.className = "dock-dot";
    folderBtn.appendChild(dot);

    // Fan-out panel: one item per game, arcing out from the folder
    fanEl = document.createElement("div");
    fanEl.className = "dock-fan";
    fanEl.setAttribute("role", "menu");
    fanEl.hidden = true;
    folderAppIds.forEach((id, i) => {
      const app = Apps.get(id);
      const item = document.createElement("button");
      item.className = "dock-fan-item";
      item.style.setProperty("--fan-i", i);
      item.setAttribute("role", "menuitem");
      item.setAttribute("aria-label", "Open " + app.title);
      item.appendChild(makeTile(app, 24));
      const name = document.createElement("span");
      name.className = "dock-fan-name";
      name.textContent = app.title;
      item.appendChild(name);
      const dot = document.createElement("span");
      dot.className = "dock-dot";
      item.appendChild(dot);
      item.addEventListener("click", () => { closeFan(); WM.activate(id); });
      fanEl.appendChild(item);
    });

    folderBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFan();
    });
    document.addEventListener("click", (e) => {
      if (!fanEl.hidden && !fanEl.contains(e.target)) closeFan();
    });

    dock.appendChild(folderBtn);
    document.getElementById("macos-root").appendChild(fanEl);
  }

  function toggleFan() {
    if (fanEl.hidden) openFan();
    else closeFan();
  }

  function openFan() {
    // Anchor the fan to the folder: rightward from the macOS dock,
    // upward from the Windows taskbar
    const r = folderBtn.getBoundingClientRect();
    if (document.documentElement.dataset.skin === "win") {
      fanEl.style.left = (r.left + r.width / 2) + "px";
      fanEl.style.top = "auto";
      fanEl.style.bottom = (window.innerHeight - r.top + 12) + "px";
    } else {
      fanEl.style.left = (r.right + 14) + "px";
      fanEl.style.top = (r.top + r.height / 2) + "px";
      fanEl.style.bottom = "auto";
    }
    fanEl.hidden = false;
    folderBtn.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => fanEl.classList.add("open"));
    update();
  }

  function closeFan() {
    if (!fanEl || fanEl.hidden) return;
    fanEl.classList.remove("open");
    fanEl.hidden = true;
    folderBtn.setAttribute("aria-expanded", "false");
  }

  function isFanOpen() { return !!fanEl && !fanEl.hidden; }

  function update() {
    items.forEach((btn, id) => {
      btn.classList.toggle("running", WM.isOpen(id));
    });
    if (folderBtn) {
      folderBtn.classList.toggle("running", folderAppIds.some((id) => WM.isOpen(id)));
      if (fanEl) [...fanEl.children].forEach((item, i) => {
        item.classList.toggle("running", WM.isOpen(folderAppIds[i]));
      });
    }
  }

  return { render, update, closeFan, isFanOpen };
})();
