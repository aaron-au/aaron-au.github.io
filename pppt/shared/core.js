/* Shared behaviour for every PPPT demo: HTML helpers, pricing, myPTHub
   links, the opening special, the enquiry form, the gallery-folder
   loader, lightbox, scroll reveals, sticky nav and the demo switcher.
   Each variant's site.js calls PPPT.boot(render) with its own layout. */

(function () {
  const P = window.PPPT;
  const IMG = /\.(jpe?g|png|webp|avif|gif|svg)$/i;

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

  // The heartbeat line from the logo. Styled per variant via .pulse-line;
  // base.css animates the stroke drawing in.
  const pulse = (cls = "") => raw(`<svg class="pulse-line ${cls}" viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden="true">
    <path pathLength="1" d="M0 60 H210 L228 60 L240 38 L252 60 L268 60 L282 8 L300 96 L316 26 L328 60 L346 60 L356 48 L366 60 H600"/></svg>`);

  /* ---- pricing -------------------------------------------------------
     Prices come as arrays, one value per session length. live() renders a
     value for the current length and tags it so the toggle can swap it. */

  const M = P.memberships;
  let dur = M.defaultDuration ?? 0;
  const money = (n) => "$" + (n % 1 ? n.toFixed(2) : n.toLocaleString("en-AU"));
  const FMT = {
    money,
    save: (n) => n > 0 ? `Save ${money(n)} a session` : "",
    pct: (n) => n > 0 ? `Save ${Math.round(n)}%` : "",
  };
  const live = (values, fmt = "money") =>
    raw(`<span data-live="${values.join("|")}" data-fmt="${fmt}">${esc(FMT[fmt](values[dur]))}</span>`);
  // Per-session price and saving against a casual session, per length.
  const perSession = (plan) => plan.prices.map((p) => p / plan.perWeek);
  const saving = (plan) => perSession(plan).map((s, i) => M.payg.casual[i] - s);
  const packEach = () => M.payg.pack.map((p) => p / 10);
  const durLabel = () => raw(`<span data-dur-label>${M.durations[dur]}-minute</span>`);

  const durationToggle = (cls = "dur") => raw(`<div class="${cls}" role="group" aria-label="Session length">${
    M.durations.map((d, i) => `<button type="button" data-dur="${i}" aria-pressed="${i === dur}">${d} min</button>`).join("")}</div>`);

  function bindDurations() {
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-dur]");
      if (!b) return;
      dur = +b.dataset.dur;
      $$("[data-dur]").forEach((x) => x.setAttribute("aria-pressed", +x.dataset.dur === dur));
      $$("[data-live]").forEach((x) => { x.textContent = FMT[x.dataset.fmt](+x.dataset.live.split("|")[dur]); });
      $$("[data-dur-label]").forEach((x) => { x.textContent = `${M.durations[dur]}-minute`; });
      $$("[data-buy]").forEach((x) => {
        const id = x.dataset.buy.split("|")[dur];
        x.hidden = !id;
        if (id) x.href = productUrl(id);
      });
    });
  }

  /* ---- myPTHub products ----------------------------------------------
     Purchases happen on myPTHub's own product pages. buy() takes one
     product number per session length (or a single number) and renders a
     link that follows the toggle, hidden for lengths with no product. */

  const S = P.store;
  const productUrl = (id) => id ? S.product + id : S.home;
  const buy = (ids, label = S.buyLabel, cls = "buy") => {
    const list = Array.isArray(ids) ? ids : M.durations.map(() => ids);
    if (!list.some(Boolean)) return "";
    const id = list[dur];
    return raw(`<a class="${cls}" data-buy="${list.map((x) => x ?? "").join("|")}" href="${esc(productUrl(id))}" target="_blank" rel="noopener"${id ? "" : " hidden"}>${esc(label)} ↗</a>`);
  };

  /* ---- in person | online --------------------------------------------
     The choice lives on <html data-location>, and base.css hides anything
     marked data-loc for the other location. Designs mark elements with
     loc.at(where), swap short text with loc.swap(), and place loc.toggle(). */

  const L = P.locations;
  const LOC_KEY = "pppt-location";
  const locIds = L.options.map((o) => o.id);
  let where = [new URLSearchParams(location.search).get("loc"), localStorage.getItem(LOC_KEY)]
    .find((x) => locIds.includes(x)) || L.default;

  const loc = {
    at: (w) => raw(w ? `data-loc="${esc(w)}"` : ""),
    swap: (inPerson, online) => html`<span data-loc="in-person">${inPerson}</span><span data-loc="online">${online}</span>`,
    toggle: (cls = "dur loc") => raw(`<div class="${cls}" role="group" aria-label="Where you train">${
      L.options.map((o) => `<button type="button" data-loc-set="${o.id}" aria-pressed="${o.id === where}">${esc(o.label)}</button>`).join("")}</div>`),
  };

  function setLocation(w, { remember = true } = {}) {
    where = w;
    document.documentElement.dataset.location = w;
    $$("[data-loc-set]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.locSet === w));
    if (remember) localStorage.setItem(LOC_KEY, w);
    dispatchEvent(new CustomEvent("pppt:location", { detail: w }));
  }

  function bindLocation() {
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-loc-set]");
      if (b) setLocation(b.dataset.locSet);
    });
  }

  // Number services within their own location, so each list reads 01, 02, 03.
  const counts = {};
  P.services.forEach((s) => {
    const k = s.where || "both";
    s.n = String(counts[k] = (counts[k] || 0) + 1).padStart(2, "0");
  });

  /* ---- online coaching -----------------------------------------------
     One shared block, so all four designs get the same plans. Designs pass
     their own button and heading classes; the rest is styled in base.css
     through --oc-* variables. */

  const O = P.online;
  // A myPTHub product page if there's a number, otherwise the enquiry form.
  const ocButton = (item, cls) => item.product
    ? html`<a class="${cls}" href="${productUrl(item.product)}" target="_blank" rel="noopener">${item.cta} ↗</a>`
    : html`<a class="${cls}" href="#contact" data-enquire="${item.name}">${item.cta}</a>`;

  const online = ({ button = "btn", buttonAlt = button, title = "", head = true } = {}) => html`
<div class="oc">
  ${head ? html`<div class="oc-head reveal">
    <p class="oc-kicker">${O.kicker}</p>
    <h2 class="oc-title ${title}"><span>${O.heading[0]} <em>${O.heading[1]}</em></span></h2>
    ${O.intro.map((p) => html`<p class="oc-intro">${p}</p>`)}
  </div>` : ""}
  <div class="oc-plans">
    ${O.plans.map((p, i) => html`
    <article class="oc-plan ${p.featured ? "oc-featured" : ""} reveal reveal-d${i}">
      ${p.badge ? html`<span class="oc-badge">${p.badge}</span>` : ""}
      <h3>${p.name}</h3>
      <p class="oc-price"><b>${money(p.price)}</b>/${p.per}</p>
      <p class="oc-blurb">${p.blurb}</p>
      <ul role="list">${p.includes.map((x) => html`<li>${x}</li>`)}</ul>
      ${ocButton(p, p.featured ? button : buttonAlt)}
    </article>`)}
  </div>
  <p class="oc-note">${O.note}</p>
  <div class="oc-extras reveal">
    <div class="oc-extras-head"><h3>${O.oneOffs.heading}</h3><p>${O.oneOffs.blurb}</p></div>
    ${O.oneOffs.items.map((x) => html`
    <div class="oc-item">
      <h4>${x.name}</h4>
      <p class="oc-price"><b>${money(x.price)}</b> ${x.unit}</p>
      <p>${x.blurb}</p>
      ${ocButton(x, "oc-link")}
    </div>`)}
  </div>
  <p class="oc-suits"><span>Suits</span>${O.suits.map((s) => html`<i>${s}</i>`)}</p>
</div>`;

  /* ---- opening special -----------------------------------------------
     On between special.start and special.end (the visitor's local date).
     ?special=on / ?special=off in the address overrides that for previews.
     Designs place banner() and plan() themselves; the corner card is
     added by boot(). All of it renders nothing when the special is off. */

  const SP = P.special;
  const spForced = new URLSearchParams(location.search).get("special");
  const specialOn = SP && (spForced ? spForced !== "off" : (() => {
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
    return today >= SP.start && today <= SP.end;
  })());
  const spEnd = SP && new Date(SP.end + "T00:00").toLocaleDateString("en-AU", { day: "numeric", month: "long" });
  const spTerms = SP && SP.terms.replace("{end}", spEnd);
  const spInterest = SP && `${SP.title} (${SP.percent}% off a membership)`;
  const discounted = (prices) => prices.map((p) => Math.round(p * (100 - SP.percent)) / 100);

  const special = {
    on: specialOn,
    banner: ({ button = "btn" } = {}) => specialOn ? html`<div class="sp-banner reveal">
  <div><p class="sp-kicker">${SP.title} · ends ${spEnd}</p><p class="sp-head">${SP.headline}</p><p class="sp-terms">${spTerms}</p></div>
  <a class="${button}" href="#contact" data-enquire="${spInterest}">${SP.cta}</a>
</div>` : "",
    plan: (p) => specialOn ? html`<p class="sp-plan">${live(discounted(p.prices))}/wk with the ${SP.title.toLowerCase()}</p>` : "",
  };

  // A small card in the corner, once per visitor, after they scroll past
  // the first screen. It steps aside while the prices (which carry their
  // own banner) or the contact form are on screen.
  function specialCard(button) {
    const key = "pppt-special-seen:" + SP?.end;
    if (!specialOn || (!spForced && localStorage.getItem(key))) return;
    const card = document.createElement("aside");
    card.className = "sp-card";
    card.dataset.loc = "in-person"; // the special is for in-person memberships
    card.setAttribute("aria-label", SP.title);
    card.innerHTML = out(html`<button class="sp-x" type="button" aria-label="Dismiss">×</button>
      <p class="sp-kicker">${SP.title} · ends ${spEnd}</p>
      <p class="sp-head">${SP.headline}</p>
      <p class="sp-terms">${spTerms}</p>
      <div class="sp-actions"><a class="${button}" href="#contact" data-enquire="${spInterest}">${SP.cta}</a><a class="sp-more" href="#memberships">See prices</a></div>`);
    const close = () => { localStorage.setItem(key, "1"); card.classList.remove("in"); setTimeout(() => card.remove(), 400); };
    card.addEventListener("click", (e) => { if (e.target.closest(".sp-x, a")) close(); });
    document.body.append(card);
    const onScroll = () => {
      if (scrollY < innerHeight * 0.8) return;
      removeEventListener("scroll", onScroll);
      card.classList.add("in");
    };
    addEventListener("scroll", onScroll, { passive: true });
    const busy = [$("#memberships"), $("#contact")].filter(Boolean);
    if ("IntersectionObserver" in window) {
      const inView = new Set();
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) e.isIntersecting ? inView.add(e.target) : inView.delete(e.target);
        card.classList.toggle("away", inView.size > 0);
      }, { rootMargin: "-20% 0px -20% 0px" });
      busy.forEach((el) => io.observe(el));
    }
  }

  /* ---- enquiry form --------------------------------------------------
     One form, styled per variant through the .cf-* classes. Every CTA
     carries data-enquire="<option>" so clicking it pre-fills "Interested
     in" (and the session length) before the page scrolls to the form. */

  const interests = () => [
    ...(specialOn ? [spInterest] : []),
    "Free consult",
    ...M.plans.map((p) => `${p.name} membership (${p.perWeek}× weekly)`),
    "10-session pack", "Casual session", "Evolt 360 scan",
    ...O.plans.map((p) => p.name), ...O.oneOffs.items.map((p) => p.name),
    "Something else",
  ];
  const planInterest = (p) => `${p.name} membership (${p.perWeek}× weekly)`;

  const F = P.contact.form;
  const formLive = F.action && F.liveHosts.some((h) => location.hostname === h || location.hostname.endsWith(h.startsWith(".") ? h : "." + h));

  const contactForm = ({ button = "btn" } = {}) => {
    return html`<form class="cf" data-contact-form method="post" action="${F.action}">
  <div class="cf-row">
    <label class="cf-field"><span>Name</span><input name="name" required autocomplete="name"></label>
    <label class="cf-field"><span>Phone</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel"></label>
  </div>
  <label class="cf-field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
  <div class="cf-row">
    <label class="cf-field"><span>Interested in</span><select name="interest">${interests().map((o) => html`<option>${o}</option>`)}</select></label>
    <label class="cf-field"><span>Session length</span><select name="length">${M.durations.map((d, i) => html`<option value="${d} min" ${raw(i === dur ? "selected" : "")}>${d} minutes</option>`)}<option>Not sure yet</option></select></label>
  </div>
  <label class="cf-field"><span>Goals</span><textarea name="message" rows="4" placeholder="What are you working towards? Any injuries we should know about?"></textarea></label>
  <input class="cf-trap" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
  ${formLive && F.turnstileSiteKey ? html`<div class="cf-turnstile" data-sitekey="${F.turnstileSiteKey}" data-theme="auto"></div>` : ""}
  <button class="${button}" type="submit">${F.submit}</button>
  <p class="cf-status" role="status"></p>
</form>`;
  };

  function bindForm() {
    const form = $("[data-contact-form]");
    if (!form) return;
    // Cloudflare's Turnstile widget renders into .cf-turnstile by itself.
    if (formLive && F.turnstileSiteKey) {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      document.head.append(s);
    }
    document.addEventListener("click", (e) => {
      const cta = e.target.closest("[data-enquire]");
      if (!cta) return;
      form.interest.value = cta.dataset.enquire;
      form.length.value = `${M.durations[dur]} min`;
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = $(".cf-status", form);
      if (form._gotcha.value) return; // bots fill the hidden field
      if (!formLive) { status.textContent = F.demo; return; }
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      try {
        const res = await fetch(F.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw 0;
        form.reset();
        window.turnstile?.reset();
        status.textContent = F.sent;
      } catch {
        status.textContent = F.failed;
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---- gallery folder ------------------------------------------------
     A static host can't list a folder, so:
       local dev  -> parse python http.server's directory listing
       deployed   -> GitHub contents API (cached per tab; 60 req/hr/IP)
       fallback   -> gallery/manifest.json if someone adds one */

  const caption = (file) => decodeURIComponent(file)
    .replace(/\.[^.]+$/, "")
    .replace(/^hero[-_]?/i, "")
    .replace(/^\d+[-_ ]*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());

  async function listFromDirectory(folder) {
    const res = await fetch(folder, { cache: "no-store" });
    if (!res.ok || !(res.headers.get("content-type") || "").includes("html")) throw 0;
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    const names = $$("a[href]", doc).map((a) => a.getAttribute("href")).filter((h) => IMG.test(h) && !h.includes("/"));
    if (!names.length) throw 0;
    return names;
  }

  async function listFromGitHub({ repo, branch, path }) {
    const key = "pppt-gallery:" + repo + "/" + path;
    const cached = sessionStorage.getItem(key);
    if (cached) return JSON.parse(cached);
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`);
    if (!res.ok) throw 0;
    const names = (await res.json()).filter((f) => f.type === "file" && IMG.test(f.name)).map((f) => f.name);
    sessionStorage.setItem(key, JSON.stringify(names));
    return names;
  }

  async function listFromManifest(folder) {
    const res = await fetch(folder + "manifest.json", { cache: "no-store" });
    if (!res.ok) throw 0;
    return (await res.json()).filter((n) => IMG.test(n));
  }

  async function loadGallery() {
    const g = P.gallery;
    const local = /^(localhost|127\.|\[::1\])/.test(location.hostname) || location.protocol === "file:";
    const tries = local
      ? [() => listFromDirectory(g.folder), () => listFromManifest(g.folder)]
      : [() => listFromGitHub(g.github), () => listFromManifest(g.folder), () => listFromDirectory(g.folder)];
    let names = [];
    for (const t of tries) {
      try { names = await t(); break; } catch { /* next source */ }
    }
    names = [...new Set(names.map((n) => decodeURIComponent(n)))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const items = names.map((n) => ({ src: g.folder + encodeURIComponent(n), name: n, caption: caption(n) }));
    return {
      hero: items.filter((i) => /^hero/i.test(i.name)),
      photos: items.filter((i) => !/^hero/i.test(i.name)),
    };
  }

  /* ---- lightbox ------------------------------------------------------ */

  function lightbox(photos) {
    let box = $("#pppt-lightbox");
    if (!box) {
      box = document.createElement("dialog");
      box.id = "pppt-lightbox";
      box.innerHTML = `<button class="lb-close" aria-label="Close">×</button>
        <button class="lb-prev" aria-label="Previous">‹</button>
        <figure><img alt=""><figcaption></figcaption></figure>
        <button class="lb-next" aria-label="Next">›</button>`;
      document.body.append(box);
    }
    let i = 0;
    const show = (n) => {
      i = (n + photos.length) % photos.length;
      $("img", box).src = photos[i].src;
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

  // Fill every [data-gallery] container: each child with [data-photo=n]
  // becomes clickable. Variants supply the markup via a render callback.
  function mountGallery(container, photos, renderItem, renderEmpty) {
    if (!container) return;
    if (!photos.length) { container.innerHTML = out(renderEmpty()); return; }
    container.innerHTML = photos.map((p, n) => out(renderItem(p, n))).join("");
    const open = lightbox(photos);
    container.addEventListener("click", (e) => {
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
    // Highlight the nav link for the section in view.
    const links = $$("[data-nav] a[href^='#']");
    const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    if (targets.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) {
          links.forEach((a) => a.classList.toggle("active", a.hash === "#" + e.target.id));
        }
      }, { rootMargin: "-45% 0px -50% 0px" });
      targets.forEach((t) => io.observe(t));
    }
  }

  function switcher(current) {
    // Hidden when dismissed, and inside the chooser page's preview frames.
    if (!P.variants || sessionStorage.getItem("pppt-switcher") === "off" || window.self !== window.top) return;
    const bar = document.createElement("nav");
    bar.id = "pppt-switcher";
    bar.setAttribute("aria-label", "Demo designs");
    bar.innerHTML = out(html`<a class="sw-home" href="../" title="All designs">PPPT demos</a>
      ${P.variants.map((v) => html`<a href="../${v.id}/" data-v="${v.id}" ${raw(v.id === current ? 'aria-current="page"' : "")}>${v.label}</a>`)}
      <button type="button" aria-label="Hide demo bar">×</button>`);
    bar.addEventListener("click", (e) => {
      // Carry the current section across when switching designs.
      const a = e.target.closest("a[data-v]");
      if (a) a.href = `../${a.dataset.v}/${location.hash}`;
      if (e.target.closest("button")) { sessionStorage.setItem("pppt-switcher", "off"); bar.remove(); }
    });
    document.body.append(bar);
  }

  async function boot({ variant, render, galleryItem, galleryEmpty, onGallery, afterRender, specialButton = "btn" }) {
    const root = $("#app");
    const price = { money, live, perSession, saving, packEach, durLabel, durationToggle, planInterest, buy };
    setLocation(where, { remember: false });
    root.innerHTML = out(render(P, { html, raw, esc, pulse, price, contactForm, special, loc, online }));
    document.title = `${P.brand.name}`;
    // Merch can be switched off in content.js; take out the section and
    // every link to it.
    if (P.merch.show === false) {
      $("#shop")?.remove();
      $$('a[href="#shop"]').forEach((a) => a.remove());
    }
    bindLocation();
    bindDurations();
    bindForm();
    specialCard(specialButton);
    afterRender?.();
    nav();
    reveals();
    switcher(variant);
    const year = $("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
    // Re-apply a deep link now that the sections exist.
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();

    const g = await loadGallery();
    mountGallery($("[data-gallery]"), g.photos, galleryItem, galleryEmpty);
    onGallery?.(g);
  }

  Object.assign(P, { html, raw, esc, pulse, $, $$, boot, caption, productUrl });
})();
