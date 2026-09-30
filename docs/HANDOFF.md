# Handoff — aaronlees.id.au

State of the project as of 2026-07-18. Written for the next agent (or future
Aaron). `CLAUDE.md` at the repo root has the hard rules; this is everything
else: what exists, why it's shaped this way, how to test it, and what's left.

## What this is

Aaron's daily homepage/work page across devices, and his public face. It
imitates macOS on desktop (login screen, menu bar, draggable/resizable
windows, left dock with a Games fan-out folder), iOS under 700px (paged home
— widgets page + app grid with paging dots, zoom-from-icon app views, home
indicator, Settings app), and optionally Windows
("Restart into Windows…" in the system menu: bottom taskbar, Start button,
right-side window controls). Everything is hand-written vanilla HTML/CSS/JS.
The identity of the site: useful first (clocks, tasks, blog), playful second
(games, terminal, easter eggs), and honest about being AI-assisted (credit
in the wallpaper corner).

## Feature inventory

| Feature | Files | Notes |
|---|---|---|
| Login screen | `js/login.js` | Every visit. "Aaron Lees" never logs in — 9-step escalating sarcasm, 10th attempt "succeeds" as Guest. Guest logs straight in. Session persists per tab (soft refresh stays in; ⌘⇧R keydown clears sessionStorage → back to login). |
| Window manager | `js/wm.js` | Drag, 8-direction edge/corner resize, focus stack (fixed z-bands), minimize/maximize, viewport clamping, per-app geometry in localStorage, open-set session restore. `resizable:false` + `escCloses:false` flags. |
| Dock / taskbar | `js/dock.js` | Left rail on macOS (Aaron is a widescreen dock-on-left person), bottom taskbar on Windows skin. Games folder fans out (right on macOS, up on Windows). Start button lives here, hidden on macOS. |
| Skins | `css/windows.css`, skin fns in `js/main.js` | `html[data-skin="win"]`, persisted raw in localStorage, applied pre-paint by the head script. Fake reboot overlay between skins. Terminal `reboot windows|macos` is the escape hatch. |
| World clocks | `js/widgets.js` | 8 zones + flags, alphabetical by label (sorted at render, add zones anywhere). Rail pinned top-right, drag converts to free positioning. |
| Battery easter egg | `js/widgets.js` | 100%→0% linear 08:00–22:00 Australia/Sydney; recharges overnight (green + bolt); red ≤20%. Deliberately unexplained on the site. Percentage IS shown (Aaron approved). |
| Tasks (kanban) | `js/tasks.js` | Todo/In Progress/Done. Mouse drag with ghost + drop highlight; touch uses ‹ › buttons on purpose (drag fights scroll). Dbl-click edits. localStorage `kanban`; migrated from the older todo-widget format. |
| Blog | `js/blog.js`, `posts/` | Chat-app UI: topic rail from tags, channel list (pinned first, resizable via divider), posts render as conversations (`@handle ` lines). Local-only visitor comments with one canned reply + typing indicator. Conversations open scrolled to TOP. |
| Blog content | `posts/*.md` | Two real Boomi discoveries (Gateway auth-header bug 2026-07-05 — Aaron may extend it; NetSuite concurrency 2026-06-18). "Platform Diaries" ×12 (2026, from real work-repo git history, fully anonymised). "The Temporary Integration" ×6 (2015–2020, invented annual check-ins about a real PHP/WinSCP job — details are fiction by request). hello-world + home-automation are placeholder fun, editable freely. |
| Résumé | template in `index.html` | REAL history from Aaron's LinkedIn, position-led, sector descriptors instead of company names (his rule). Era-coloured gradient timeline, stats strip, per-role tech tags, pulsing "now" dot. "View Interactive Résumé" button opens Career Ladder. |
| Career Ladder (interactive résumé) | `js/career.js`, `app-career` template | 8-bit vertical platformer, one area per timeline entry (2010 at the bottom → now at the top); reach each summit and talk to pixel-Aaron (E) to read that entry. Hidden app — only the Résumé button and terminal `open career` reach it. Content is parsed from `#app-resume` at init, so it can't drift from the real résumé. Mechanics all on from the start: double jump, bounce pads, grapple hooks (attach only to placed hooks, X). No death — falls cost height ("career setback"). Easy/Hard = generation parameters; levels are seeded-RNG and **feasible by construction** (each step's max horizontal reach is derived from the jump physics — see `airFrames`). Customisation: hair/colour/skin + business-attire ladder (Basement Dev → Full Suit CEO), persisted as `career-prefs`; NPC-Aaron wears the outfit tier of the area you're in. Esc pauses (`escCloses:false`), M mutes the WebAudio bleeps, touch buttons appear on coarse pointers. Closing resets like the games (arcade rules; prefs survive). `Career.debug` powers the CDP tests. |
| Projects | template in `index.html` | Four cards with letter-tile tech chips (deliberately not vendor logo SVGs) and deep-links into blog topics via `data-blog-tag`. |
| Contact | template in `index.html` | LinkedIn + GitHub brand-badge rows only. **No email by choice** (scraping). |
| Terminal | `js/terminal.js` | Toy shell: ls/open/cat, theme/color, zsh/bash/fish/python/powershell prompts, sudo / rm -rf / / neofetch / battery / winver / reboot easter eggs. contenteditable input (password-manager avoidance). Under the Windows skin it boots as PowerShell (`PS C:\Users\guest>`, console-blue via `windows.css`, cmdlet aliases like `Get-ChildItem`/`cls`, PS-style not-found errors); rebooting between skins live-switches the interpreter via the `skinchange` event on `document` (dispatched by `applySkin` in main.js). |
| Games | `js/games.js`, `vendor/`, `assets/` | DOOM + Lemmings via self-hosted js-dos v6.22; Quake via WebQuake iframe (DOS Quake crashes this DOSBox build's protected mode). Exit↔close symmetry: js-dos games use a tick-cessation watchdog (this wdosbox never calls Module.onExit/quit — verified empirically); WebQuake is watched for its end-screen. Closing tears down and resets via `Apps.resetContent`. Lemmings demo intro is in German (period-authentic disc; Aaron kept it). |
| About This Site | `app-sysinfo` template | "About This Mac"-style fixed panel from the system menu (hidden app, `resizable:false`); More Info… opens About Me. |
| Wi-Fi menu | `js/wifi.js`, `#wifi-menu` | Fake network picker behind Wi-Fi icons in the menubar, Windows tray, and iOS status bar — one shared menu element, direct child of `<body>` (rule 5). The connected network is `github-pages` and mirrors githubstatus.com: fetched on load + menu open only (2-min throttle, no background polling); major/critical/unreachable ⇒ struck-through icons + a "this site is technically down" sub-line. Secured SSIDs: masked contenteditable password (rule 3) that never works — 5 escalating refusals (some SSIDs have a custom first quip), then the network hides for the session. "Free Public Wi-Fi ✨" springs the trap: body-level glitch animation → fake "Recovering…" reboot → pink-on-black CRT `#pwned-screen` ("NEVER. TRUST. OPEN. WI-FI."); Esc or the button reconnects. `WiFi.handleEscape()` is called first in main.js's Escape chain. |
| iOS home pages | `js/ios.js` (`setupPages`), `css/ios.css` | Home screen pages like a real phone: page 1 = clock widgets (+ the wallpaper scribble/AI credit, now in-flow there), page 2 = app grid. Horizontal CSS scroll-snap does the swiping (native axis-locking — never fights vertical scroll or `makeDraggable`); JS only keeps the paging dots honest and makes them clickable (the mouse fallback, since mice can't drag scroll containers). Dot reflow handles `clientWidth === 0` while iOS mode is hidden. |
| Settings | `js/settings.js`, `app-settings` template | The phone-sized home for controls desktop keeps in the menubar/system menu. `iosOnly: true` — on the iOS home grid but skipped by the dock (still opens as a window via `#settings` or terminal `open settings`). Rows: Wi-Fi (drill-in page reusing `WiFi.renderNetworks` — same join/trap logic, shared attempt counts), Dark Appearance switch (`System.setTheme`, mirrors other toggles via MutationObserver on `data-effective-theme`), Restart into Windows/macOS (label tracks `skinchange`), About (opens `sysinfo`). Grow this app rather than adding status-bar buttons. |
| Wallpaper | `assets/pattern-*.svg` → data URIs in `css/base.css` | Circuit-trace tile over the gradient; edit the SVGs then re-inline. |
| AI credit → AI opinion | `.ai-credit`, `app-ai` template | The wallpaper tagline is now a `data-open-app="ai"` button opening "AI at Work" (hidden app): Aaron's opinion piece on AI-assisted coding. Keep it wallpaper-level and subtle (opacity 0.45, brightens on hover). Terminal `open ai` also works. |
| Wallpaper scribble | `.wall-scribble` in `index.html`/`base.css` | "trust but verify" hand-scrawled on the wallpaper (rotated SVG, cursive font stack, double underline) on desktop, iOS home, and the login screen. The desktop/iOS copies are disguised buttons opening the same AI app — kept at z-index 0 so windows stacked above always win the click. The login-screen copy is decorative (`pointer-events:none`; nothing to open pre-login). |

## Where things live (navigate by this, don't re-explore)

`index.html` is ~45KB — never read it whole. Find an app's markup with
`grep -n 'template id=' index.html` and read that slice; SVG icon symbols
are in the `<svg>` block near the top; script tags (load order + shared
`?v=` cache-buster) are at the bottom.

| File | Owns |
|---|---|
| `js/util.js` | `safeStore` (JSON localStorage), `sessionStore`, `makeDraggable` (5+ consumers), `setUrlHash`, `clamp`, `svgIcon` |
| `js/apps.js` | app registry + content-node lifecycle — the keystone, read it first (80 lines) |
| `js/wm.js` | macOS window manager: drag, resize, focus stack, minimize/maximize, geometry persistence |
| `js/dock.js` | dock (macOS) / taskbar + Start (Windows), Games fan-out |
| `js/ios.js` | iOS shell: home pages + grid, app views, status bar, mode switch suspend/resume |
| `js/blog.js` | blog app: topic rail, channel list, conversation rendering, local comments |
| `js/games.js` | js-dos + WebQuake embedding, exit watchdogs, teardown |
| `js/career.js` | Career Ladder platformer (largest file; self-contained; `Career.debug` for tests) |
| `js/terminal.js` | toy shell (+ PowerShell persona under the Windows skin) |
| `js/widgets.js` | world clocks + battery easter egg |
| `js/tasks.js` | kanban board |
| `js/login.js` | login screen theatre, guest unlock |
| `js/wifi.js` | fake Wi-Fi picker, githubstatus mirror, open-Wi-Fi trap |
| `js/settings.js` | Settings app (Wi-Fi drill-in, appearance, skin restart, about) |
| `js/main.js` | boot, menubar + system menu, skin/theme, Escape chain, `applyHash` deep links |
| `css/base.css` | tokens, wallpaper, shared app-content styles |
| `css/macos.css` / `css/ios.css` / `css/windows.css` | desktop shell / phone shell / Windows skin overrides |
| `posts/` | blog markdown + `index.js` manifest |
| `.claude/skills/` | project skills: `verify` (browser checks + `cdp.mjs`), `deploy`, `new-app`, `blog-post` |
| `.githooks/pre-commit` | cache-buster guard (`git config core.hooksPath .githooks` on fresh clones) |
| `pppt/` | Pulse Performance PT demo sites and scan builder: a preview copy for Matt, not linked from the homepage. Has its own `?v=` string. Master copy and handoff notes are in `pppt/site` on git.realee.org (`~/development/pppt`). |

Storage/session key names are load-bearing — the list lives under "Known
quirks" below.

## Decisions and their reasons (don't relitigate casually)

- **No modules/build step**: hand-maintainable is the point. Script order in
  `index.html` matters (util → apps → wm → dock → ios → blog/games/terminal
  → widgets/tasks → login → wifi → settings → main; settings must follow
  wifi — its init hook calls `WiFi.renderNetworks`).
- **Content nodes move, never clone**: app state survival is a feature
  (blog post stays open across a mode switch).
- **Mode switches don't close apps** (`suspend/resume`); explicit close does
  (`Apps.notifyClose`). DOOM keeps running when you resize into iOS — fun,
  intentional.
- **Imperative over reconciliation where it matters**: e.g. game teardown and
  the reboot overlay are direct calls, not state sync. Mirrors Aaron's taste
  (see Platform Diaries #10).
- **Touch ≠ mouse**: kanban drag and dock magnification are mouse-only;
  touch gets buttons/plain lists. Pointer Events + `touch-action` everywhere;
  one shared `makeDraggable` (util.js) has 5+ consumers — change carefully.
- **Tests are CDP scripts, not a framework**: scratchpad-style .mjs files
  driving headless Chrome over WebSocket (Node ≥22 has WebSocket built in).
  Aaron prefers brew-installed tooling (`Google Chrome.app` headless) over
  cached third-party binaries.

## Test recipe (the established pattern)

Packaged as the **`verify` project skill** (`.claude/skills/verify/`):
`cdp.mjs` is a ready, smoke-tested CDP helper (launch with the right flags,
eval, click/keys, phone emulation, screenshots, `loginAsGuest`, `geometry`)
and SKILL.md carries the gotcha list learned the hard way (headless width
clamp, swiftshader for WebGL, stale debug instances, dialog auto-accept).
Invoke the skill instead of rebuilding any of this. Server:
`python3 -m http.server 8123`; write throwaway test scripts in the
scratchpad, never the repo. Assert computed style + getBoundingClientRect,
never just attributes — and look at the screenshots.

## Known quirks / soft spots

- WM clamp allows a 4px top gap in the Windows skin (`topLimit()`), cosmetic.
- Blog message timestamps are fake-but-stable (derived from slug hash).
- Firefox reloads fully re-download against cache-header-less dev servers —
  that's why hard-refresh detection is keydown-based, and why shift-clicking
  Firefox's reload button (no key event) stays logged in. Accepted.
- The `-v2`-style historical scars: session keys `wm-windows`, `ios-app`,
  storage keys `win:<id>`, `blog-channels-w`, `kanban`, `theme`, `skin`,
  `career-prefs`.
  Renaming any of them silently loses user state — don't.
- `vendor/webquake/WebQuake/COM.js` carries a local Range-fallback patch —
  re-vendoring WebQuake would lose it.

## Backlog (Aaron-approved ideas, not yet built)

1. **CNAME + DNS** for aaronlees.id.au — waiting on Aaron's DNS. Then update
   README/CLAUDE/memory and the Pages custom-domain setting, enforce HTTPS.
2. Platform Diaries #13 (Kyverno enforce day) when it happens at work;
   extend the Gateway auth-header post when the vendor responds.
3. Aaron still to fact-check the Platform Diaries dramatisations and the
   invented Temporary Integration details.
4. Possible: English-market Lemmings demo, "Restart into Ubuntu…" third
   skin, blog-post URL sharing UI (copy-link button), kanban card reordering
   within a column.
5. About Me copy is still v1 boilerplate-ish; headshot is a dummy SVG
   (`assets/headshot.svg`) awaiting a real photo.

(Backlog items #6 Settings app and #7 iOS home swipe pages shipped
2026-07-19 — see the feature inventory. The PowerShell-under-Windows
terminal shipped the same day, on a suggestion from a friend of Aaron's.)

## Working with Aaron

Direct, playful, ships fast, laughs at bugs ("stuck in windows mode ahhh!").
Wants honesty over polish — report what broke and why. Widescreen dock-on-left
person. Values: no telemetry, no email exposure, no employer/customer names,
transparency about AI assistance. When he says "nothing special, just nicely
usable", believe him — but he consistently enjoys one thoughtful extra
(the surrender on login attempt #10 landed well).
