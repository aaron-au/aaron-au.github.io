---
name: verify
description: Verify a change to this site in a real headless browser (Chrome via CDP). Use before claiming any UI change is done, when asked to "check it works", or to screenshot the site. Asserts computed visibility/geometry, not attributes.
---

# Verify in a real browser

Hard rule 8: never claim a UI change is done without seeing it render.
Attribute checks lie — an earlier test "passed" on an invisible menu.

## Setup (two terminals' worth, both backgroundable)

1. Dev server: `python3 -m http.server 8123` from the repo root
   (kill a stale one first: `lsof -ti tcp:8123 | xargs kill`).
2. Write a short `.mjs` test script **in the scratchpad directory** (never in
   the repo) importing the ready-made helper:

```js
import { launch, loginAsGuest, geometry } from
  "/Users/aaron/development/aaronlees.id.au/.claude/skills/verify/cdp.mjs";

const c = await launch();                    // kills stale Chrome, waits for CDP
await c.goto("http://127.0.0.1:8123/");
await loginAsGuest(c);                       // desktop is dead until logged in

const dock = await geometry(c, "#dock");     // { visible, x, y, width, height, ... }
if (!dock.visible) throw new Error("dock not visible: " + JSON.stringify(dock));

await c.screenshot("<scratchpad>/desktop.png");
await c.close();
```

3. Run it with `node` (needs Node ≥ 22 — fetch and WebSocket are built in).
4. **Read the screenshot with the Read tool and actually look at it.** A
   passing assertion plus an unexamined screenshot is not verification.

## What to test per change

- Both shells if the DOM moved: desktop (default 1440×900) and iOS via
  `await c.phone()` — emulation is mandatory, desktop headless clamps
  window width to ~500px.
- Both skins if the change touches chrome (menubar/dock/windows):
  switch with `await c.eval("localStorage.setItem('skin','win')")` then
  reload (`skin` is a raw string, not JSON — hard rule 2).
- Assert with `geometry()` (computed style + rect), never `el.hidden` or
  class names.

## Helper API (`cdp.mjs` in this skill's directory)

`launch({port,width,height})`, `c.goto(url)`, `c.eval(js)`, `c.phone(w,h)`,
`c.click(x,y)`, `c.press(key)` (real key events — games/Escape need these),
`c.type(text)` (insertText — for contenteditable terminal/password fields),
`c.waitFor(expr)`, `c.screenshot(path)`, `c.close()`, plus `loginAsGuest(c)`
and `geometry(c, selector)`.

Dialogs are auto-accepted (an unhandled `alert()` hangs the page — WebQuake
does this without `--use-angle=swiftshader`, which `launch()` already passes).

## Gotchas already paid for (don't rediscover)

- Stale `remote-debugging-port` Chrome = stale emulation and baffling
  screenshots. `launch()` pkills first; if things look impossible, check
  `pgrep -fl remote-debugging-port`.
- Career Ladder exposes `Career.debug` for deterministic testing — use it
  instead of simulating gameplay.
- Quake needs HTTP Range support in prod only; the local COM.js patch covers
  the dev server.
- When done: `c.close()` kills Chrome; leave nothing on port 9333.
