/* Settings — the phone-sized home for controls that live in the menubar and
   system menu on desktop (iOS mode has neither). Wi-Fi reuses the shared
   network list from js/wifi.js as a full drill-in page; appearance and
   "Restart into…" go through window.System so all shells stay in sync. */
"use strict";

const Settings = (() => {
  function init(node) {
    const root = node.querySelector(".settings");

    /* ---- Wi-Fi: drill-in page, same list/join/trap logic as the menu ---- */
    WiFi.renderNetworks(node.querySelector(".set-wifi-list"));
    node.querySelector(".set-open-wifi").addEventListener("click", () => {
      root.classList.add("show-wifi");
      WiFi.refresh(); // throttled inside wifi.js
    });
    node.querySelector(".set-back").addEventListener("click", () => {
      root.classList.remove("show-wifi");
    });

    /* ---- appearance ---- */
    const sw = node.querySelector(".set-switch");
    const reflectTheme = () => {
      sw.setAttribute("aria-checked",
        String(document.documentElement.dataset.effectiveTheme === "dark"));
    };
    sw.addEventListener("click", () => {
      window.System.setTheme(
        document.documentElement.dataset.effectiveTheme === "dark" ? "light" : "dark");
    });
    // The menubar/tray toggles change the same attribute — mirror them too
    new MutationObserver(reflectTheme).observe(document.documentElement,
      { attributes: true, attributeFilter: ["data-effective-theme"] });
    reflectTheme();

    /* ---- skin ---- */
    const skinLabel = node.querySelector(".set-skin-label");
    const reflectSkin = () => {
      skinLabel.textContent = window.System.currentSkin() === "win"
        ? "Restart into macOS…" : "Restart into Windows…";
    };
    node.querySelector(".set-skin").addEventListener("click", () => {
      window.System.rebootInto(window.System.currentSkin() === "win" ? "mac" : "win");
    });
    document.addEventListener("skinchange", reflectSkin);
    reflectSkin();
  }

  return { init };
})();

Apps.onCreate("settings", Settings.init);
