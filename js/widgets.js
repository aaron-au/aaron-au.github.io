/* Desktop/iOS widgets: world clocks for the timezones I work across, and the
   battery indicator. The battery is an easter egg: it drains linearly from
   100% at 8am to 0% at 10pm Sydney time (my working hours), and "recharges"
   overnight. Nothing on the site explains this — that's the point. */
"use strict";

const Widgets = (() => {
  const ZONES = [
    { label: "Canada",      tz: "America/Vancouver",    flag: "🇨🇦" },
    { label: "US Central",  tz: "America/Chicago",      flag: "🇺🇸" },
    { label: "US East",     tz: "America/New_York",     flag: "🇺🇸" },
    { label: "US West",     tz: "America/Los_Angeles",  flag: "🇺🇸" },
    { label: "Hong Kong",   tz: "Asia/Hong_Kong",       flag: "🇭🇰" },
    { label: "India",       tz: "Asia/Kolkata",         flag: "🇮🇳" },
    { label: "Italy",       tz: "Europe/Rome",          flag: "🇮🇹" },
    { label: "Australia",   tz: "Australia/Sydney",     flag: "🇦🇺" },
    { label: "New Zealand", tz: "Pacific/Auckland",     flag: "🇳🇿" },
  ];

  const DAY_START = 8 * 60;    // 08:00
  const DAY_END = 22 * 60;     // 22:00

  const clockEls = [];  // { timeFmt, subFmt, timeEl, subEl, last }

  /* ---------- clocks ---------- */

  function renderClocks(container) {
    // Alphabetical by label, however the list above is maintained
    const zones = [...ZONES].sort((a, b) => a.label.localeCompare(b.label));
    zones.forEach((zone) => {
      const card = document.createElement("div");
      card.className = "clock-widget";

      const city = document.createElement("span");
      city.className = "cw-city";
      const flag = document.createElement("span");
      flag.className = "cw-flag";
      flag.textContent = zone.flag;
      flag.setAttribute("aria-hidden", "true");
      city.appendChild(flag);
      city.appendChild(document.createTextNode(zone.label));

      const time = document.createElement("span");
      time.className = "cw-time";

      const sub = document.createElement("span");
      sub.className = "cw-sub";

      card.appendChild(city);
      card.appendChild(time);
      card.appendChild(sub);
      container.appendChild(card);

      clockEls.push({
        timeFmt: new Intl.DateTimeFormat(undefined, { timeZone: zone.tz, hour: "numeric", minute: "2-digit" }),
        subFmt: new Intl.DateTimeFormat(undefined, { timeZone: zone.tz, weekday: "short", day: "numeric", month: "short" }),
        timeEl: time,
        subEl: sub,
        last: "",
      });
    });
  }

  function tickClocks() {
    const now = new Date();
    clockEls.forEach((c) => {
      const t = c.timeFmt.format(now);
      if (t === c.last) return;
      c.last = t;
      c.timeEl.textContent = t;
      c.subEl.textContent = c.subFmt.format(now);
    });
  }

  /* ---------- battery ---------- */

  const sydneyTime = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney", hour: "numeric", minute: "numeric", hourCycle: "h23",
  });

  function batteryState(now) {
    const parts = sydneyTime.formatToParts(now);
    const get = (type) => Number(parts.find((p) => p.type === type).value);
    const m = get("hour") * 60 + get("minute");
    if (m >= DAY_START && m < DAY_END) {
      return { pct: Math.round(100 * (DAY_END - m) / (DAY_END - DAY_START)), charging: false };
    }
    const elapsed = (m - DAY_END + 1440) % 1440;               // minutes since 22:00
    const nightLen = 1440 - (DAY_END - DAY_START);             // 22:00 → 08:00
    return { pct: Math.round(100 * Math.min(1, elapsed / nightLen)), charging: true };
  }

  function batterySvg({ pct, charging }) {
    const fillW = Math.max(0.8, 16.4 * pct / 100);
    const color = charging ? "#34c759" : (pct <= 20 ? "#ff453a" : "currentColor");
    const bolt = charging
      ? '<path d="M11.6 2.2 L8.2 6.6 L10.6 6.6 L9.4 9.8 L12.8 5.4 L10.4 5.4 Z" fill="#fff" stroke="rgba(0,0,0,0.35)" stroke-width="0.5"/>'
      : "";
    return '<svg width="25" height="12" viewBox="0 0 25 12" aria-hidden="true">' +
      '<rect x="0.8" y="0.8" width="20" height="10.4" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>' +
      '<rect x="2.6" y="2.6" width="' + fillW + '" height="6.8" rx="1.6" fill="' + color + '"/>' +
      '<path d="M22.8 4 A2.2 2.2 0 0 1 22.8 8 Z" fill="currentColor" opacity="0.5"/>' +
      bolt + "</svg>";
  }

  let lastBattery = "";

  function tickBattery() {
    const state = batteryState(new Date());
    const key = state.pct + ":" + state.charging;
    if (key === lastBattery) return;
    lastBattery = key;
    const svg = batterySvg(state);
    const label = "Battery: " + state.pct + "%" + (state.charging ? ", charging" : "");
    const menubarEl = document.getElementById("menubar-battery");
    menubarEl.innerHTML = '<span class="batt-pct">' + state.pct + "%</span>" + svg;
    const iosEl = document.getElementById("ios-battery");
    iosEl.innerHTML = svg;
    const winEl = document.getElementById("win-battery");
    if (winEl) winEl.innerHTML = svg;
    [menubarEl, iosEl, winEl].filter(Boolean).forEach((el) => {
      el.title = label;
      el.setAttribute("aria-label", label);
    });
  }

  /* ---------- boot ---------- */

  function init() {
    renderClocks(document.getElementById("desktop-widgets"));
    renderClocks(document.getElementById("ios-widgets"));
    tickClocks();
    tickBattery();
    setInterval(() => { tickClocks(); tickBattery(); }, 1000);

    // The desktop widget panel is draggable, like everything else on the desktop.
    // It starts anchored bottom-right via CSS; the first drag switches it to
    // left/top positioning so it goes wherever it's dropped.
    const panel = document.getElementById("desktop-widgets");
    let start = null;
    makeDraggable(panel, {
      onStart() {
        start = { x: panel.offsetLeft, y: panel.offsetTop };
        panel.style.left = start.x + "px";
        panel.style.top = start.y + "px";
        panel.style.right = "auto";
        panel.style.bottom = "auto";
      },
      onMove({ dx, dy }) {
        panel.style.left = clamp(start.x + dx, -100, window.innerWidth - 120) + "px";
        panel.style.top = clamp(start.y + dy, 28, window.innerHeight - 60) + "px";
      },
    });
  }

  /* Current easter-egg battery state — used by the Terminal too. */
  function batteryNow() { return batteryState(new Date()); }

  return { init, batteryNow };
})();
