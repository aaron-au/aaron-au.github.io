/* Shared behaviour for every Goulding's demo: HTML helpers, the before and
   after comparison, the lightbox, the demo quote form, scroll reveals,
   the sticky nav and the demo switcher. Each design's site.js calls
   GG.boot({ variant, render }) with its own layout. */

(function () {
  const G = window.GG;
  const ROOT = "../";

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Tagged template that escapes interpolations; arrays are joined, and
  // raw() marks already-built HTML so it passes through untouched.
  const RAW = Symbol("raw");
  const raw = (s) => ({ [RAW]: String(s) });
  const out = (v) => Array.isArray(v) ? v.map(out).join("")
    : v && v[RAW] !== undefined ? v[RAW] : esc(v);
  const html = (strings, ...vals) =>
    raw(strings.reduce((a, s, i) => a + s + (i < vals.length ? out(vals[i]) : ""), ""));

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Paths in content.js are relative to gouldings/; designs sit one deeper.
  const src = (p) => ROOT + p;
  const pairSrc = (pair, side) => src(`photos/pairs/${pair.slug}-${side}.jpg`);
  const phone = () => G.contact.phone.replace(/[^\d+]/g, "");

  /* ---- before and after ----------------------------------------------
     compare(pair) is a drag slider: the "after" photo underneath, the
     "before" on top clipped to --pos. A transparent range input on top
     does the dragging, so it works with touch, mouse and keyboard.
     flip(pair) is a tap-to-switch card for designs that want it simpler. */

  const compare = (pair, { cls = "", start = 50 } = {}) => html`
<figure class="ba ${cls}" style="--pos:${start}%">
  <img class="ba-after" src="${pairSrc(pair, "after")}" alt="${pair.title}, after" loading="lazy">
  <img class="ba-before" src="${pairSrc(pair, "before")}" alt="${pair.title}, before" loading="lazy">
  <span class="ba-tag ba-tag-before" aria-hidden="true">Before</span>
  <span class="ba-tag ba-tag-after" aria-hidden="true">After</span>
  <span class="ba-handle" aria-hidden="true"></span>
  <input class="ba-range" type="range" min="0" max="100" value="${start}" aria-label="${pair.title}: drag to compare before and after">
</figure>`;

  const flip = (pair, { cls = "" } = {}) => html`
<figure class="flip ${cls}">
  <button type="button" class="flip-btn" aria-pressed="false" aria-label="${pair.title}: show after">
    <img class="flip-before" src="${pairSrc(pair, "before")}" alt="${pair.title}, before" loading="lazy">
    <img class="flip-after" src="${pairSrc(pair, "after")}" alt="${pair.title}, after" loading="lazy">
    <span class="flip-tag"><span class="flip-tag-before">Before</span><span class="flip-tag-after">After</span></span>
  </button>
</figure>`;

  function bindCompare() {
    document.addEventListener("input", (e) => {
      const r = e.target.closest(".ba-range");
      if (r) r.parentElement.style.setProperty("--pos", r.value + "%");
    });
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".flip-btn");
      if (!b) return;
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      b.setAttribute("aria-label", b.getAttribute("aria-label").replace(/show (after|before)$/, on ? "show before" : "show after"));
    });
  }

  /* ---- quote form ----------------------------------------------------
     A demo: it validates, says thanks and sends nothing. Wire it to a
     form service or Worker once a design is chosen. */

  const quoteForm = ({ cls = "", button = "btn" } = {}) => html`
<form class="quote ${cls}" data-quote novalidate>
  <div class="q-row">
    <label><span>Name</span><input name="name" autocomplete="name" required></label>
    <label><span>Phone</span><input name="phone" type="tel" autocomplete="tel" required></label>
  </div>
  <label><span>Suburb</span><input name="suburb" autocomplete="address-level2"></label>
  <label><span>What do you need?</span>
    <select name="interest">${[...G.services.map((s) => s.name), G.contact.other].map((i) => html`<option>${i}</option>`)}</select></label>
  <label><span>Tell us about the job</span><textarea name="message" rows="4" placeholder="Rough size, what's there now, what you'd like"></textarea></label>
  <button class="${button}" type="submit">Request a free quote</button>
  <p class="q-note" role="status" hidden></p>
</form>`;

  function bindForms() {
    $$("[data-quote]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = $(".q-note", f);
      const missing = $$("[required]", f).filter((i) => !i.value.trim());
      note.hidden = false;
      if (missing.length) {
        note.textContent = "Add your name and phone number so we can call you back.";
        missing[0].focus();
        return;
      }
      note.textContent = "Thanks! This is a demo, so nothing was sent. On the live site we'd be in touch within a day.";
      f.reset();
    }));
    // Service buttons prefill "What do you need?".
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-enquire]");
      if (!a) return;
      $$("[data-quote] select[name=interest]").forEach((s) => {
        const opt = [...s.options].find((o) => o.text === a.dataset.enquire);
        if (opt) s.value = opt.text;
      });
    });
  }

  /* ---- lightbox ------------------------------------------------------ */

  function lightbox(photos) {
    let box = $("#gg-lightbox");
    if (!box) {
      box = document.createElement("dialog");
      box.id = "gg-lightbox";
      box.innerHTML = `<button class="lb-prev" aria-label="Previous">‹</button>
        <figure><img alt=""><figcaption></figcaption></figure>
        <button class="lb-next" aria-label="Next">›</button>
        <button class="lb-close" aria-label="Close">×</button>`;
      document.body.append(box);
    }
    let i = 0;
    const show = (n) => {
      i = (n + photos.length) % photos.length;
      $("img", box).src = src(photos[i].src);
      $("img", box).alt = photos[i].caption;
      $("figcaption", box).textContent = photos[i].caption;
    };
    box.onclick = (e) => {
      if (e.target === box || e.target.closest(".lb-close")) box.close();
      else if (e.target.closest(".lb-prev")) show(i - 1);
      else if (e.target.closest(".lb-next")) show(i + 1);
    };
    box.onkeydown = (e) => {
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    };
    return (n) => { show(n); box.showModal(); };
  }

  function bindGallery() {
    const open = lightbox(G.photos);
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-photo]");
      if (el) open(+el.dataset.photo);
    });
  }

  /* ---- page behaviour ------------------------------------------------ */

  function reveals() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  }

  function nav() {
    const header = $("[data-header]");
    const toggle = $("[data-menu-toggle]");
    if (header) {
      const onScroll = () => header.classList.toggle("scrolled", scrollY > 40);
      addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    if (toggle) {
      toggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", open);
      });
      $$("[data-nav] a").forEach((a) => a.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      }));
    }
  }

  function switcher(current) {
    // Hidden when dismissed, and inside the chooser page's preview frames.
    if (!G.variants || sessionStorage.getItem("gg-switcher") === "off" || window.self !== window.top) return;
    const bar = document.createElement("nav");
    bar.id = "gg-switcher";
    bar.setAttribute("aria-label", "Demo designs");
    bar.innerHTML = out(html`<a class="sw-home" href="../" title="All designs">Goulding's demos</a>
      ${G.variants.map((v) => html`<a href="../${v.id}/" data-v="${v.id}" ${raw(v.id === current ? 'aria-current="page"' : "")}>${v.label}</a>`)}
      <button type="button" aria-label="Hide demo bar">×</button>`);
    bar.addEventListener("click", (e) => {
      // Carry the current section across when switching designs.
      const a = e.target.closest("a[data-v]");
      if (a) a.href = `../${a.dataset.v}/${location.hash}`;
      if (e.target.closest("button")) { sessionStorage.setItem("gg-switcher", "off"); bar.remove(); }
    });
    document.body.append(bar);
  }

  function boot({ variant, render, afterRender }) {
    $("#app").innerHTML = out(render(G, { html, raw, esc, src, pairSrc, phone, compare, flip, quoteForm }));
    document.title = `${G.brand.name} ${G.brand.trade}`;
    bindCompare();
    bindForms();
    bindGallery();
    afterRender?.();
    nav();
    reveals();
    switcher(variant);
    $$("[data-year]").forEach((y) => { y.textContent = new Date().getFullYear(); });
    // Re-apply a deep link now that the sections exist.
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }

  Object.assign(G, { html, raw, esc, $, $$, boot });
})();
