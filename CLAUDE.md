# CLAUDE.md — aaronlees.id.au

Aaron's personal homepage: plain HTML/CSS/JS pretending to be operating systems.
macOS shell on desktop, iOS below 700px, optional Windows skin. No frameworks,
no build step, no backend, no telemetry. Live at https://aaron-au.github.io
(custom domain aaronlees.id.au pending DNS — do NOT add a CNAME file until
Aaron says DNS is ready; it would break the github.io URL).

**Read `docs/HANDOFF.md` before non-trivial work** — full architecture,
decisions, known quirks, test recipes, and backlog live there. This file is
only the rules that prevent breakage.

## Hard rules

1. **Bump the cache-buster** when changing any local JS/CSS: find-and-replace
   `?v=YYYYMMDDx` in `index.html`. Without it, GitHub Pages' ~10-min cache
   serves visitors mixed old/new bundles (this once stranded Aaron in the
   Windows skin with no Start button).
2. **Raw strings, not JSON, for head-script keys.** `localStorage` keys read
   by the inline `<head>` script (`theme`, `skin`, sessionStorage `loggedIn`)
   are raw strings. `safeStore` (JSON) is for everything else. Mixing them
   caused the quoted-`"dark"` theme bug.
3. **No `<input type=text/password>` for free-text that could look like
   credentials** (terminal, login). Password managers ignore autocomplete
   hints; use `contenteditable` spans (see `js/terminal.js`, `js/login.js`).
   Plain inputs are fine for obviously-non-credential fields (todo, chat).
4. **`hidden` loses to `display:flex/grid`.** Any element styled with a
   display value needs an explicit `[hidden] { display: none; }` override.
   This bug shipped three times.
5. **Nothing may live inside a container a skin/mode hides.** The Windows
   skin sets `#menubar { display:none }` — that's why `#logo-menu` is a
   sibling, not a child. Check both skins and both shells when moving DOM.
6. **Sensitivity:** no employer/customer/product names anywhere (résumé,
   blog, projects use sector descriptors — "a national technology
   consultancy"). No email addresses on the site (scraping; Contact is
   LinkedIn + GitHub only). Commits use the GitHub noreply address. Blog
   posts about work stay anonymised; grep new posts for names before pushing.
7. **Games:** only the shareware/demo payloads that ship in the repo.
   Registered DOOM/Quake episodes and full Lemmings are commercial — never
   add them.
8. **Verify in a real browser before claiming done.** Headless Chrome via
   CDP (recipes in HANDOFF). Assert *computed visibility and geometry*, not
   attributes — an earlier test "passed" on an invisible menu. Screenshot and
   look at it.

## Architecture in one breath

`js/apps.js` is the registry (flags: `hidden`, `folder`, `template`,
`escCloses`, `resizable`, `defaultOpen`); app content is one live DOM node
per app, cloned from `<template id="app-<id>">` in `index.html` and moved
between the macOS window (`js/wm.js`), the iOS app view (`js/ios.js`), and a
hidden stash — state survives close/reopen and mode switches. `Apps.onCreate`
/ `Apps.onClose` / `Apps.resetContent` are the lifecycle hooks (games use
them for emulator teardown). Skins = `html[data-skin]` + `css/windows.css`;
modes = `body[data-mode]` via matchMedia at 700px. Deep links: `#app`,
`#blog/<topic>`, `#blog/post/<slug>` (`applyHash` in `js/main.js`).

## Workflows

- Dev server: `python3 -m http.server 8000` (Quake needs Range support in
  prod only; a local COM.js patch covers dev).
- Blog post: conversation-format `.md` in `posts/` (`@handle ` starts a
  message) + entry in `posts/index.js` (tags drive the topic rail). See
  README "Adding a blog post".
- Deploy: commit, `git push origin main` (remote uses the `github-personal`
  SSH alias from `~/.ssh/config` — the default key is a different account).
  CDN takes up to ~10 min; verify with a `?fresh=$RANDOM` query.
