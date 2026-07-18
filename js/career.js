/* Career Ladder — the interactive résumé. An 8-bit vertical platformer:
   one area per timeline entry (oldest at the bottom of the career, newest at
   the top), climb to the summit of each area and talk to pixel-Aaron to read
   that entry. Double jump, bounce pads, and grapple hooks (attach only to the
   hooks laid out in the level) are all available from the start. No death —
   falling just costs you height. Easy/Hard changes the platform geometry.

   Everything is generated: levels come from a seeded RNG whose moves are
   feasible BY CONSTRUCTION (each step's horizontal distance is derived from
   the jump physics, so a level can never be impossible), sprites are drawn
   with fillRect (outfits climb the corporate ladder: basement hoodie → full
   CEO suit), and the "sound card" is a WebAudio square wave.

   Résumé content is parsed at init from the #app-resume template — single
   source of truth, the game can never drift from the real résumé. */
"use strict";

const Career = (() => {
  const ID = "career";

  /* ---------- physics constants (world units = internal pixels) ---------- */
  const W = 320;            // world/canvas width; height varies per area
  const WALL = 10;          // side wall thickness
  const PW = 10, PH = 14;   // player size
  const GRAV = 0.32, MOVE = 2.1, MAXFALL = 7.2;
  const JUMP_V = 6.0;       // apex ≈ 56px
  const DJ_V = 5.4;         // second jump, mid-air
  const BOUNCE_V = 9.3;     // pads, apex ≈ 135px
  const COYOTE = 6;         // frames of forgiveness off a ledge
  const GRAPPLE_R = 92;     // attach range to a hook
  const ROPE_MIN = 22, REEL = 0.5, SWING = 0.14;
  const FALL_SETBACK = 110; // landing this far below the last stand = "setback"

  /* ---------- character options ---------- */
  const HAIR_STYLES = ["Buzz", "Spiky", "Mop", "Ponytail"];
  const HAIR_COLORS = [
    ["Black", "#2a2320"], ["Brown", "#6f4326"],
    ["Blond", "#d8b256"], ["Pink", "#e06fd0"],
  ];
  const SKIN_TONES = ["#f0c9a1", "#d9a06f", "#a9714b", "#6f4a30"];
  /* The corporate ladder, bottom to top. NPC-Aaron wears the tier matching
     the area index, so he suits up as you climb toward the present day. */
  const OUTFITS = [
    { name: "Basement Dev",    top: "#55684f", legs: "#3a3d44", shoes: "#8a9096", hood: true },
    { name: "Weekend Tee",     top: "#c0503f", legs: "#3e5f8a", shoes: "#e8e8ee" },
    { name: "Startup Polo",    top: "#3f8f6b", legs: "#b99a68", shoes: "#6f4a30", collar: "#2f6b50" },
    { name: "Business Casual", top: "#7fb3d6", legs: "#4a4e59", shoes: "#2a2320", collar: "#e8eef4" },
    { name: "Shirt & Tie",     top: "#e8e8ee", legs: "#33363f", shoes: "#2a2320", collar: "#c9ccd6", tie: "#b03040" },
    { name: "Full Suit CEO",   top: "#25304a", legs: "#25304a", shoes: "#1a1410", shirt: "#e8e8ee", tie: "#8a2f3c", shades: true },
  ];

  /* ---------- module state ---------- */
  let root = null;          // the app content node
  let cv = null, ctx = null;
  let viewH = 240;          // internal canvas height (width is always W)
  let rafId = 0;
  let frame = 0;
  let mode = "menu";        // menu | play | dialog | pause | end
  let entries = [];         // parsed résumé entries, oldest first
  let level = null;         // current generated level
  let levelIdx = 0;
  let diff = "easy";
  let player = null;
  let camY = 0;
  let stats = { frames: 0, falls: 0 };
  let toastTimer = 0;
  let resizeObs = null;
  let detachInput = null;

  const prefs = Object.assign(
    { hair: 0, hairc: 1, skin: 0, outfit: 1, muted: false },
    safeStore.get("career-prefs") || {});
  const savePrefs = () => safeStore.set("career-prefs", prefs);

  const keys = { left: false, right: false };

  /* ================= tiny sound card ================= */

  let actx = null;
  function blip(f0, f1, dur, type, vol) {
    if (prefs.muted) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime;
      const osc = actx.createOscillator();
      const g = actx.createGain();
      osc.type = type || "square";
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
      g.gain.setValueAtTime(vol || 0.035, t);
      g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
      osc.connect(g).connect(actx.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    } catch (e) { /* no audio, no problem */ }
  }
  const SFX = {
    jump()    { blip(300, 620, 0.09); },
    dj()      { blip(420, 860, 0.09); },
    bounce()  { blip(180, 900, 0.16); },
    grapple() { blip(700, 240, 0.08, "sawtooth"); },
    release() { blip(240, 520, 0.07); },
    talk()    { blip(520, 520, 0.05, "triangle", 0.05); },
    done()    { blip(392, 392, 0.1, "triangle", 0.05); setTimeout(() => blip(523, 523, 0.1, "triangle", 0.05), 110); setTimeout(() => blip(659, 659, 0.18, "triangle", 0.05), 220); },
    fall()    { blip(220, 90, 0.12, "triangle"); },
  };

  /* ================= colour helpers ================= */

  function hexRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    const A = hexRgb(a), B = hexRgb(b);
    return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",") + ")";
  }

  /* ================= résumé content ================= */

  /* Parse the timeline out of the real résumé template. Oldest first —
     you climb from 2010 toward the present. */
  function loadEntries() {
    const tpl = document.getElementById("app-resume");
    return [...tpl.content.querySelectorAll(".timeline-entry")].map((el) => ({
      period: el.querySelector(".tl-period").textContent.trim(),
      title: el.querySelector("h2").textContent.trim(),
      org: el.querySelector(".tl-org").textContent.trim(),
      bullets: [...el.querySelectorAll("ul:not(.tl-tags) li")].map((li) => li.textContent.trim()),
      tags: [...el.querySelectorAll(".tl-tags li")].map((li) => li.textContent.trim()),
      color: ((el.getAttribute("style") || "").match(/--dot:\s*(#[0-9a-fA-F]+)/) || [])[1] || "#7f8cff",
      current: el.classList.contains("current"),
    })).reverse();
  }

  /* ================= level generation ================= */

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Frames airborne until we're `dy` above launch height again (larger root),
     for initial upward speed v0. 0 means unreachable. */
  function airFrames(dy, v0) {
    const disc = v0 * v0 - 2 * GRAV * dy;
    if (disc <= 0) return 0;
    return (v0 + Math.sqrt(disc)) / GRAV;
  }

  function genLevel(idx, difficulty) {
    const hard = difficulty === "hard";
    const H = (hard ? 720 : 640) + idx * (hard ? 130 : 110);
    const r = mulberry32(1337 + idx * 7919 + (hard ? 101 : 0));
    const rand = (a, b) => a + r() * (b - a);
    const P = hard
      ? { pwMin: 30, pwMax: 46, hopMin: 32, hopMax: 48, djMin: 62, djMax: 86, bounceMin: 100, bounceMax: 124, margin: 0.82, wBounce: 0.13, wGrap: 0.2, wDj: 0.2, rest: 7 }
      : { pwMin: 54, pwMax: 86, hopMin: 28, hopMax: 42, djMin: 56, djMax: 72, bounceMin: 92, bounceMax: 112, margin: 0.68, wBounce: 0.14, wGrap: 0.12, wDj: 0.12, rest: 5 };

    const plats = [{ x: 0, y: H - 12, w: W, ground: true }];
    const pads = [], hooks = [];
    let prev = { cx: W / 2, top: H - 12, w: W };
    let zig = r() < 0.5 ? 1 : -1;
    let sinceRest = 0, moves = 0;

    const clampCx = (cx, w) => clamp(cx, WALL + 6 + w / 2, W - WALL - 6 - w / 2);
    const put = (cx, top, w) => {
      cx = clampCx(cx, w);
      plats.push({ x: cx - w / 2, y: top, w });
      prev = { cx, top, w };
      moves++; sinceRest++;
      if (r() < 0.35) zig = -zig;
      return cx;
    };
    /* A step whose centre-to-centre reach comes straight from the physics:
       air distance for the climb, plus the half-widths (minus an edge margin). */
    const step = (dy, t, w) => {
      const maxDx = MOVE * t * P.margin + (prev.w + w) / 2 - 10;
      const dx = rand(Math.min(22, maxDx * 0.4), Math.max(24, maxDx)) * zig;
      return put(prev.cx + dx, prev.top - dy, w);
    };

    while (prev.top > 170) {
      const w = rand(P.pwMin, P.pwMax);
      if (sinceRest >= P.rest) {           // breather ledge, keeps hard fair
        sinceRest = 0;
        step(rand(P.hopMin, P.hopMax - 6), airFrames(P.hopMax, JUMP_V), hard ? 90 : 110);
        continue;
      }
      const roll = r();
      if (roll < P.wGrap && prev.top > 260) {
        /* Grapple segment: hook overhead (jump to get in range), platform just
           below the hook — reel up, release, hop on. */
        const dyh = rand(70, 112);
        const dxh = Math.min(70, Math.sqrt(Math.max(0, 85 * 85 - (dyh - 52) * (dyh - 52))));
        const hx = clamp(prev.cx + rand(0, dxh) * zig, WALL + 20, W - WALL - 20);
        const hy = prev.top - dyh;
        hooks.push({ x: hx, y: hy });
        put(hx + rand(-40, 40), hy + rand(12, 26), w + 8);
      } else if (roll < P.wGrap + P.wBounce && prev.top > 260) {
        /* Bounce pad on the current platform, big vertical gain. */
        const px = clamp(prev.cx + rand(-1, 1) * (prev.w / 2 - 14), WALL + 14, W - WALL - 14);
        pads.push({ x: px - 11, y: prev.top, w: 22, squash: 0 });
        const dy = rand(P.bounceMin, P.bounceMax);
        const t = airFrames(dy + 8, BOUNCE_V);
        const maxDx = MOVE * t * 0.55 + (prev.w + w) / 2 - 10;
        put(px + rand(-maxDx, maxDx), prev.top - dy, w);
      } else if (roll < P.wGrap + P.wBounce + P.wDj) {
        const dy = rand(P.djMin, P.djMax);
        step(dy, JUMP_V / GRAV + airFrames(Math.max(0, dy - 48) + 8, DJ_V), w);
      } else {
        const dy = rand(P.hopMin, P.hopMax);
        step(dy, airFrames(dy + 8, JUMP_V), w);
      }
    }

    /* Summit: a wide floor with pixel-Aaron waiting on it. */
    const sw = 170;
    const scx = clampCx(prev.cx + rand(-40, 40), sw);
    const stop = prev.top - rand(P.hopMin, P.hopMax);
    plats.push({ x: scx - sw / 2, y: stop, w: sw, summit: true });

    /* Deterministic decorations. */
    const clouds = [];
    for (let i = 0; i < 4 + Math.floor(r() * 3); i++) {
      clouds.push({ x: rand(20, W - 60), y: rand(60, H - 220), w: rand(28, 60), h: rand(8, 14) });
    }
    const skyline = [];
    for (let x = 12; x < W - 12; x += 0) {
      const bw = rand(18, 38);
      skyline.push({ x, w: bw, h: rand(30, 90) });
      x += bw + rand(2, 8);
    }

    return {
      H, plats, pads, hooks, clouds, skyline,
      npc: { x: scx, y: stop - PH, face: -1 },
      spawn: { x: W / 2 - PW / 2, y: H - 12 - PH },
      summitY: stop,
      entry: entries[idx],
    };
  }

  /* ================= sprites (all fillRect) ================= */

  /* Draw a 10×14 person at (x, y) top-left, scaled by s.
     cfg: { skin, hairStyle, hairCol, outfit, npc } */
  function drawFigure(c, x, y, s, cfg, pose, face) {
    const o = OUTFITS[cfg.outfit];
    const px = (dx, dy, w, h, col) => {
      c.fillStyle = col;
      const fx = face < 0 ? PW - dx - w : dx; // mirror horizontally
      c.fillRect(Math.round(x + fx * s), Math.round(y + dy * s), w * s, h * s);
    };
    const skin = SKIN_TONES[cfg.skin];
    const hair = HAIR_COLORS[cfg.hairc][1];

    // legs (pose: 0 idle, 1/2 run, 3 jump)
    const legCol = o.legs;
    if (pose === 3) {           // tucked
      px(2.5, 11, 2, 2, legCol); px(5.5, 11.5, 2, 2, legCol);
      px(2.5, 13, 2, 1, o.shoes); px(5.5, 13, 2, 1, o.shoes);
    } else if (pose === 1) {
      px(2, 11, 2, 2, legCol); px(6, 11, 2, 3, legCol);
      px(1.5, 13, 2.5, 1, o.shoes); px(6, 13.5, 2.5, 0.5, o.shoes);
    } else if (pose === 2) {
      px(2.5, 11, 2, 3, legCol); px(5.5, 11, 2, 2, legCol);
      px(2.5, 13.5, 2.5, 0.5, o.shoes); px(5.5, 13, 2.5, 1, o.shoes);
    } else {
      px(2.5, 11, 2, 3, legCol); px(5.5, 11, 2, 3, legCol);
      px(2.5, 13.5, 2.5, 0.5, o.shoes); px(5.5, 13.5, 2.5, 0.5, o.shoes);
    }

    // torso + arms
    px(2, 6, 6, 5, o.top);
    px(1, 6.5, 1, 3.5, o.top); px(8, 6.5, 1, 3.5, o.top);
    if (o.shirt) { px(4, 6, 2, 4, o.shirt); }            // suit: shirt gap
    if (o.tie) { px(4.5, 6, 1, 3, o.tie); }
    if (o.collar) { px(2, 6, 6, 0.5, o.collar); }
    if (o.hood) { px(1.5, 5.5, 7, 1, o.top); }           // hood bunched at neck

    // head
    px(2.5, 1, 5, 5, skin);
    // face: eyes or CEO shades
    if (o.shades) px(3, 2.5, 5, 1.2, "#14161c");
    else { px(5.8, 2.8, 1, 1, "#20242c"); px(3.4, 2.8, 1, 1, "#20242c"); }
    if (cfg.npc) px(3, 4.8, 4.5, 1.2, mix(hair, "#888888", 0.35)); // beard

    // hair
    const st = HAIR_STYLES[cfg.hairStyle];
    if (st === "Buzz") { px(2.5, 0.5, 5, 1.2, hair); px(2, 1, 1, 2, hair); }
    else if (st === "Spiky") {
      px(2.5, 0.6, 5, 1, hair);
      px(2.6, 0, 1, 1, hair); px(4.4, -0.4, 1, 1.4, hair); px(6.2, 0, 1, 1, hair);
      px(2, 1, 1, 2, hair);
    } else if (st === "Mop") {
      px(2, 0.2, 6, 1.6, hair); px(1.8, 1, 1.2, 3.4, hair); px(7, 1, 1.2, 3.4, hair);
    } else {                                            // Ponytail
      px(2.3, 0.3, 5.2, 1.4, hair); px(2, 1, 1, 2, hair);
      px(8.1, 1.4, 1.2, 4.4, hair);                      // tail behind
    }
    if (o.hood && !cfg.npc) { px(1.8, 0, 6.6, 0.8, o.top); } // hood over hair
  }

  function poseFor(p) {
    if (!p.grounded) return 3;
    if (keys.left || keys.right) return (Math.floor(frame / 6) % 2) + 1;
    return 0;
  }

  /* ================= gameplay ================= */

  function newPlayer() {
    return {
      x: level.spawn.x, y: level.spawn.y, vx: 0, vy: 0, face: 1,
      grounded: true, coyote: 0, djAvail: true, grap: null,
      lastStandY: level.spawn.y,
    };
  }

  function startGame(difficulty) {
    diff = difficulty;
    levelIdx = 0;
    stats = { frames: 0, falls: 0 };
    loadLevel(0);
    setScreen("play");
    mode = "play";
  }

  function loadLevel(idx) {
    levelIdx = idx;
    level = genLevel(idx, diff);
    player = newPlayer();
    camY = level.H - viewH;
    const e = level.entry;
    root.querySelector(".cq-area").textContent =
      "AREA " + (idx + 1) + "/" + entries.length + " · " + e.period.toUpperCase();
    toast("AREA " + (idx + 1) + " — " + e.period + "\n" + e.title);
    root.querySelector(".cq-progress span").style.width = "0%";
  }

  function toast(text) {
    const el = root.querySelector(".cq-toast");
    el.textContent = text;
    el.hidden = false;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  function nearNpc() {
    if (!level) return false;
    const n = level.npc;
    return Math.abs((player.x + PW / 2) - n.x) < 26 && Math.abs(player.y - n.y) < 34;
  }

  /* The hook the grapple key would attach to right now. */
  function targetHook() {
    let best = null, bd = GRAPPLE_R;
    const cx = player.x + PW / 2, cy = player.y + PH / 2;
    for (const h of level.hooks) {
      if (h.y > cy + 6) continue;                 // only hooks above-ish
      const d = Math.hypot(h.x - cx, h.y - cy);
      if (d < bd) { bd = d; best = h; }
    }
    return best;
  }

  function doJump() {
    const p = player;
    if (p.grap) {                                  // release with a pop
      p.grap = null; p.djAvail = true;
      p.vy = Math.min(p.vy, 0) - 3.2;
      SFX.release();
    } else if (p.grounded || p.coyote > 0) {
      p.vy = -JUMP_V; p.grounded = false; p.coyote = 0; p.djAvail = true;
      SFX.jump();
    } else if (p.djAvail) {
      p.vy = -DJ_V; p.djAvail = false;
      SFX.dj();
    }
  }

  function doGrapple() {
    const p = player;
    if (p.grap) { p.grap = null; p.djAvail = true; SFX.release(); return; }
    const h = targetHook();
    if (!h) return;
    const cx = p.x + PW / 2, cy = p.y + PH / 2;
    p.grap = { hook: h, len: Math.max(ROPE_MIN, Math.hypot(h.x - cx, h.y - cy)) };
    p.grounded = false;
    SFX.grapple();
  }

  function talkOrGrapple() {
    if (nearNpc()) openDialog();
    else doGrapple();
  }

  function stepSim() {
    const p = player;
    stats.frames++;

    // horizontal input
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) p.face = dir;

    if (p.grap) {
      p.grap.len = Math.max(ROPE_MIN, p.grap.len - REEL);
      p.vx += dir * SWING;
      p.vx *= 0.995;
      p.vy += GRAV * 0.9;
      p.x += p.vx; p.y += p.vy;
      const h = p.grap.hook;
      let dx = (p.x + PW / 2) - h.x, dy = (p.y + PH / 2) - h.y;
      const d = Math.hypot(dx, dy) || 0.001;
      if (d > p.grap.len) {                        // rope taut: constrain
        const k = p.grap.len / d;
        p.x = h.x + dx * k - PW / 2;
        p.y = h.y + dy * k - PH / 2;
        const nx = dx / d, ny = dy / d;
        const vr = p.vx * nx + p.vy * ny;          // outward radial speed
        if (vr > 0) { p.vx -= vr * nx; p.vy -= vr * ny; }
      }
    } else {
      p.vx = dir * MOVE;
      p.vy = Math.min(p.vy + GRAV, MAXFALL);
      const prevBottom = p.y + PH;
      p.x += p.vx;
      p.y += p.vy;

      if (p.vy >= 0) {
        for (const pl of level.plats) {
          if (p.x + PW <= pl.x || p.x >= pl.x + pl.w) continue;
          if (prevBottom <= pl.y + 0.01 && p.y + PH >= pl.y) {
            p.y = pl.y - PH; p.vy = 0;
            // bounce pad under our feet?
            let bounced = false;
            for (const pad of level.pads) {
              if (pad.y === pl.y && p.x + PW > pad.x && p.x < pad.x + pad.w) {
                p.vy = -BOUNCE_V; p.djAvail = true; pad.squash = 10;
                bounced = true; SFX.bounce();
                break;
              }
            }
            if (!bounced) {
              if (!p.grounded && p.y - p.lastStandY > FALL_SETBACK) {
                stats.falls++; SFX.fall();
                toast("career setback! (no damage taken)");
              }
              p.grounded = true; p.djAvail = true; p.coyote = COYOTE;
              p.lastStandY = p.y;
            }
            break;
          }
        }
      }
      if (p.grounded) {
        // still supported? (walked off an edge)
        const bottom = p.y + PH;
        const supported = level.plats.some((pl) =>
          Math.abs(bottom - pl.y) < 0.5 && p.x + PW > pl.x && p.x < pl.x + pl.w);
        if (!supported) { p.grounded = false; }
        else p.lastStandY = p.y;
      }
      if (!p.grounded && p.coyote > 0) p.coyote--;
    }

    // walls / floor
    p.x = clamp(p.x, WALL, W - WALL - PW);
    if (p.y + PH > level.H - 12) { p.y = level.H - 12 - PH; p.vy = 0; p.grounded = true; p.djAvail = true; }
    if (p.grap && p.grounded) { p.grap = null; }

    // camera + HUD progress
    const target = clamp(p.y - viewH * 0.55, 0, Math.max(0, level.H - viewH));
    camY += (target - camY) * 0.15;
    const climbed = clamp(1 - (p.y - (level.summitY - PH)) / (level.spawn.y - (level.summitY - PH)), 0, 1);
    root.querySelector(".cq-progress span").style.width = Math.round(climbed * 100) + "%";
    root.querySelector(".cq-hint").hidden = !nearNpc();

    for (const pad of level.pads) if (pad.squash > 0) pad.squash--;
  }

  /* ================= rendering ================= */

  function render() {
    if (!cv.width || !cv.height) return;
    const e = level.entry;
    ctx.imageSmoothingEnabled = false;

    // sky: banded gradient, brightening toward the summit (the future is bright)
    const top = mix(e.color, "#12142a", 0.78);
    const bot = mix(e.color, "#0a0b16", 0.9);
    const glow = mix(e.color, "#f2ead2", 0.72);
    const BAND = 36;
    const first = Math.floor(camY / BAND) * BAND;
    for (let by = first; by < camY + viewH; by += BAND) {
      const t = clamp(by / level.H, 0, 1); // 0 at summit (bright) → 1 at ground
      ctx.fillStyle = blend3(glow, top, bot, t);
      ctx.fillRect(0, Math.round(by - camY), W, BAND);
    }

    // clouds (parallax 0.6)
    ctx.fillStyle = "rgba(255,255,255,0.13)";
    for (const cl of level.clouds) {
      const sy = cl.y - camY * 0.6;
      if (sy < -20 || sy > viewH + 20) continue;
      ctx.fillRect(Math.round(cl.x), Math.round(sy), cl.w, cl.h);
      ctx.fillRect(Math.round(cl.x + 6), Math.round(sy - 5), cl.w * 0.55, 5);
    }

    // skyline silhouette near the ground (parallax 0.9)
    const groundScreen = level.H - 12 - camY * 0.98 - level.H * 0.02;
    if (groundScreen < viewH + 100) {
      ctx.fillStyle = "rgba(10,12,24,0.55)";
      for (const b of level.skyline) {
        ctx.fillRect(b.x, Math.round(groundScreen - b.h), b.w, b.h);
      }
      ctx.fillStyle = "rgba(255,228,140,0.28)";
      for (const b of level.skyline) {
        for (let wy = 8; wy < b.h - 4; wy += 12) {
          for (let wx = 4; wx < b.w - 4; wx += 9) {
            if (((b.x * 7 + wx * 13 + wy * 31) % 10) < 4) {
              ctx.fillRect(b.x + wx, Math.round(groundScreen - b.h + wy), 3, 4);
            }
          }
        }
      }
    }

    ctx.save();
    ctx.translate(0, -Math.round(camY));

    // side walls: brick shafts
    const wallBase = mix(e.color, "#191a24", 0.82);
    const wallLine = mix(e.color, "#2c2e40", 0.7);
    ctx.fillStyle = wallBase;
    ctx.fillRect(0, Math.max(0, camY - 20), WALL, viewH + 40);
    ctx.fillRect(W - WALL, Math.max(0, camY - 20), WALL, viewH + 40);
    ctx.fillStyle = wallLine;
    for (let y = Math.floor((camY - 20) / 14) * 14; y < camY + viewH + 20; y += 14) {
      ctx.fillRect(0, y, WALL, 2);
      ctx.fillRect(W - WALL, y + 7, WALL, 2);
    }

    // platforms
    for (const pl of level.plats) {
      if (pl.y < camY - 30 || pl.y > camY + viewH + 30) continue;
      const h = pl.ground ? level.H - pl.y : 6;
      ctx.fillStyle = mix(e.color, "#23252f", 0.68);
      ctx.fillRect(Math.round(pl.x), pl.y, Math.round(pl.w), h);
      ctx.fillStyle = pl.summit ? mix(e.color, "#ffffff", 0.25) : mix(e.color, "#8f93a8", 0.45);
      ctx.fillRect(Math.round(pl.x), pl.y, Math.round(pl.w), 2);
      if (pl.summit) {           // a little "now hiring at the top" carpet
        ctx.fillStyle = mix(e.color, "#1a1c2c", 0.35);
        ctx.fillRect(Math.round(pl.x + 8), pl.y + 2, Math.round(pl.w - 16), 2);
      }
    }

    // bounce pads: squash animation
    for (const pad of level.pads) {
      if (pad.y < camY - 30 || pad.y > camY + viewH + 30) continue;
      const sq = pad.squash > 0 ? 2 : 0;
      ctx.fillStyle = "#8c3040";
      ctx.fillRect(pad.x + 2, pad.y - 3 + sq, pad.w - 4, 3 - sq + 2);
      ctx.fillStyle = "#e8556e";
      ctx.fillRect(pad.x, pad.y - 5 + sq, pad.w, 2.5);
    }

    // grapple hooks; the current target pulses
    const tgt = mode === "play" && !player.grap ? targetHook() : null;
    for (const h of level.hooks) {
      if (h.y < camY - 30 || h.y > camY + viewH + 30) continue;
      ctx.fillStyle = "#c9ccd6";
      ctx.fillRect(h.x - 1.5, h.y - 5, 3, 3);          // mount
      ctx.strokeStyle = (h === tgt && frame % 30 < 18) ? "#ffe071" : "#9aa0ad";
      ctx.lineWidth = 2;
      ctx.strokeRect(h.x - 3, h.y - 2, 6, 6);
      if (h === tgt) {
        ctx.strokeStyle = "rgba(255,224,113,0.35)";
        ctx.strokeRect(h.x - 6, h.y - 5, 12, 12);
      }
    }

    // rope: dotted, 8-bit style
    if (player.grap) {
      const h = player.grap.hook;
      const cx = player.x + PW / 2, cy = player.y + PH / 2;
      const d = Math.hypot(h.x - cx, h.y - cy);
      const n = Math.max(2, Math.floor(d / 5));
      ctx.fillStyle = "#d8c9a0";
      for (let i = 0; i <= n; i++) {
        ctx.fillRect(Math.round(cx + (h.x - cx) * (i / n)) - 1,
                     Math.round(cy + (h.y - cy) * (i / n)) - 1, 2, 2);
      }
    }

    // NPC Aaron — dressed one rung up the ladder per area, beard included
    const n = level.npc;
    drawFigure(ctx, n.x - PW / 2, n.y, 1,
      { skin: 1, hairStyle: 0, hairc: 1, outfit: Math.min(levelIdx, OUTFITS.length - 1), npc: true },
      0, player.x + PW / 2 < n.x ? -1 : 1);
    // bobbing "!" prompt
    if (mode === "play") {
      const bob = Math.floor(frame / 20) % 2;
      ctx.fillStyle = "#ffe071";
      ctx.fillRect(n.x - 1, n.y - 12 + bob, 2, 5);
      ctx.fillRect(n.x - 1, n.y - 5 + bob, 2, 2);
    }

    // player
    drawFigure(ctx, player.x, player.y, 1,
      { skin: prefs.skin, hairStyle: prefs.hair, hairc: prefs.hairc, outfit: prefs.outfit },
      poseFor(player), player.face);

    ctx.restore();
  }

  /* Three-stop vertical blend for the sky bands. */
  function blend3(a, b, c, t) {
    // t: 0 at world top (bright) → 1 at ground (dark)
    if (t < 0.35) return mixCss(a, b, t / 0.35);
    return mixCss(b, c, (t - 0.35) / 0.65);
  }
  function mixCss(a, b, t) {
    const pa = cssRgb(a), pb = cssRgb(b);
    return "rgb(" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",") + ")";
  }
  function cssRgb(s) {
    if (s[0] === "#") return hexRgb(s);
    return s.match(/\d+/g).slice(0, 3).map(Number);
  }

  /* ================= main loop ================= */

  let acc = 0, lastT = 0;
  function loop(t) {
    rafId = requestAnimationFrame(loop);
    if (!lastT) lastT = t;
    let dt = Math.min(100, t - lastT);
    lastT = t;
    if (mode === "play") {
      acc += dt;
      while (acc >= 1000 / 60) { stepSim(); acc -= 1000 / 60; }
    }
    frame++;
    if (level && (mode === "play" || mode === "dialog" || mode === "pause")) render();
  }

  /* ================= screens & dialog ================= */

  function setScreen(name) {
    root.querySelector(".cq-menu").hidden = name !== "menu";
    root.querySelector(".cq-play").hidden = name === "menu";
  }

  function openDialog() {
    mode = "dialog";
    SFX.talk();
    const e = level.entry;
    const d = root.querySelector(".cq-dialog");
    const last = levelIdx === entries.length - 1;
    d.innerHTML = "";
    const card = document.createElement("div");
    card.className = "cq-card";
    card.style.setProperty("--era", e.color);

    const head = document.createElement("header");
    head.className = "cq-card-head";
    const face = document.createElement("canvas");
    face.width = 14; face.height = 16; face.className = "cq-card-face";
    const fc = face.getContext("2d");
    fc.imageSmoothingEnabled = false;
    drawFigure(fc, 2, 1, 1, { skin: 1, hairStyle: 0, hairc: 1, outfit: Math.min(levelIdx, OUTFITS.length - 1), npc: true }, 0, 1);
    const ht = document.createElement("div");
    ht.innerHTML = "<span class='cq-card-period'></span><h2></h2><p class='cq-card-org'></p>";
    ht.querySelector(".cq-card-period").textContent = e.period;
    ht.querySelector("h2").textContent = e.title;
    ht.querySelector(".cq-card-org").textContent = e.org;
    head.appendChild(face); head.appendChild(ht);
    card.appendChild(head);

    const say = document.createElement("p");
    say.className = "cq-card-say";
    say.textContent = last
      ? "“And that brings you to today. Thanks for climbing the whole ladder — most people just scroll.”"
      : ["“Oh hey, you made it up! Here's what I was doing back then…”",
         "“Welcome to " + e.period + ". The coffee was worse, the uptime was too.”",
         "“You grappled all the way here? Keen. Right — this chapter:”",
         "“Mind the drop. Anyway, this was the era:”",
         "“Good bounce control. Here's what this floor was about:”"][levelIdx % 5];
    card.appendChild(say);

    const ul = document.createElement("ul");
    ul.className = "cq-card-bullets";
    e.bullets.forEach((b) => {
      const li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    });
    card.appendChild(ul);

    if (e.tags.length) {
      const tags = document.createElement("div");
      tags.className = "cq-card-tags";
      e.tags.forEach((t) => {
        const s = document.createElement("span");
        s.textContent = t;
        tags.appendChild(s);
      });
      card.appendChild(tags);
    }

    const btns = document.createElement("div");
    btns.className = "cq-card-btns";
    const next = document.createElement("button");
    next.className = "cq-btn cq-btn-primary";
    next.textContent = last ? "REACH THE PRESENT DAY ★" : "NEXT AREA ▲";
    next.addEventListener("click", () => {
      d.hidden = true;
      if (last) { showEnd(); }
      else { loadLevel(levelIdx + 1); mode = "play"; }
    });
    const stay = document.createElement("button");
    stay.className = "cq-btn";
    stay.textContent = "KEEP EXPLORING";
    stay.addEventListener("click", () => { d.hidden = true; mode = "play"; });
    btns.appendChild(next); btns.appendChild(stay);
    card.appendChild(btns);

    d.appendChild(card);
    d.hidden = false;
    next.focus({ preventScroll: true });
  }

  function showEnd() {
    mode = "end";
    SFX.done();
    const d = root.querySelector(".cq-dialog");
    const mins = Math.floor(stats.frames / 3600);
    const secs = Math.floor((stats.frames / 60) % 60);
    d.innerHTML = "";
    const card = document.createElement("div");
    card.className = "cq-card cq-card-end";
    card.style.setProperty("--era", entries[entries.length - 1].color);
    card.innerHTML =
      "<h2>★ YOU REACHED NOW ★</h2>" +
      "<p class='cq-card-say'>15+ years climbed in " + mins + "m " + String(secs).padStart(2, "0") + "s. " +
      "Career setbacks: " + stats.falls + " — all fully recovered from, which is the trick.</p>" +
      "<div class='cq-card-btns'></div>";
    const btns = card.querySelector(".cq-card-btns");
    const mkBtn = (label, primary, fn) => {
      const b = document.createElement("button");
      b.className = "cq-btn" + (primary ? " cq-btn-primary" : "");
      b.textContent = label;
      b.addEventListener("click", fn);
      btns.appendChild(b);
    };
    mkBtn("READ THE FULL RÉSUMÉ", true, () => {
      d.hidden = true; backToMenu();
      if (document.body.dataset.mode === "ios") IOS.open("resume");
      else WM.open("resume");
    });
    if (diff === "easy") mkBtn("AGAIN, BUT HARD MODE", false, () => { d.hidden = true; startGame("hard"); });
    mkBtn("BACK TO MENU", false, () => { d.hidden = true; backToMenu(); });
    d.appendChild(card);
    d.hidden = false;
  }

  function togglePause() {
    const el = root.querySelector(".cq-pause");
    if (mode === "play") { mode = "pause"; el.hidden = false; }
    else if (mode === "pause") { mode = "play"; el.hidden = true; }
  }

  function backToMenu() {
    mode = "menu";
    level = null;
    root.querySelector(".cq-pause").hidden = true;
    root.querySelector(".cq-dialog").hidden = true;
    setScreen("menu");
    drawPreview();
  }

  /* ================= menu / customisation ================= */

  function drawPreview() {
    const pc = root.querySelector(".cq-preview");
    const c = pc.getContext("2d");
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, pc.width, pc.height);
    drawFigure(c, 2, 1, 1, { skin: prefs.skin, hairStyle: prefs.hair, hairc: prefs.hairc, outfit: prefs.outfit }, 0, 1);
  }

  function setupMenu() {
    const opts = {
      hair: { list: HAIR_STYLES, get: () => prefs.hair, set: (v) => (prefs.hair = v), label: (v) => HAIR_STYLES[v] },
      hairc: { list: HAIR_COLORS, get: () => prefs.hairc, set: (v) => (prefs.hairc = v), label: (v) => HAIR_COLORS[v][0] },
      skin: { list: SKIN_TONES, get: () => prefs.skin, set: (v) => (prefs.skin = v), label: (v) => "Tone " + (v + 1) },
      outfit: { list: OUTFITS, get: () => prefs.outfit, set: (v) => (prefs.outfit = v), label: (v) => OUTFITS[v].name },
    };
    root.querySelectorAll(".cq-picker").forEach((row) => {
      const o = opts[row.dataset.opt];
      const lab = row.querySelector(".cq-opt-val");
      const refresh = () => { lab.textContent = o.label(o.get()); drawPreview(); };
      row.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", () => {
          o.set((o.get() + Number(b.dataset.dir) + o.list.length) % o.list.length);
          savePrefs(); refresh();
        });
      });
      refresh();
    });
    root.querySelectorAll(".cq-start").forEach((b) => {
      b.addEventListener("click", () => {
        blip(500, 900, 0.1); // primes the AudioContext inside the user gesture
        startGame(b.dataset.diff);
      });
    });
  }

  /* ================= input ================= */

  function shellActive() {
    if (document.body.dataset.mode === "ios") return IOS.activeApp() === ID;
    return WM.isFocused(ID);
  }

  function setupInput() {
    const onKeyDown = (e) => {
      if (!shellActive()) return;
      if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
      const k = e.key;
      if (mode === "end") return; // the end card's buttons are the only way on
      if (mode === "dialog") {
        if (k === "Escape") { root.querySelector(".cq-dialog").hidden = true; mode = "play"; e.preventDefault(); }
        return;
      }
      if (mode === "menu") return;
      let used = true;
      if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = true;
      else if (k === "ArrowRight" || k === "d" || k === "D") keys.right = true;
      else if (!e.repeat && (k === " " || k === "ArrowUp" || k === "w" || k === "W" || k === "z" || k === "Z")) { if (mode === "play") doJump(); }
      else if (!e.repeat && (k === "x" || k === "X" || k === "Shift")) { if (mode === "play") doGrapple(); }
      else if (!e.repeat && (k === "e" || k === "E" || k === "Enter")) { if (mode === "play" && nearNpc()) openDialog(); }
      else if (!e.repeat && k === "Escape") togglePause();
      else if (!e.repeat && (k === "m" || k === "M")) { prefs.muted = !prefs.muted; savePrefs(); toast(prefs.muted ? "sound off" : "sound on"); }
      else used = false;
      if (used) e.preventDefault();
    };
    const onKeyUp = (e) => {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = false;
      if (k === "ArrowRight" || k === "d" || k === "D") keys.right = false;
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    // touch controls: hold-to-move, tap to jump/grab
    const bindHold = (sel, down, up) => {
      const b = root.querySelector(sel);
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); down(); });
      ["pointerup", "pointercancel"].forEach((ev) => b.addEventListener(ev, () => up && up()));
      b.addEventListener("contextmenu", (e) => e.preventDefault());
    };
    bindHold(".cq-t-left", () => (keys.left = true), () => (keys.left = false));
    bindHold(".cq-t-right", () => (keys.right = true), () => (keys.right = false));
    bindHold(".cq-t-jump", () => { if (mode === "play") doJump(); });
    bindHold(".cq-t-grab", () => { if (mode === "play") talkOrGrapple(); });

    root.querySelector(".cq-p-resume").addEventListener("click", togglePause);
    root.querySelector(".cq-p-restart").addEventListener("click", () => {
      loadLevel(levelIdx);
      root.querySelector(".cq-pause").hidden = true;
      mode = "play";
    });
    root.querySelector(".cq-p-quit").addEventListener("click", backToMenu);
    root.querySelector(".cq-p-mute").addEventListener("click", (e) => {
      prefs.muted = !prefs.muted; savePrefs();
      e.target.textContent = prefs.muted ? "SOUND: OFF" : "SOUND: ON";
    });

    detachInput = () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }

  /* ================= lifecycle ================= */

  function init(node) {
    root = node;
    entries = loadEntries();
    cv = node.querySelector(".cq-canvas");
    ctx = cv.getContext("2d");

    const stage = node.querySelector(".cq-stage");
    resizeObs = new ResizeObserver(() => {
      const r = stage.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;      // minimized / stashed
      viewH = clamp(Math.round(W * r.height / r.width), 170, 800);
      cv.width = W; cv.height = viewH;
      ctx.imageSmoothingEnabled = false;
    });
    resizeObs.observe(stage);

    node.querySelector(".cq-p-mute").textContent = prefs.muted ? "SOUND: OFF" : "SOUND: ON";
    setupMenu();
    setupInput();
    setScreen("menu");
    drawPreview();
    rafId = requestAnimationFrame(loop);
  }

  function teardown() {
    cancelAnimationFrame(rafId);
    rafId = 0; lastT = 0; acc = 0;
    if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
    if (detachInput) { detachInput(); detachInput = null; }
    clearTimeout(toastTimer);
    if (actx) { try { actx.close(); } catch (e) {} actx = null; }
    mode = "menu"; level = null; root = null;
  }

  /* Test hooks (used by the CDP verification scripts, harmless in prod). */
  const debug = {
    state: () => ({ mode, levelIdx, diff, player, viewH, H: level && level.H }),
    gen: (i, d) => genLevel(i, d),
    entries: () => entries,
    warpToSummit() {
      if (!level) return;
      player.x = level.npc.x - 18; player.y = level.npc.y;
      player.vy = 0; player.grounded = true; player.lastStandY = player.y;
      camY = clamp(player.y - viewH * 0.55, 0, level.H - viewH);
    },
    warpTo(x, y, airborne) {
      if (!level) return;
      player.x = x; player.y = y; player.vy = 0; player.grap = null;
      player.grounded = !airborne; player.lastStandY = y;
    },
    level: () => level,
    grapple: () => doGrapple(),
    talk: () => openDialog(),
  };

  return { init, teardown, debug };
})();

Apps.onCreate("career", (node) => Career.init(node));
Apps.onClose("career", () => {
  Career.teardown();
  Apps.resetContent("career"); // next open = fresh menu (arcade rules)
});
