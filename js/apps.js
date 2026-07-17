/* App registry — single source of truth for both shells (macOS + iOS).
   Each app's content is ONE live DOM node, created lazily from its
   <template> and physically moved between the macOS window body, the iOS
   app view, and the hidden stash. State inside the node (open blog post,
   scroll position) therefore survives close/reopen and mode switches. */
"use strict";

const Apps = (() => {
  const registry = [
    { id: "about",    title: "About Me",  icon: "icon-user",     tile: "tile-about",    defaultOpen: false, width: 560, height: 460 },
    // hidden: true — only reachable via the system menu, like the real thing
    { id: "sysinfo",  title: "",          icon: "icon-user",     tile: "tile-about",    hidden: true, resizable: false, width: 300, height: 545 },
    { id: "resume",   title: "Résumé",    icon: "icon-briefcase", tile: "tile-resume",  defaultOpen: false, width: 640, height: 560 },
    { id: "blog",     title: "Blog",      icon: "icon-blog",     tile: "tile-blog",     defaultOpen: false, width: 860, height: 580 },
    { id: "projects", title: "Projects",  icon: "icon-projects", tile: "tile-projects", defaultOpen: false, width: 560, height: 480 },
    { id: "contact",  title: "Contact",   icon: "icon-mail",     tile: "tile-contact",  defaultOpen: false, width: 440, height: 380 },
    { id: "terminal", title: "Terminal",  icon: "icon-terminal", tile: "tile-terminal", defaultOpen: false, width: 640, height: 430, escCloses: false },
    // Games live in the dock's "Games" folder (folder: "games") and share the
    // generic app-game template. escCloses: false — they need Escape themselves.
    { id: "doom",     title: "DOOM",      icon: "icon-skull",    tile: "tile-doom",     folder: "games", template: "app-game", width: 700, height: 620, escCloses: false },
    { id: "quake",    title: "Quake",     icon: "icon-quake",    tile: "tile-quake",    folder: "games", template: "app-game", width: 700, height: 620, escCloses: false },
    { id: "lemmings", title: "Lemmings",  icon: "icon-lemmings", tile: "tile-lemmings", folder: "games", template: "app-game", width: 700, height: 620, escCloses: false },
  ];

  const contentCache = new Map();
  const initHooks = new Map();  // appId -> fn(contentNode), runs once at creation
  const closeHooks = new Map(); // appId -> fn(), runs when the app is explicitly closed

  function all() { return registry; }

  function get(id) {
    return registry.find((a) => a.id === id) || null;
  }

  function onCreate(id, fn) { initHooks.set(id, fn); }
  function onClose(id, fn) { closeHooks.set(id, fn); }

  /* Called by the shells when an app is explicitly closed (window close
     button / iOS home). NOT called on mode switches, where apps keep running. */
  function notifyClose(id) {
    const fn = closeHooks.get(id);
    if (fn) fn();
  }

  /* Forget the cached content node: the next open re-clones the template and
     re-runs the app's init hook. Used by apps that need a hard reset (DOOM). */
  function resetContent(id) { contentCache.delete(id); }

  function getContent(id) {
    if (contentCache.has(id)) return contentCache.get(id);
    const app = get(id);
    const template = document.getElementById((app && app.template) || "app-" + id);
    const node = document.createElement("div");
    node.className = "app-content app-content-" + id;
    node.appendChild(template.content.cloneNode(true));
    contentCache.set(id, node);
    const hook = initHooks.get(id);
    if (hook) hook(node);
    return node;
  }

  /* Move an app's content node back to the hidden stash (if instantiated). */
  function stash(id) {
    const node = contentCache.get(id);
    if (node) document.getElementById("content-stash").appendChild(node);
  }

  return { all, get, getContent, stash, onCreate, onClose, notifyClose, resetContent };
})();
