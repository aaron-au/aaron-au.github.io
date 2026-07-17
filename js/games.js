/* Games launcher — DOOM, Quake, and Lemmings, all via js-dos v6.22 (DOSBox →
   WebAssembly), fully self-hosted (vendor/jsdos/ + assets/*.zip). Payloads
   load lazily on the Launch click, never at page load.

   All three payloads are legitimately redistributable: DOOM 1.9 shareware,
   Quake 1.06 shareware (SLICNSE.TXT included), and the official Psygnosis
   4-level Lemmings demonstration disc (README.DOC included).

   Lifecycle is symmetric with the shell (worked out empirically for DOOM):
   - Quitting a game → DOSBox runs "exit" → its main loop is cancelled and
     tick callbacks stop for good → a watchdog notices and closes the window
     (or sends the iOS app home). Ticks are the ONLY reliable signal: this
     wdosbox build terminates without calling Emscripten's exit(), so neither
     Module.onExit nor Module.quit fires (the quit hook stays as a backstop).
     The watchdog arms only after sustained ticking so slow game loads can't
     false-trigger it, and it ignores hidden tabs (rAF throttling).
   - Window close / iOS home → ci.exit() tears the emulator down and the app
     content resets, so the next open shows a fresh launch screen. */
"use strict";

const Games = (() => {
  const CONFIG = {
    doom: {
      blurb: "The 1993 id Software classic — shareware Episode 1, Knee-Deep in the Dead — running in a DOS emulator, in a fake window, in your browser. It's emulators all the way down.",
      controls: [
        "<strong>Arrows</strong> move  ·  <strong>Ctrl</strong> fire  ·  <strong>Space</strong> open doors",
        "<strong>Shift</strong> run  ·  <strong>1–3</strong> weapons  ·  <strong>Esc</strong> game menu",
      ],
      launchLabel: "Rip and tear",
      note: "Downloads ~4 MB on launch. Keyboard required. The shareware episode has been freely redistributable since 1993.",
      zip: "./assets/doom.zip",
      run: ["-c", "DOOM.EXE", "-c", "exit"],
    },
    quake: {
      blurb: "id Software, 1996 \u2014 the shareware episode, Dimension of the Doomed, via WebQuake (a native JS/WebGL port of the engine \u2014 DOS Quake's protected-mode setup defeats the DOS emulator, and this runs far better anyway).",
      controls: [
        "<strong>Click the view</strong> to capture the mouse \u2002\u00b7\u2002 <strong>Mouse</strong> aims, <strong>click</strong> fires",
        "<strong>Arrows/WASD</strong> move \u2002\u00b7\u2002 <strong>Space</strong> jump \u2002\u00b7\u2002 <strong>Esc</strong> game menu",
      ],
      launchLabel: "Enter the slipgate",
      note: "Downloads ~18 MB on launch. Shareware v1.06 pak \u2014 id's licence text ships alongside (SLICNSE.TXT).",
      engine: "iframe",
      src: "./vendor/webquake/index.htm",
    },
    lemmings: {
      blurb: "DMA Design / Psygnosis, 1991 — the official 4-level demonstration disc. Guide the clueless green-haired critters home. Oh no.",
      controls: [
        "<strong>Mouse</strong> does everything — click a skill, click a lemming",
        "<strong>F1</strong> starts the game from the title screen  ·  <strong>Esc</strong> abandons a level",
      ],
      launchLabel: "Let's go",
      note: "Downloads ~0.3 MB on launch. Mouse strongly recommended (their words, 1991).",
      zip: "./assets/lemmings.zip",
      run: ["-c", "CD LEMMINGS", "-c", "CALL VGALEMMI.BAT /v", "-c", "exit"],
    },
  };

  // Per-game runtime state
  const state = new Map(); // id -> { ci, iframe, cancelled, watchdog }
  let closingFromUi = false;

  function getState(id) {
    if (!state.has(id)) state.set(id, { ci: null, iframe: null, cancelled: false, watchdog: null });
    return state.get(id);
  }

  function init(node, id) {
    const cfg = CONFIG[id];
    const app = Apps.get(id);
    node.querySelector(".game-title").textContent = app.title;
    node.querySelector(".game-blurb").textContent = cfg.blurb;
    node.querySelector(".game-controls").innerHTML =
      cfg.controls.map((c) => "<li>" + c + "</li>").join("");
    const btn = node.querySelector(".game-launch");
    btn.textContent = cfg.launchLabel;
    node.querySelector(".game-note").textContent = cfg.note;

    const intro = node.querySelector(".game-intro");
    const stage = node.querySelector(".game-stage");
    const status = node.querySelector(".game-status");

    btn.addEventListener("click", () => {
      btn.disabled = true;
      getState(id).cancelled = false;

      if (cfg.engine === "iframe") { boot(id, intro, stage, status); return; }
      status.textContent = "Loading emulator…";
      if (window.Dos) { boot(id, intro, stage, status); return; }
      const script = document.createElement("script");
      script.src = "./vendor/jsdos/js-dos.js";
      script.onload = () => boot(id, intro, stage, status);
      script.onerror = () => {
        status.textContent = "Couldn't load the emulator. Try a hard refresh.";
        btn.disabled = false;
      };
      document.head.appendChild(script);
    });
  }

  /* WebQuake runs in a same-origin iframe. Its quit path shows the classic
     text "end screen" instead of exiting — we poll for it to close the shell. */
  function bootIframe(id, intro, stage, status) {
    const cfg = CONFIG[id];
    const st = getState(id);
    intro.hidden = true;
    status.textContent = "";

    const frame = document.createElement("iframe");
    frame.className = "game-frame";
    frame.src = cfg.src;
    frame.setAttribute("title", Apps.get(id).title);
    frame.setAttribute("allow", "pointer-lock; fullscreen; autoplay");
    frame.setAttribute("allowfullscreen", "");
    stage.appendChild(frame);
    st.iframe = frame;

    st.watchdog = setInterval(() => {
      try {
        const doc = frame.contentDocument;
        if (!doc) return;
        const end1 = doc.getElementById("end1");
        const end2 = doc.getElementById("end2");
        if ((end1 && end1.style.display !== "none") ||
            (end2 && end2.style.display !== "none")) onGameExit(id);
      } catch (e) { /* frame navigating */ }
    }, 1000);
  }

  function boot(id, intro, stage, status) {
    const cfg = CONFIG[id];
    if (cfg.engine === "iframe") { bootIframe(id, intro, stage, status); return; }
    const st = getState(id);
    intro.hidden = true;
    status.textContent = "Spinning up DOS…";

    const canvas = document.createElement("canvas");
    canvas.className = "game-canvas";
    canvas.setAttribute("tabindex", "0");
    stage.appendChild(canvas);

    Dos(canvas, {
      wdosboxUrl: "./vendor/jsdos/wdosbox.js",
      quit(statusCode, toThrow) { // backstop; see header comment
        setTimeout(() => onGameExit(id), 0);
        if (toThrow) throw toThrow;
      },
    }).ready((fs, main) => {
      status.textContent = "Extracting game files…";
      fs.extract(cfg.zip).then(() => {
        status.textContent = "";
        main(cfg.run).then((commandInterface) => {
          st.ci = commandInterface;
          if (st.cancelled) { teardown(id); return; } // closed mid-boot
          startExitWatchdog(id, commandInterface);
        });
        canvas.focus();
      }).catch(() => {
        status.textContent = "Couldn't load the game files.";
      });
    });
  }

  function startExitWatchdog(id, commandInterface) {
    const ARM_AFTER_TICKS = 50; // ~a few seconds of steady emulation
    const MAX_GAP_MS = 3000;
    const st = getState(id);
    let ticks = 0;
    let lastTick = performance.now();
    commandInterface.dos.registerTickListener(() => {
      ticks++;
      lastTick = performance.now();
    });
    st.watchdog = setInterval(() => {
      if (ticks < ARM_AFTER_TICKS) return;                       // still booting
      if (document.hidden) { lastTick = performance.now(); return; }
      if (performance.now() - lastTick > MAX_GAP_MS) onGameExit(id);
    }, 500);
  }

  /* DOSBox exited on its own → close the surrounding shell. */
  function onGameExit(id) {
    const st = getState(id);
    clearInterval(st.watchdog);
    st.watchdog = null;
    st.ci = null;
    if (closingFromUi) return;
    if (document.body.dataset.mode === "macos") WM.close(id);
    else if (IOS.activeApp() === id) IOS.goHome();
  }

  /* The shell closed the app → stop the emulator. */
  function teardown(id) {
    const st = getState(id);
    closingFromUi = true;
    clearInterval(st.watchdog);
    st.watchdog = null;
    try { if (st.ci) st.ci.exit(); } catch (e) { /* runtime already gone */ }
    if (st.iframe) { st.iframe.src = "about:blank"; st.iframe = null; }
    st.ci = null;
    st.cancelled = true;
    // Deferred: the quit() backstop fires via setTimeout(0) during ci.exit()
    setTimeout(() => { closingFromUi = false; }, 50);
  }

  function ids() { return Object.keys(CONFIG); }

  return { init, teardown, ids };
})();

Games.ids().forEach((id) => {
  Apps.onCreate(id, (node) => Games.init(node, id));
  Apps.onClose(id, () => {
    Games.teardown(id);
    Apps.resetContent(id); // next open = fresh launch screen
  });
});
