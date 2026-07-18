/* Wi-Fi — a fake network picker behind the Wi-Fi icons in the macOS menu bar,
   the Windows tray, and the iOS status bar. One shared menu element lives as
   a direct child of <body>, so no skin or mode can hide its container (see
   CLAUDE.md rule 5); each shell just positions it differently in CSS.

   The "connected" network is GitHub Pages itself, and its state mirrors
   githubstatus.com: during a major incident the Wi-Fi reports disconnected,
   because this site IS GitHub Pages and is therefore technically down —
   whether or not you are currently reading it. Don't think about it.
   The status API is only queried on load and when the menu opens (throttled),
   never on a background timer — no idle chatter to third parties.

   Secured networks take a password that is never correct (a family tradition;
   see js/login.js). The password field is a masked contenteditable, not an
   <input type=password> — CLAUDE.md rule 3. The open network is a trap, and
   choosing it is its own reward. */
"use strict";

const WiFi = (() => {
  const STATUS_URL = "https://www.githubstatus.com/api/v2/status.json";
  const STATUS_TTL = 120000; // don't hit the status API more than every 2 min

  const HOME_SSID = "github-pages";

  const NETWORKS = [
    { ssid: "Pretty Fly for a Wi-Fi", bars: 3 },
    { ssid: "FBI Surveillance Van #4", bars: 2,
      quip: "Incorrect. This attempt has been added to your file." },
    { ssid: "It Hurts When IP", bars: 2 },
    { ssid: "The LAN Before Time", bars: 3 },
    { ssid: "Definitely Not a Honeypot", bars: 3,
      quip: "Incorrect. (The honeypot thing was a joke. Probably.)" },
    { ssid: "NBN_As_Advertised", bars: 1 },
    { ssid: "Router? I Hardly Know Her", bars: 2 },
    { ssid: "Free Public Wi-Fi ✨", bars: 3, open: true },
  ];

  /* Escalating refusals, one per attempt. A network's `quip` replaces the
     first line. After the last one, the network hides for the session. */
  const FAILS = [
    "Incorrect Wi-Fi password.",
    "Still incorrect. Stealing the neighbours' Wi-Fi, are we?",
    "It's not “password123”. It's never “password123”.",
    "Attempt four logged. The router is judging you now.",
    "The homeowner has been notified. Probably.",
  ];
  const lastFail = (ssid) => "“" + ssid + "” is now hiding — from you, specifically.";

  const PWNED_LINES = [
    "CONNECTED: Free Public Wi-Fi ✨",
    "",
    "negotiating captive portal .......... ok",
    "accepting terms of service (47 pp) .. on your behalf",
    "downloading browser history ......... done (impressive, by the way)",
    "uploading soul ...................... done",
    "encrypting your files ............... just kidding. or am I?",
    "",
    "NEVER. TRUST. OPEN. WI-FI.",
    "",
    "— aaronOS network security team (est. moments ago)",
  ];

  let menu, pwned, trapping = false;
  const attempts = new Map(); // ssid -> failed attempt count (survives menu close)
  let gh = { state: "unknown", description: "", at: 0 };

  const toggles = () => ["wifi-toggle", "win-wifi-toggle", "ios-wifi-toggle"]
    .map((id) => document.getElementById(id)).filter(Boolean);

  /* ---------- GitHub status (the "connected" network's ground truth) ---------- */

  async function refreshStatus() {
    if (Date.now() - gh.at < STATUS_TTL) return;
    gh.at = Date.now();
    try {
      const res = await fetch(STATUS_URL, { cache: "no-store" });
      const data = await res.json();
      gh = { state: (data.status && data.status.indicator) || "none",
             description: (data.status && data.status.description) || "",
             at: Date.now() };
    } catch (e) {
      gh = { state: "unreachable", description: "", at: Date.now() };
    }
    reflectStatus();
  }

  function isDown() {
    return gh.state === "major" || gh.state === "critical" || gh.state === "unreachable";
  }

  function reflectStatus() {
    toggles().forEach((b) => b.classList.toggle("wifi-off", isDown()));
    if (!menu) return;
    menu.classList.toggle("wifi-down", isDown());
    menu.querySelector(".wifi-check").textContent = isDown() ? "✕" : "✓";
    const sub = menu.querySelector(".wifi-current .wifi-sub");
    if (gh.state === "none")
      sub.textContent = "Connected — you are literally on it right now.";
    else if (gh.state === "minor")
      sub.textContent = "Connected, mostly. GitHub says: “" + gh.description + "”.";
    else if (gh.state === "unreachable")
      sub.textContent = "Can't reach GitHub Status — either you're offline, or the status page is. Awkward either way.";
    else
      sub.textContent = "GitHub is having an incident, so this site is technically down. Yet here you are, reading it. Don't think about it too hard.";
  }

  /* ---------- menu ---------- */

  function isOpen() { return !!menu && !menu.hidden; }

  function setOpen(open) {
    menu.hidden = !open;
    toggles().forEach((b) => b.setAttribute("aria-expanded", String(open)));
    if (open) refreshStatus();
    else collapseJoins();
  }

  function collapseJoins() {
    menu.querySelectorAll(".wifi-join").forEach((j) => {
      j.hidden = true;
      j.querySelector(".wifi-pw").textContent = "";
    });
  }

  const barsSvg = (bars) =>
    '<svg class="icon wifi-bars-' + bars + '" width="15" height="11" aria-hidden="true"><use href="#icon-wifi"/></svg>';
  const lockSvg =
    '<svg class="icon" width="11" height="11" aria-hidden="true"><use href="#icon-lock"/></svg>';

  function render() {
    menu.innerHTML =
      '<div class="wifi-head">Wi-Fi</div>' +
      '<div class="wifi-current">' +
        '<div class="wifi-row"><span class="wifi-check">✓</span>' +
          '<span class="wifi-name">' + HOME_SSID + "</span>" +
          '<span class="wifi-glyphs">' + lockSvg + barsSvg(3) + "</span></div>" +
        '<small class="wifi-sub">Checking with GitHub…</small>' +
      "</div>" +
      '<div class="wifi-sep">Other Networks</div>' +
      '<ul class="wifi-list"></ul>';

    const list = menu.querySelector(".wifi-list");
    NETWORKS.forEach((net) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<button class="wifi-row"><span class="wifi-check"></span>' +
          '<span class="wifi-name"></span>' +
          '<span class="wifi-glyphs">' + (net.open ? "" : lockSvg) + barsSvg(net.bars) + "</span></button>" +
        (net.open
          ? '<small class="wifi-sub" hidden>Connecting…</small>'
          : '<div class="wifi-join" hidden>' +
              '<div class="wifi-pw-box">' +
                '<span class="wifi-pw" contenteditable="true" role="textbox" aria-label="Wi-Fi password" ' +
                      'spellcheck="false" autocapitalize="off" autocorrect="off" enterkeyhint="go"></span>' +
                '<button class="wifi-join-go">Join</button>' +
              "</div>" +
              '<p class="wifi-hint" role="status"></p>' +
            "</div>");
      li.querySelector(".wifi-name").textContent = net.ssid;
      const row = li.querySelector(".wifi-row");

      if (net.open) {
        row.addEventListener("click", () => springTrap(li));
      } else {
        const join = li.querySelector(".wifi-join");
        const pw = li.querySelector(".wifi-pw");
        const hint = li.querySelector(".wifi-hint");
        const box = li.querySelector(".wifi-pw-box");

        row.addEventListener("click", () => {
          const wasHidden = join.hidden;
          collapseJoins();
          join.hidden = !wasHidden;
          if (!join.hidden) pw.focus();
        });

        const fail = () => {
          const n = (attempts.get(net.ssid) || 0) + 1;
          attempts.set(net.ssid, n);
          pw.textContent = "";
          if (n > FAILS.length) {
            hint.textContent = lastFail(net.ssid);
            pw.setAttribute("contenteditable", "false");
            setTimeout(() => { li.hidden = true; }, 1600); // gone for the session
            return;
          }
          hint.textContent = (n === 1 && net.quip) || FAILS[n - 1];
          box.classList.remove("shake");
          void box.offsetWidth; // restart the animation
          box.classList.add("shake");
          pw.focus();
        };
        li.querySelector(".wifi-join-go").addEventListener("click", fail);
        pw.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); fail(); }
        });
        pw.addEventListener("paste", (e) => {
          e.preventDefault();
          const text = (e.clipboardData || window.clipboardData).getData("text/plain");
          document.execCommand("insertText", false, text.replace(/\n/g, ""));
        });
      }
      list.appendChild(li);
    });
  }

  /* ---------- the trap ---------- */

  function springTrap(li) {
    if (trapping) return;
    trapping = true;
    li.querySelector(".wifi-sub").hidden = false;

    const reboot = document.getElementById("reboot-screen");
    const rebootText = reboot.querySelector(".reboot-text");

    setTimeout(() => {
      setOpen(false);
      document.body.classList.add("wifi-glitch");
    }, 900);
    setTimeout(() => {
      document.body.classList.remove("wifi-glitch");
      rebootText.textContent = "Recovering…";
      reboot.hidden = false;
    }, 2050);
    setTimeout(() => {
      reboot.hidden = true;
      rebootText.textContent = "Restarting…";
      showPwned();
      li.querySelector(".wifi-sub").hidden = true;
    }, 3650);
  }

  function showPwned() {
    const pre = pwned.querySelector(".pwned-lines");
    const back = pwned.querySelector(".pwned-return");
    pre.textContent = "";
    back.hidden = true;
    pwned.hidden = false;
    PWNED_LINES.forEach((line, i) => {
      setTimeout(() => { pre.textContent += line + "\n"; }, 350 + i * 320);
    });
    setTimeout(() => { back.hidden = false; back.focus(); },
      350 + PWNED_LINES.length * 320 + 400);
  }

  function leavePwned() {
    const reboot = document.getElementById("reboot-screen");
    const rebootText = reboot.querySelector(".reboot-text");
    pwned.hidden = true;
    rebootText.textContent = "Reconnecting to " + HOME_SSID + "…";
    reboot.hidden = false;
    setTimeout(() => {
      reboot.hidden = true;
      rebootText.textContent = "Restarting…";
      trapping = false;
    }, 1400);
  }

  /* Escape-key hook for main.js: returns true if the key was consumed. */
  function handleEscape() {
    if (!pwned.hidden) {
      if (!pwned.querySelector(".pwned-return").hidden) leavePwned();
      return true; // swallow Esc during the sequence either way
    }
    if (trapping) return true;
    if (isOpen()) { setOpen(false); return true; }
    return false;
  }

  /* ---------- boot ---------- */

  function init() {
    menu = document.getElementById("wifi-menu");
    pwned = document.getElementById("pwned-screen");
    render();

    toggles().forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(menu.hidden);
    }));
    document.addEventListener("click", (e) => {
      if (isOpen() && !menu.contains(e.target)) setOpen(false);
    });
    pwned.querySelector(".pwned-return").addEventListener("click", leavePwned);

    refreshStatus();
  }

  return { init, isOpen, close: () => setOpen(false), handleEscape };
})();
