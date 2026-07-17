/* Blog — chat-app style. Three panes: a topic rail (Discord-server style,
   derived from post tags), a channel list of posts (pinned first), and the
   post itself rendered as a conversation. Posts are markdown files where a
   line starting with "@handle " begins a new message (see posts/index.js).

   Visitors can type at the bottom; their comments render into the thread but
   live only in this tab — nothing is saved or sent anywhere. */
"use strict";

const Blog = (() => {
  let controller = null;   // set by init; lets Projects deep-link into a topic
  let pendingTag = null;
  let pendingSlug = null;

  const CANNED_REPLIES = [
    "Appreciate the comment. It's been saved to the world's most private database: your RAM.",
    "Noted — and by 'noted' I mean this message will cease to exist when you close the tab.",
    "Great point. Sadly it's only visible to you, which is either very exclusive or very pointless.",
    "The comment section thanks you. It's just you in here, but it thanks you.",
  ];

  /* Deterministic persona colours from the handle */
  function hueOf(handle) {
    let h = 0;
    for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) >>> 0;
    return h % 360;
  }
  function personaFor(handle) {
    if (handle === "aaron") return { name: "Aaron", initials: "AL", css: "linear-gradient(140deg, #5b5fe9, #9a5fe9)" };
    if (handle === "you") return { name: "you", initials: "🫵", css: "linear-gradient(140deg, #9aa0ad, #5f6570)" };
    const hue = hueOf(handle);
    return {
      name: handle,
      initials: handle.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "?",
      css: `linear-gradient(140deg, hsl(${hue} 62% 52%), hsl(${(hue + 40) % 360} 62% 38%))`,
    };
  }

  /* Split a markdown post into { handle, body } messages */
  function parseConversation(md) {
    const messages = [];
    let current = null;
    md.split("\n").forEach((line) => {
      const m = line.match(/^@([\w-]+)\s+(.*)$/);
      if (m) {
        if (current) messages.push(current);
        current = { handle: m[1], body: m[2] };
      } else if (current) {
        current.body += "\n" + line;
      } else if (line.trim()) {
        current = { handle: "aaron", body: line };
      }
    });
    if (current) messages.push(current);
    return messages;
  }

  /* Fake-but-stable message times: start at 9:41, drift forward */
  function timeFor(i, slug) {
    let mins = 9 * 60 + 41;
    for (let k = 0; k <= i; k++) mins += 1 + ((hueOf(slug) + k * 7) % 3);
    const h = Math.floor(mins / 60), mm = mins % 60;
    return ((h + 11) % 12 + 1) + ":" + String(mm).padStart(2, "0") + (h < 12 ? " am" : " pm");
  }

  function fmtDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function init(node) {
    const index = (window.BLOG_INDEX || []).slice()
      .sort((a, b) => (a.pinned === b.pinned ? (a.date < b.date ? 1 : -1) : (a.pinned ? -1 : 1)));
    const tags = [...new Set(index.flatMap((p) => p.tags || []))];

    const rail = node.querySelector(".blog-rail");
    const channels = node.querySelector(".blog-channels-list");
    const chat = node.querySelector(".blog-chat");
    const chatHeader = node.querySelector(".chat-title");
    const chatMeta = node.querySelector(".chat-meta");
    const scrollEl = node.querySelector(".chat-scroll");
    const input = node.querySelector(".chat-input");
    const backBtn = node.querySelector(".chat-back");

    const st = { tag: "all", post: null, replied: new Set() };

    /* ---------- topic rail ---------- */
    function railButton(tag, label, css) {
      const btn = document.createElement("button");
      btn.className = "rail-item";
      btn.dataset.tag = tag;
      btn.title = label;
      btn.setAttribute("aria-label", "Topic: " + label);
      const bubble = document.createElement("span");
      bubble.className = "rail-bubble";
      bubble.style.background = css;
      bubble.textContent = tag === "all" ? "✦" : label.replace(/[^a-z0-9]/gi, "").slice(0, 1).toUpperCase();
      btn.appendChild(bubble);
      btn.addEventListener("click", () => {
        st.tag = tag;
        renderRailActive();
        renderChannels();
        node.classList.remove("show-chat");
        setUrlHash(tag === "all" ? "blog" : "blog/" + encodeURIComponent(tag));
      });
      return btn;
    }
    rail.appendChild(railButton("all", "Everything", "linear-gradient(140deg, #5b5fe9, #9a5fe9)"));
    tags.forEach((t) => {
      const hue = hueOf(t);
      rail.appendChild(railButton(t, t, `linear-gradient(140deg, hsl(${hue} 62% 50%), hsl(${(hue + 45) % 360} 62% 36%))`));
    });
    function renderRailActive() {
      rail.querySelectorAll(".rail-item").forEach((b) => b.classList.toggle("active", b.dataset.tag === st.tag));
    }

    /* ---------- channel (post) list ---------- */
    function renderChannels() {
      channels.textContent = "";
      const visible = index.filter((p) => st.tag === "all" || (p.tags || []).includes(st.tag));
      if (!visible.length) {
        const empty = document.createElement("p");
        empty.className = "channel-empty";
        empty.textContent = "Nothing in this topic yet.";
        channels.appendChild(empty);
        return;
      }
      visible.forEach((post) => {
        const btn = document.createElement("button");
        btn.className = "channel" + (post.slug === (st.post && st.post.slug) ? " active" : "");
        btn.innerHTML =
          '<span class="channel-title"></span><span class="channel-snippet"></span><span class="channel-date"></span>';
        btn.querySelector(".channel-title").textContent = (post.pinned ? "📌 " : "") + post.title;
        btn.querySelector(".channel-snippet").textContent = post.summary || "";
        btn.querySelector(".channel-date").textContent = fmtDate(post.date);
        btn.addEventListener("click", () => openPost(post));
        channels.appendChild(btn);
      });
    }

    /* ---------- conversation ---------- */
    function addMessage(handle, bodyHtml, time, extraClass) {
      const p = personaFor(handle);
      const msg = document.createElement("div");
      msg.className = "chat-msg" + (extraClass ? " " + extraClass : "");
      const avatar = document.createElement("span");
      avatar.className = "chat-avatar";
      avatar.style.background = p.css;
      avatar.textContent = p.initials;
      const main = document.createElement("div");
      main.className = "chat-msg-main";
      const head = document.createElement("div");
      head.className = "chat-msg-head";
      const name = document.createElement("span");
      name.className = "chat-name";
      name.style.color = handle === "aaron" ? "var(--accent)" : `hsl(${hueOf(handle)} 62% 60%)`;
      name.textContent = p.name;
      const when = document.createElement("span");
      when.className = "chat-time";
      when.textContent = time;
      head.appendChild(name);
      head.appendChild(when);
      const body = document.createElement("div");
      body.className = "chat-body";
      body.innerHTML = bodyHtml;
      main.appendChild(head);
      main.appendChild(body);
      msg.appendChild(avatar);
      msg.appendChild(main);
      scrollEl.appendChild(msg);
      return msg;
    }

    function showNotice(html) {
      const div = document.createElement("div");
      div.className = "chat-notice";
      div.innerHTML = html;
      scrollEl.appendChild(div);
    }

    async function openPost(post) {
      st.post = post;
      renderChannels();
      node.classList.add("show-chat");
      setUrlHash("blog/post/" + post.slug);
      chatHeader.textContent = post.title;
      chatMeta.textContent = fmtDate(post.date) + ((post.tags || []).length ? " · #" + post.tags.join("  #") : "");
      scrollEl.textContent = "";
      chat.classList.add("open");

      if (location.protocol === "file:") {
        showNotice("Conversations can't load from disk. Run <code>python3 -m http.server 8000</code> and open <code>http://localhost:8000</code>.");
        return;
      }
      try {
        const res = await fetch("./posts/" + post.slug + ".md");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const md = await res.text();
        parseConversation(md).forEach((m, i) => {
          addMessage(m.handle, marked.parse(m.body), timeFor(i, post.slug));
        });
        scrollEl.scrollTop = 0; // read from the beginning — it's a story, not a live chat
      } catch (err) {
        showNotice("Couldn't load this conversation (" + String(err.message || err) + ").");
      }
    }

    /* ---------- local-only comments ---------- */
    function nowTime() {
      return new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toLowerCase();
    }

    function sendComment() {
      const text = input.textContent.trim();
      if (!text || !st.post) return;
      input.textContent = "";
      const safe = text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
      addMessage("you", "<p>" + safe + "</p>", nowTime(), "chat-msg-you");
      scrollEl.scrollTop = scrollEl.scrollHeight;

      if (!st.replied.has(st.post.slug)) {
        st.replied.add(st.post.slug);
        const typing = addMessage("aaron", '<p class="chat-typing"><span></span><span></span><span></span></p>', nowTime());
        scrollEl.scrollTop = scrollEl.scrollHeight;
        setTimeout(() => {
          const reply = CANNED_REPLIES[hueOf(st.post.slug) % CANNED_REPLIES.length];
          typing.querySelector(".chat-body").innerHTML = "<p>" + reply + "</p>";
          scrollEl.scrollTop = scrollEl.scrollHeight;
        }, 1600);
      }
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendComment(); }
    });
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text);
    });
    node.querySelector(".chat-send").addEventListener("click", sendComment);
    backBtn.addEventListener("click", () => {
      node.classList.remove("show-chat");
      setUrlHash(st.tag === "all" ? "blog" : "blog/" + encodeURIComponent(st.tag));
    });

    /* Draggable divider: the conversations list is resizable (persisted) */
    const channelsPane = node.querySelector(".blog-channels");
    const resizer = node.querySelector(".channels-resizer");
    const storedW = safeStore.get("blog-channels-w");
    if (Number.isFinite(storedW)) channelsPane.style.width = clamp(storedW, 150, 420) + "px";
    let wStart = null;
    makeDraggable(resizer, {
      onStart() { wStart = channelsPane.offsetWidth; },
      onMove({ dx }) { channelsPane.style.width = clamp(wStart + dx, 150, 420) + "px"; },
      onEnd() { safeStore.set("blog-channels-w", channelsPane.offsetWidth); },
    });
    resizer.addEventListener("dblclick", () => {
      channelsPane.style.width = "";
      safeStore.remove("blog-channels-w");
    });

    renderRailActive();
    renderChannels();

    controller = {
      setTag(tag) {
        // deep links may use hyphens for spaces: #blog/home-automation
        const wanted = tags.includes(tag) ? tag
          : tags.includes(String(tag).replace(/-/g, " ")) ? String(tag).replace(/-/g, " ")
          : "all";
        st.tag = wanted;
        renderRailActive();
        renderChannels();
        node.classList.remove("show-chat");
        setUrlHash(wanted === "all" ? "blog" : "blog/" + encodeURIComponent(wanted));
      },
      openSlug(slug) {
        const post = index.find((p) => p.slug === slug);
        if (post) openPost(post);
      },
    };
    if (pendingTag) { controller.setTag(pendingTag); pendingTag = null; }
    if (pendingSlug) { controller.openSlug(pendingSlug); pendingSlug = null; }
  }

  /* Deep-link API: open the blog filtered to a topic, or straight to a post.
     Used by Projects' "read the series" links and the #hash router. */
  function openTag(tag) {
    if (controller) controller.setTag(tag);
    else pendingTag = tag;
  }
  function openSlug(slug) {
    if (controller) controller.openSlug(slug);
    else pendingSlug = slug;
  }

  return { init, openTag, openSlug };
})();

Apps.onCreate("blog", Blog.init);
