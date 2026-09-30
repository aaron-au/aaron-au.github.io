/* Formal · Dark — "Studio". Quiet luxury: charcoal, light type, thin
   rules, sticky section labels, red only as a signal. */

PPPT.boot({
  variant: "formal-dark",

  render: (P, { html, pulse, price, contactForm }) => {
    const nav = [["method", "Method"], ["services", "Services"], ["memberships", "Membership"], ["timetable", "Classes"], ["gallery", "Studio"], ["contact", "Visit"]];
    const m = P.memberships;
    const t = P.timetable;
    const c = P.about.coach;
    const part = (id, n, label, body, extra = "") => html`
<section class="part ${extra}" id="${id}">
  <div class="wrap part-grid">
    <header class="part-label"><span>${n}</span><h2>${label}</h2></header>
    <div class="part-body">${body}</div>
  </div>
</section>`;

    return html`
<header class="hdr" data-header>
  <a class="brand" href="#top"><img src="${P.brand.logo}" alt=""><span>Pulse Performance</span></a>
  <nav class="hdr-nav" data-nav>${nav.map(([id, l]) => html`<a href="#${id}">${l}</a>`)}</nav>
  <a class="hdr-cta" href="#contact" data-enquire="Free consult">Enquire</a>
  <button class="hdr-menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span><span></span></button>
</header>

<section class="hero" id="top">
  <div class="hero-bg" data-hero-bg></div>
  <div class="hero-glow"></div>
  <div class="hero-inner">
    <img class="hero-logo" src="${P.brand.logo}" alt="${P.brand.name}">
    <p class="hero-kicker">${P.brand.tagline.join("  ·  ")}</p>
    <h1>${P.hero.headline}</h1>
    <p class="hero-sub">${P.hero.sub}</p>
    <div class="hero-ctas">
      <a class="btn btn-solid" href="${P.hero.primary.href}" data-enquire="Free consult">${P.hero.primary.label}</a>
      <a class="btn btn-line" href="${P.hero.secondary.href}">${P.hero.secondary.label}</a>
    </div>
  </div>
  <div class="hero-pulse">${pulse()}</div>
  <a class="scroll" href="#method">Scroll</a>
</section>

${part("method", "01", "Method", html`
  <p class="big reveal">${P.about.body[0]}</p>
  <p class="body reveal">${P.about.body[1]}</p>
  <ol class="method" role="list">
    ${P.process.map((s, i) => html`<li class="reveal reveal-d${i}"><span>${String(i + 1).padStart(2, "0")}</span><h3>${s.step}</h3><p>${s.text}</p></li>`)}
  </ol>
  <div class="figures reveal">${P.stats.map((s) => html`<div><b>${s.value}</b><span>${s.label}</span></div>`)}</div>
`)}

${part("services", "02", "Services", html`
  <div class="svc-list">
    ${P.services.map((s) => html`
    <details class="svc reveal">
      <summary><h3>${s.name}</h3><span>${s.short}</span></summary>
      <div class="svc-body"><div><p>${s.blurb}</p>${s.sample ? html`<a class="svc-sample" href="${s.sample.href}" target="_blank" rel="noopener">${s.sample.label} ↗</a>` : ""}</div><ul role="list">${s.points.map((p) => html`<li>${p}</li>`)}</ul></div>
    </details>`)}
  </div>
`, "alt")}

${part("coach", "03", "Coach", html`
  <div class="coach">
    <div class="coach-photo reveal"><span>Portrait</span></div>
    <div class="reveal">
      <p class="role">${c.role}</p>
      <h3 class="coach-name">${c.name}</h3>
      <p class="body">${c.bio}</p>
      <p class="creds">${c.credentials.join("  /  ")}</p>
    </div>
  </div>
`)}

${part("memberships", "04", "Membership", html`
  <p class="big reveal">${m.tagline}</p>
  <div class="tiers-top reveal"><p class="body">${m.heading}. ${m.includes}.</p>${price.durationToggle()}</div>
  <div class="tiers">
    ${m.plans.map((p) => html`
    <article class="tier ${p.featured ? "featured" : ""} reveal">
      <div class="tier-head">
        <h3>${p.name}${p.badge ? html` <em>${p.badge}</em>` : ""}</h3>
        <p>${p.perWeek} × ${price.durLabel()} session${p.perWeek > 1 ? "s" : ""} a week</p>
      </div>
      <ul role="list"><li>${price.live(price.perSession(p))} a session</li><li>${price.live(price.saving(p), "save")}</li></ul>
      <div class="tier-price"><b>${price.live(p.prices)}</b><span>per week</span><a href="#contact" data-enquire="${price.planInterest(p)}">${p.cta} →</a></div>
    </article>`)}
  </div>
  <p class="fine">${m.note} Savings are against a casual session of the same length.
    Already decided? <a class="signup" href="${m.signup.href}" target="_blank" rel="noopener">${m.signup.label} ↗</a></p>
  <h3 class="payg-title reveal">${m.payg.heading}</h3>
  <div class="extras reveal">
    <p><span>Casual session, ${price.durLabel()}</span><b>${price.live(m.payg.casual)}</b></p>
    <p><span>10-session pack, ${price.live(price.packEach())} a session</span><b>${price.live(m.payg.pack)}</b></p>
    <p><span>Evolt 360 scan on demand</span><b>${price.money(m.payg.scan)}</b></p>
  </div>
`, "alt")}

${part("timetable", "05", "Classes", html`
  <div class="tt reveal">
    ${t.rows.map(([time, name, days]) => html`
    <div class="tt-row"><time>${time}</time><b>${name}</b><span>${t.days.map((d, i) => html`<i class="${days.includes(i) ? "on" : ""}">${d[0]}</i>`)}</span></div>`)}
  </div>
  <p class="fine">${t.note}. Letters mark the days each class runs, Monday to Saturday.</p>
`)}

<section class="part gallery" id="gallery">
  <div class="wrap part-grid">
    <header class="part-label"><span>06</span><h2>Studio</h2></header>
    <p class="body reveal">A private training floor with room to move. Drag or scroll to look around.</p>
  </div>
  <div class="strip" data-gallery></div>
</section>

${part("stories", "07", "Members", html`
  <div class="quote-list">
    ${P.testimonials.map((q) => html`<figure class="reveal"><blockquote>${q.quote}</blockquote><figcaption>${q.name}, ${q.detail}</figcaption></figure>`)}
  </div>
`, "alt")}

${part("shop", "08", "Store", html`
  <p class="big reveal">${P.merch.blurb}</p>
  <div class="prods">
    ${P.merch.products.map((p, i) => html`
    <a class="prod reveal reveal-d${i}" href="${P.merch.shopUrl}" target="_blank" rel="noopener">
      <div><img src="${P.brand.logo}" alt=""></div><h3>${p.name}</h3><span>${p.price}</span>
    </a>`)}
  </div>
  <a class="btn btn-line reveal" href="${P.merch.shopUrl}" target="_blank" rel="noopener">${P.merch.shopLabel} ↗</a>
`)}

${part("faq", "09", "Questions", html`
  ${P.faq.map((f) => html`<details class="faq reveal"><summary>${f.q}</summary><p>${f.a}</p></details>`)}
`, "alt")}

<section class="visit" id="contact">
  <div class="visit-pulse">${pulse("loop")}</div>
  <div class="wrap">
    <p class="hero-kicker reveal">Visit</p>
    <h2 class="reveal">${P.contact.heading}</h2>
    <p class="hero-sub reveal">${P.contact.blurb}</p>
    <div class="visit-form reveal">${contactForm({ button: "btn btn-solid" })}</div>
    <div class="visit-grid reveal">
      <div><h3>Address</h3>${P.contact.address.map((l) => html`<p>${l}</p>`)}</div>
      <div><h3>Phone</h3><p>${P.contact.phone}</p></div>
      <div><h3>Hours</h3>${P.contact.hours.map(([d, h]) => html`<p>${d} <span>${h}</span></p>`)}</div>
      <div><h3>Follow</h3>${P.contact.social.map((s) => html`<p><a href="${s.href}">${s.label}</a></p>`)}</div>
    </div>
  </div>
</section>

<footer class="foot"><p>© <span data-year></span> ${P.brand.name}</p><p>${P.brand.tagline.join(" · ")}</p></footer>`;
  },

  galleryItem: (p, n, { html } = PPPT) =>
    html`<button class="strip-item" data-photo="${n}"><img src="${p.src}" alt="${p.caption}" loading="lazy" draggable="false"><span>${String(n + 1).padStart(2, "0")} — ${p.caption}</span></button>`,

  galleryEmpty: ({ html } = PPPT) =>
    html`<p class="body wrap">Photos coming soon.</p>`,

  onGallery: ({ hero }) => {
    const bg = PPPT.$("[data-hero-bg]");
    if (bg && hero.length) {
      bg.style.backgroundImage = `url("${hero[0].src}")`;
      bg.classList.add("has-photo");
    }
    // Drag-to-scroll on the strip for mouse users; a drag doesn't open the lightbox.
    const strip = PPPT.$(".strip");
    if (!strip) return;
    let x0 = 0, s0 = 0, moved = false, down = false;
    strip.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; x0 = e.clientX; s0 = strip.scrollLeft;
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      if (Math.abs(e.clientX - x0) > 4) { moved = true; strip.classList.add("dragging"); }
      strip.scrollLeft = s0 - (e.clientX - x0);
    });
    addEventListener("pointerup", () => { down = false; strip.classList.remove("dragging"); });
    strip.addEventListener("click", (e) => { if (moved) { e.stopImmediatePropagation(); moved = false; } }, true);
  },
});
