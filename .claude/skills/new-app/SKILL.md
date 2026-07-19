---
name: new-app
description: Add a new app/window/widget to the site (both shells, both skins). Use when creating any new app, dock icon, iOS tile, or menu — encodes the registry, template, lifecycle, and the three bugs that shipped repeatedly.
---

# Adding an app

App content is ONE live DOM node cloned from a `<template>` and physically
moved between the macOS window, the iOS app view, and a hidden stash — state
survives close/reopen and mode switches. Never clone per-shell.

## Steps

1. **Template**: add `<template id="app-<id>">` in `index.html` next to the
   others (`grep -n 'template id=' index.html`). Games share `app-game` via
   the `template:` flag.
2. **Registry**: add an entry in `js/apps.js`. Flags:
   - `hidden: true` — no dock/home presence (reachable via menu/terminal/deep link)
   - `iosOnly: true` — home grid but not desktop dock (e.g. Settings)
   - `folder: "games"` — dock fan-out folder
   - `escCloses: false` — app owns Escape (terminal, games, Career Ladder)
   - `resizable: false` — fixed panel (sysinfo)
   - `defaultOpen`, `width`, `height`
3. **Icon + tile**: create `icon-<x>` (SVG symbol in `index.html`) and
   `tile-<x>` (gradient class in CSS) — copy an existing pair, e.g.
   `icon-blog`/`tile-blog`.
4. **Behavior**: new `js/<id>.js` if needed, registered via
   `Apps.onCreate(id, fn)` (runs once when the node is first cloned).
   Teardown: `Apps.onClose` (explicit close only — NOT mode switches) and
   `Apps.resetContent(id)` for hard resets (see games).
   Add the `<script src>` tag before `main.js` **with the current `?v=`**.
5. **Deep link**: `#<id>` works automatically via `applyHash` — verify it.

## The three recurring bugs — check every time

- **`hidden` loses to `display:flex/grid`** (shipped 3×): any element styled
  with a display value needs an explicit `[hidden] { display: none; }` rule.
- **Skin-hidden containers**: the Windows skin hides `#menubar`; iOS hides
  the desktop. Nothing may live inside a container another skin/mode hides —
  make it a sibling (see `#logo-menu`, `#wifi-menu`).
- **Credential-looking inputs**: free text that could resemble a login must
  be a `contenteditable` span, not `<input>` (password managers ignore
  autocomplete hints). Plain inputs are fine for todo/chat-style fields.

## Verify

Invoke the `verify` skill. Minimum: open the app on desktop (macOS skin),
Windows skin, and phone emulation; assert geometry; screenshot each; check
state survives a mode switch (resize across 700px) and that explicit close +
reopen behaves.
