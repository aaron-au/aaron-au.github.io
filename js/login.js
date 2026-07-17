/* Login screen: shown on every load. "Aaron Lees" asks for a password that is
   never correct (that's the joke); "Guest Account" logs straight in, like a
   real macOS guest user. The password field is a masked contenteditable, not
   an <input type=password> — password managers would otherwise offer to save
   a password that can never work. */
"use strict";

const Login = (() => {
  let clockTimer = null;
  let attempts = 0;
  let surrendered = false;

  /* Session memory: a soft refresh keeps you logged in; a hard refresh (or a
     new tab) starts back at the login screen. sessionStorage scopes the flag
     to the tab. Hard refreshes are detected by their keyboard shortcut — the
     keydown for ⌘⇧R / Ctrl+Shift+R / Ctrl+F5 reaches the page before the
     browser reloads, so we clear the flag right then. (Cache-based detection
     was tried first and abandoned: Firefox re-downloads the document in full
     on EVERY reload against servers without Cache-Control headers, making
     soft reloads indistinguishable from hard ones by transfer size.) */
  const session = {
    get() { try { return sessionStorage.getItem("loggedIn") === "1"; } catch (e) { return false; } },
    set() { try { sessionStorage.setItem("loggedIn", "1"); } catch (e) {} },
    clear() { try { sessionStorage.removeItem("loggedIn"); } catch (e) {} },
  };

  function watchForHardRefresh() {
    window.addEventListener("keydown", (e) => {
      const isR = (e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "r";
      const isF5 = e.key === "F5";
      if ((isR && e.shiftKey) || (isF5 && (e.ctrlKey || e.shiftKey))) {
        // Hard refresh = fresh start: login state AND the window session go
        try { sessionStorage.clear(); } catch (err) {}
      }
    }, true);
  }

  /* Escalating sarcasm for attempts 1–9; attempt 10 "succeeds" (see fail()). */
  const HINTS = [
    "Incorrect password.",
    "Incorrect password — you won't get in.",
    "Incorrect password — are you still trying?",
    "Incorrect password — this is genuinely my account.",
    "Incorrect password — the Guest Account is RIGHT there.",
    "Incorrect password — I admire the persistence, though.",
    "Incorrect password — fine, it's 'hunter2'. (It isn't.)",
    "Incorrect password — at this point I'm billing you for the CPU cycles.",
  ];

  function isLocked() {
    const screen = document.getElementById("login-screen");
    return !!screen && !screen.hidden;
  }

  function init() {
    const screen = document.getElementById("login-screen");

    watchForHardRefresh();
    const alreadyLoggedIn = session.get();

    const usersView = screen.querySelector(".login-users");
    const aaronView = screen.querySelector(".login-aaron");
    const pwBox = screen.querySelector(".login-pw-box");
    const pwField = screen.querySelector(".login-pw-field");
    const hint = screen.querySelector(".login-hint");

    // Big lock-screen clock
    const timeEl = screen.querySelector(".login-clock-time");
    const dateEl = screen.querySelector(".login-clock-date");
    const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
    const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" });
    const tick = () => {
      const now = new Date();
      timeEl.textContent = timeFmt.format(now);
      dateEl.textContent = dateFmt.format(now);
    };
    startClock();
    function startClock() {
      tick();
      clearInterval(clockTimer);
      clockTimer = setInterval(tick, 1000);
    }
    Login._startClock = startClock; // reused by lock()

    screen.querySelector('[data-user="guest"]').addEventListener("click", unlock);
    screen.querySelector('[data-user="aaron"]').addEventListener("click", () => {
      usersView.hidden = true;
      aaronView.hidden = false;
      pwField.focus();
    });
    screen.querySelector(".login-back").addEventListener("click", () => {
      aaronView.hidden = true;
      usersView.hidden = false;
      pwField.textContent = "";
      hint.textContent = "";
    });

    const fail = () => {
      if (surrendered) return;
      attempts++;
      pwField.textContent = "";

      // Attempt 10: persistence pays off. Sort of.
      if (attempts >= 10) {
        surrendered = true;
        pwField.setAttribute("contenteditable", "false");
        hint.textContent = "…okay. You got me. The password was persistence all along. Welcome in…";
        setTimeout(() => { hint.textContent = "…as GUEST ACCOUNT. Obviously. What did you expect?"; }, 2000);
        setTimeout(unlock, 3800);
        return;
      }

      hint.textContent = HINTS[Math.min(attempts, HINTS.length) - 1];
      pwBox.classList.remove("shake");
      void pwBox.offsetWidth; // restart the animation
      pwBox.classList.add("shake");
      pwField.focus();
    };
    screen.querySelector(".login-pw-go").addEventListener("click", fail);
    pwField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); fail(); }
      if (e.key === "Escape") { e.preventDefault(); screen.querySelector(".login-back").click(); }
    });
    pwField.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text.replace(/\n/g, ""));
    });

    function unlock() {
      session.set();
      document.documentElement.dataset.loggedIn = "1";
      screen.classList.add("unlocked");
      clearInterval(clockTimer);
      setTimeout(() => { screen.hidden = true; }, 600);
    }

    // Soft refresh while logged in: straight to the desktop, no animation.
    // Everything above stays wired so Log Out can bring the screen back.
    if (alreadyLoggedIn) {
      screen.classList.add("unlocked");
      screen.hidden = true;
      clearInterval(clockTimer);
    }
  }

  /* "Log Out" from the system menu: back to the lock screen, fresh state.
     Open windows survive behind it, like a real fast-user-switch. */
  function lock() {
    session.clear();
    delete document.documentElement.dataset.loggedIn;
    const screen = document.getElementById("login-screen");
    const pwField = screen.querySelector(".login-pw-field");
    attempts = 0;
    surrendered = false;
    pwField.setAttribute("contenteditable", "true");
    pwField.textContent = "";
    screen.querySelector(".login-hint").textContent = "";
    screen.querySelector(".login-aaron").hidden = true;
    screen.querySelector(".login-users").hidden = false;
    screen.hidden = false;
    requestAnimationFrame(() => screen.classList.remove("unlocked"));
    if (Login._startClock) Login._startClock();
  }

  return { init, isLocked, lock };
})();
