/* Todo widget — a personal scratch-list on the desktop (and iOS home screen).
   Stored in localStorage only: persists across sessions on this browser and
   device, syncs nowhere, tells no one. Both shells render from one state. */
"use strict";

const Todos = (() => {
  let items = []; // [{ id, text, done }]
  const panels = []; // the two rendered instances (desktop + iOS)

  function load() {
    const saved = safeStore.get("todos");
    items = Array.isArray(saved)
      ? saved.filter((t) => t && typeof t.text === "string")
      : [];
  }
  function save() { safeStore.set("todos", items); }

  function mutate(fn) {
    fn();
    save();
    panels.forEach(renderList);
  }

  function renderList(panel) {
    const list = panel.querySelector(".todo-list");
    const count = panel.querySelector(".todo-count");
    list.textContent = "";

    const open = items.filter((t) => !t.done).length;
    count.textContent = items.length ? open + " open" : "";
    panel.classList.toggle("todo-empty", !items.length);

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = item.done ? "done" : "";

      const label = document.createElement("label");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = item.done;
      box.addEventListener("change", () => mutate(() => { item.done = box.checked; }));
      const text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = item.text;
      label.appendChild(box);
      label.appendChild(text);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "todo-del";
      del.setAttribute("aria-label", "Delete task");
      del.textContent = "×";
      del.addEventListener("click", () => mutate(() => {
        items = items.filter((t) => t !== item);
      }));

      li.appendChild(label);
      li.appendChild(del);
      list.appendChild(li);
    });

    // "Clear done" appears once something is finished
    if (items.some((t) => t.done)) {
      const li = document.createElement("li");
      li.className = "todo-clear-row";
      const clear = document.createElement("button");
      clear.type = "button";
      clear.className = "todo-clear";
      clear.textContent = "Clear done";
      clear.addEventListener("click", () => mutate(() => {
        items = items.filter((t) => !t.done);
      }));
      li.appendChild(clear);
      list.appendChild(li);
    }
  }

  function initPanel(panel) {
    panels.push(panel);
    const form = panel.querySelector(".todo-form");
    const input = panel.querySelector(".todo-input");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      mutate(() => items.push({ id: Date.now(), text, done: false }));
    });
    renderList(panel);
  }

  function init() {
    load();
    initPanel(document.getElementById("todo-widget"));
    initPanel(document.getElementById("ios-todo"));

    // Desktop panel: draggable by its header, position remembered
    const panel = document.getElementById("todo-widget");
    const head = panel.querySelector(".todo-head");
    const saved = safeStore.get("todo-pos");
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
      panel.style.left = clamp(saved.x, 0, window.innerWidth - 120) + "px";
      panel.style.top = clamp(saved.y, 4, window.innerHeight - 60) + "px";
      panel.style.right = "auto";
    }
    let start = null;
    makeDraggable(head, {
      onStart() {
        start = { x: panel.offsetLeft, y: panel.offsetTop };
        panel.style.left = start.x + "px";
        panel.style.top = start.y + "px";
        panel.style.right = "auto";
      },
      onMove({ dx, dy }) {
        panel.style.left = clamp(start.x + dx, -100, window.innerWidth - 120) + "px";
        panel.style.top = clamp(start.y + dy, 4, window.innerHeight - 60) + "px";
      },
      onEnd() { safeStore.set("todo-pos", { x: panel.offsetLeft, y: panel.offsetTop }); },
    });
  }

  return { init };
})();
