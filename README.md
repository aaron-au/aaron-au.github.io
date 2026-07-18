# aaronlees.id.au

A personal site that looks and behaves like **macOS** on desktop (menu bar, draggable/resizable windows, dock) and like **iOS** on phones (home screen, full-screen apps, home indicator). The system menu offers **"Restart into Windows…"** — same window manager, reskinned: bottom taskbar with a Start button, window controls on the right, appropriately blue wallpaper. Pure HTML/CSS/vanilla JS — no frameworks, no build step — designed for GitHub Pages.

**For AI agents / future maintainers:** start with [CLAUDE.md](CLAUDE.md) (hard rules) and [docs/HANDOFF.md](docs/HANDOFF.md) (architecture, decisions, test recipes, backlog).

## Local development

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from disk (file://) also works for everything **except blog post bodies** (browsers block `fetch()` of local files); the site shows a friendly notice explaining this.

To test the iOS mode on a real phone, run the server as above and browse to `http://<your-mac-ip>:8000` from the phone on the same network.

## Adding a blog post

Posts are conversations (the Blog app is chat-style — topics on the left rail, posts as chats):

1. Create `posts/YYYY-MM-DD-your-slug.md`. Lines starting with `@handle ` begin a chat message from that handle; following lines continue the message until the next `@handle` line. Markdown (including code fences) works inside messages. `@aaron` gets the site avatar; any other handle gets a deterministic colour.
2. Add an entry to `posts/index.js` — `tags` drive the topic rail, `pinned: true` floats a post to the top.
3. Commit and push. Done.

Visitor comments typed into a post are local-only (rendered into the thread, never saved or sent).

**Deep links:** `#<app>` opens an app (e.g. `#resume`, `#terminal`), `#blog/<topic>` opens the blog filtered to a topic (hyphens work for spaces: `#blog/home-automation`), and `#blog/post/<slug>` opens a specific conversation. The address bar tracks blog navigation via `history.replaceState`, so the current URL is always shareable.

## Editing content

App content (About, Projects, Contact) lives as `<template>` elements at the bottom of `index.html` — edit the HTML there and both the macOS windows and iOS apps update, since they share the same DOM nodes.

## Structure

```
index.html        both shells + app content templates + inline SVG icons
css/base.css      theme variables (light/dark), shared content styling
css/macos.css     menu bar, desktop, windows, dock
css/ios.css       status bar, home grid, app view, home indicator
js/util.js        pointer-drag helper, safe localStorage wrapper
js/apps.js        app registry + single-instance content nodes
js/wm.js          window manager (drag/resize/focus/min/max/persistence)
js/dock.js        dock rendering + running indicators
js/ios.js         iOS shell + zoom animations
js/blog.js        blog list/post rendering
js/games.js       game launcher (js-dos + iframe engines, exit detection)
js/terminal.js    toy shell over the app registry
js/widgets.js     world clocks + battery easter egg
vendor/marked.min.js   markdown parser (marked v12, MIT, pinned)
vendor/jsdos/     js-dos v6.22 (DOSBox → WebAssembly, GPL-2.0, self-hosted)
vendor/webquake/  WebQuake engine (GPLv2) + shareware pak0
assets/           doom.zip, lemmings.zip, headshot, wallpaper tile sources
                  (pattern-light/dark.svg — the live wallpaper is these
                  inlined as data URIs in css/base.css --wallpaper-pattern)
posts/            blog index + markdown posts
```

## Games

The Games folder in the dock (fan-out, macOS style) holds three classics, all legitimately redistributable and all fully self-hosted — no CDNs:

| Game | How it runs | Payload (lazy-loaded on Launch) |
|---|---|---|
| DOOM (1993) | js-dos v6.22 (DOSBox → WASM) | `assets/doom.zip` — 1.9 shareware, WAD MD5 `f0cefca49926d00903cf57551d901abe` (~2 MB) |
| Quake (1996) | WebQuake (native JS/WebGL engine port, GPLv2) in a same-origin iframe | `vendor/webquake/id1/pak0.pak` — shareware v1.06, `SLICNSE.TXT` alongside (~18 MB) |
| Lemmings (1991) | js-dos | `assets/lemmings.zip` — official Psygnosis 4-level demo disc, `README.DOC` inside (~0.3 MB) |

Nothing downloads at page load — emulator and game files fetch only when a visitor clicks Launch. Quitting a game from its own menu closes the window; closing the window tears the engine down (see `js/games.js` header comments for the empirically-derived exit detection).

DOS Quake doesn't work under this DOSBox build (protected-mode crash), hence WebQuake. `vendor/webquake/WebQuake/COM.js` carries a small local patch: a fallback for static servers that ignore HTTP Range requests (GitHub Pages honours them; `python -m http.server` doesn't — without the patch Quake only works in production).

The registered episodes of DOOM/Quake and the full Lemmings are commercial — do not add them.

## Terminal

A toy shell over the app registry: `ls` lists the apps as a fake home directory, `open <name>` (or just the app's name) opens windows, and there are the traditional easter eggs (`sudo`, `rm -rf /`, `neofetch`, `battery`, interpreter switching via `zsh`/`bash`/`fish`/`python`, `color fg|bg <css-color>`). `exit` closes the window. All fake, all client-side — see `js/terminal.js`.

## Shipping changes

Local CSS/JS references in `index.html` carry a `?v=YYYYMMDDx` cache-buster. **Bump it whenever you change JS or CSS** (one find-and-replace) — GitHub Pages caches assets for ~10 minutes, and without the pin a visitor can get new HTML with old scripts (or vice versa), which is how someone once got trapped in Windows with no Start button.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → deploy from the `main` branch, root folder.
3. For the custom domain: add a `CNAME` file containing `aaronlees.id.au` and point DNS (ALIAS/A records) at GitHub Pages.

The `.nojekyll` file tells Pages to serve files as-is. All asset paths are relative, so the site works at any base path (`user.github.io/repo` or a custom domain).
