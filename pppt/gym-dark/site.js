/* Gym · Dark — "Redline". Loud, black and red, condensed caps. */

PPPT.boot({
  variant: "gym-dark",

  render: (P, { html, raw, pulse }) => {
    const nav = [["services", "Train"], ["memberships", "Join"], ["timetable", "Classes"], ["gallery", "Gallery"], ["shop", "Shop"], ["contact", "Contact"]];
    const ticker = Array(6).fill(P.brand.tagline.map((t) => html`<span>${t}</span><i>✚</i>`));
    const m = P.memberships;
    const t = P.timetable;

    return html`
<header class="hdr" data-header>
  <a class="hdr-brand" href="#top"><img src="${P.brand.logo}" alt=""><span>${P.brand.name}</span></a>
  <nav class="hdr-nav" data-nav>${nav.map(([id, l]) => html`<a href="#${id}">${l}</a>`)}</nav>
  <a class="btn btn-red hdr-cta" href="${P.hero.primary.href}">Free consult</a>
  <button class="hdr-menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span><span></span></button>
</header>

<section class="hero" id="top">
  <div class="hero-bg" data-hero-bg></div>
  <div class="hero-line">${pulse()}</div>
  <div class="hero-inner">
    <p class="kicker">${P.hero.kicker}</p>
    <h1 class="hero-title"><span>${P.hero.headlineGym.split(" ").slice(0, -1).join(" ")}</span> <em>${P.hero.headlineGym.split(" ").slice(-1)}</em></h1>
    <p class="hero-sub">${P.hero.sub}</p>
    <div class="hero-ctas">
      <a class="btn btn-red btn-lg" href="${P.hero.primary.href}">${P.hero.primary.label}</a>
      <a class="btn btn-ghost btn-lg" href="${P.hero.secondary.href}">${P.hero.secondary.label}</a>
    </div>
  </div>
  <a class="scroll-cue" href="#stats" aria-label="Scroll down"><span></span></a>
  <div class="ticker" aria-hidden="true"><div>${ticker}${ticker}</div></div>
</section>

<section class="stats" id="stats">
  ${P.stats.map((s, i) => html`<div class="stat reveal reveal-d${i}"><b>${s.value}</b><span>${s.label}</span></div>`)}
</section>

<section class="about" id="about">
  <div class="about-text reveal">
    <p class="eyebrow">The Pulse method</p>
    <h2 class="display">${P.about.heading}</h2>
    ${P.about.body.map((p) => html`<p>${p}</p>`)}
  </div>
  <div class="process">
    ${P.process.map((s, i) => html`<div class="step reveal reveal-d${i}"><span class="step-n">0${i + 1}</span><h3>${s.step}</h3><p>${s.text}</p></div>`)}
  </div>
</section>

<section class="services" id="services">
  <h2 class="display section-title reveal">What we <em>do</em></h2>
  <div class="svc-list">
    ${P.services.map((s, i) => html`
    <article class="svc reveal">
      <span class="svc-n">0${i + 1}</span>
      <div class="svc-head"><h3>${s.name}</h3><span class="svc-tag">${s.short}</span></div>
      <div class="svc-body"><p>${s.blurb}</p><ul role="list">${s.points.map((p) => html`<li>${p}</li>`)}</ul>
        ${s.sample ? html`<a class="svc-sample" href="${s.sample.href}" target="_blank" rel="noopener">${s.sample.label} ↗</a>` : ""}</div>
    </article>`)}
  </div>
</section>

<section class="plans" id="memberships">
  <h2 class="display section-title reveal">Pick your <em>plan</em></h2>
  <div class="plan-grid">
    ${m.plans.map((p, i) => html`
    <article class="plan ${p.featured ? "plan-hot" : ""} reveal reveal-d${i}">
      ${p.badge ? html`<span class="plan-badge">${p.badge}</span>` : ""}
      <h3>${p.name}</h3>
      <p class="plan-price"><sup>$</sup>${p.price}<small>/${p.per}</small></p>
      <p class="plan-blurb">${p.blurb}</p>
      <ul role="list">${p.features.map((f) => html`<li>${f}</li>`)}</ul>
      <a class="btn ${p.featured ? "btn-white" : "btn-red"}" href="#contact">${p.cta}</a>
    </article>`)}
  </div>
  <div class="extras reveal">
    ${m.extras.map((x) => html`<div><span>${x.name}</span><b>${x.price}</b></div>`)}
  </div>
  <p class="fine">${m.note}</p>
</section>

<section class="timetable" id="timetable">
  <h2 class="display section-title reveal">Class <em>times</em></h2>
  <div class="tt-wrap reveal">
    <table class="tt">
      <thead><tr><th></th>${t.days.map((d) => html`<th>${d}</th>`)}</tr></thead>
      <tbody>${t.rows.map(([time, name, days]) => html`<tr><th>${time}</th>${t.days.map((_, d) => days.includes(d) ? html`<td><span>${name}</span></td>` : html`<td></td>`)}</tr>`)}</tbody>
    </table>
  </div>
  <p class="fine">${t.note}</p>
</section>

<section class="gallery" id="gallery">
  <h2 class="display section-title reveal">Inside <em>Pulse</em></h2>
  <div class="gal" data-gallery></div>
</section>

<section class="quotes">
  ${P.testimonials.map((q, i) => html`<blockquote class="reveal reveal-d${i}"><p>${q.quote}</p><footer>${q.name} · ${q.detail}</footer></blockquote>`)}
</section>

<section class="shop" id="shop">
  <div class="shop-head reveal">
    <h2 class="display section-title">${P.merch.heading.split(" ").slice(0, -1).join(" ")} <em>${P.merch.heading.split(" ").slice(-1)}</em></h2>
    <p>${P.merch.blurb}</p>
  </div>
  <div class="prod-grid">
    ${P.merch.products.map((p, i) => html`
    <a class="prod reveal reveal-d${i}" href="${P.merch.shopUrl}" target="_blank" rel="noopener">
      <div class="prod-img"><img src="${P.brand.logo}" alt=""><span>${p.tag}</span></div>
      <h3>${p.name}</h3><b>${p.price}</b>
    </a>`)}
  </div>
  <a class="btn btn-red btn-lg reveal" href="${P.merch.shopUrl}" target="_blank" rel="noopener">${P.merch.shopLabel} ↗</a>
</section>

<section class="faq" id="faq">
  <h2 class="display section-title reveal">Got <em>questions?</em></h2>
  ${P.faq.map((f) => html`<details class="reveal"><summary>${f.q}</summary><p>${f.a}</p></details>`)}
</section>

<section class="contact" id="contact">
  <div class="contact-line">${pulse("loop")}</div>
  <h2 class="display contact-title reveal">Ready?</h2>
  <p class="contact-blurb reveal">${P.contact.blurb}</p>
  <a class="btn btn-red btn-xl reveal" href="${P.contact.bookingUrl}">${P.hero.primary.label}</a>
  <div class="contact-grid reveal">
    <div><h3>Find us</h3>${P.contact.address.map((l) => html`<p>${l}</p>`)}</div>
    <div><h3>Call</h3><p>${P.contact.phone}</p></div>
    <div><h3>Hours</h3>${P.contact.hours.map(([d, h]) => html`<p><span>${d}</span> ${h}</p>`)}</div>
    <div><h3>Follow</h3>${P.contact.social.map((s) => html`<p><a href="${s.href}">${s.label}</a></p>`)}</div>
  </div>
</section>

<footer class="foot">
  <img src="${P.brand.logo}" alt="${P.brand.name}">
  <p>${P.brand.tagline.join(" · ")}</p>
  <p class="fine">© <span data-year></span> ${P.brand.name}</p>
</footer>`;
  },

  galleryItem: (p, n, { html } = PPPT) =>
    html`<button class="gal-item reveal in" data-photo="${n}"><img src="${p.src}" alt="${p.caption}" loading="lazy"><span>${p.caption}</span></button>`,

  galleryEmpty: ({ html } = PPPT) =>
    html`<p class="gal-empty">Photos coming soon. Add images to the gallery folder.</p>`,

  onGallery: ({ hero }) => {
    const bg = PPPT.$("[data-hero-bg]");
    if (bg && hero.length) {
      bg.style.backgroundImage = `url("${hero[0].src}")`;
      bg.classList.add("has-photo");
    }
  },
});
