/* Tasks — a small kanban board (Todo / In Progress / Done).
   Stored in localStorage only: per browser, per device, synced nowhere.
   Cards drag between columns with a mouse; on touch the ◀ ▶ buttons do the
   moving (dragging cards would fight scroll gestures). Double-click a card
   to edit it. Migrates the old flat todo-widget list on first run. */
"use strict";

const Tasks = (() => {
  const STATUSES = ["todo", "doing", "done"];
  let items = []; // [{ id, text, status }]

  function load() {
    const saved = safeStore.get("kanban");
    if (Array.isArray(saved)) {
      items = saved.filter((t) => t && typeof t.text === "string" && STATUSES.includes(t.status));
      return;
    }
    // migrate the old todo-widget format
    const legacy = safeStore.get("todos");
    if (Array.isArray(legacy)) {
      items = legacy
        .filter((t) => t && typeof t.text === "string")
        .map((t) => ({ id: t.id || Date.now() + Math.floor(performance.now()), text: t.text, status: t.done ? "done" : "todo" }));
      save();
      safeStore.remove("todos");
      safeStore.remove("todo-pos");
    }
  }
  function save() { safeStore.set("kanban", items); }

  function init(node) {
    load();

    const cols = {};
    STATUSES.forEach((s) => { cols[s] = node.querySelector(`.kb-col[data-status="${s}"]`); });

    function mutate(fn) { fn(); save(); render(); }

    function makeCard(item) {
      const card = document.createElement("div");
      card.className = "kb-card";
      card.dataset.id = item.id;

      const text = document.createElement("span");
      text.className = "kb-text";
      text.textContent = item.text;
      card.appendChild(text);

      const controls = document.createElement("span");
      controls.className = "kb-controls";
      const idx = STATUSES.indexOf(item.status);
      const mkBtn = (label, aria, fn, disabled) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.setAttribute("aria-label", aria);
        b.disabled = !!disabled;
        b.addEventListener("click", (e) => { e.stopPropagation(); fn(); });
        controls.appendChild(b);
      };
      mkBtn("‹", "Move left", () => mutate(() => { item.status = STATUSES[idx - 1]; }), idx === 0);
      mkBtn("›", "Move right", () => mutate(() => { item.status = STATUSES[idx + 1]; }), idx === STATUSES.length - 1);
      mkBtn("×", "Delete task", () => mutate(() => { items = items.filter((t) => t !== item); }));
      card.appendChild(controls);

      // double-click to edit in place
      card.addEventListener("dblclick", () => {
        text.contentEditable = "true";
        text.focus();
        const range = document.createRange();
        range.selectNodeContents(text);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        const finish = () => {
          text.contentEditable = "false";
          const t = text.textContent.trim();
          if (t) mutate(() => { item.text = t; });
          else render(); // empty edit: restore
        };
        text.addEventListener("blur", finish, { once: true });
        text.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); text.blur(); }
          if (e.key === "Escape") { text.textContent = item.text; text.blur(); }
        });
      });

      // mouse drag between columns (touch uses the buttons instead)
      let ghost = null;
      let cardRect = null;
      makeDraggable(card, {
        ignore: ".kb-controls, [contenteditable='true']",
        onStart({ event }) {
          if (event.pointerType === "touch") return false;
          cardRect = card.getBoundingClientRect();
          ghost = card.cloneNode(true);
          ghost.className = "kb-card kb-ghost";
          ghost.style.width = cardRect.width + "px";
          ghost.style.left = cardRect.left + "px";
          ghost.style.top = cardRect.top + "px";
          document.body.appendChild(ghost);
          card.classList.add("kb-dragging");
        },
        onMove({ dx, dy, event }) {
          ghost.style.left = (cardRect.left + dx) + "px";
          ghost.style.top = (cardRect.top + dy) + "px";
          const under = document.elementFromPoint(event.clientX, event.clientY);
          const col = under && under.closest(".kb-col");
          STATUSES.forEach((s) => cols[s].classList.toggle("kb-drop", cols[s] === col));
        },
        onEnd({ event }) {
          const under = document.elementFromPoint(event.clientX, event.clientY);
          const col = under && under.closest(".kb-col");
          ghost.remove();
          ghost = null;
          card.classList.remove("kb-dragging");
          STATUSES.forEach((s) => cols[s].classList.remove("kb-drop"));
          if (col && col.dataset.status !== item.status) {
            mutate(() => { item.status = col.dataset.status; });
          }
        },
      });

      return card;
    }

    function render() {
      STATUSES.forEach((status) => {
        const col = cols[status];
        const cardsEl = col.querySelector(".kb-cards");
        cardsEl.textContent = "";
        const inCol = items.filter((t) => t.status === status);
        col.querySelector(".kb-count").textContent = inCol.length || "";
        inCol.forEach((item) => cardsEl.appendChild(makeCard(item)));
      });
      const clear = node.querySelector(".kb-clear");
      clear.hidden = !items.some((t) => t.status === "done");
    }

    node.querySelector(".kb-add").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = e.target.querySelector("input");
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      mutate(() => items.push({ id: Date.now(), text, status: "todo" }));
    });
    node.querySelector(".kb-clear").addEventListener("click", () =>
      mutate(() => { items = items.filter((t) => t.status !== "done"); }));

    render();
  }

  return { init };
})();

Apps.onCreate("tasks", Tasks.init);
