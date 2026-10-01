/* Gym · Dark — "Redline". Loud, black and red, condensed caps. */

PPPT.boot({
  variant: "gym-dark",

  specialButton: "btn btn-red",

  render: (P, { html, raw, pulse, price, contactForm, special }) => {
    const nav = [["services", "Train"], ["memberships", "Pricing"], ["gallery", "Gallery"], ["shop", "Shop"], ["contact", "Contact"]];
    // "Train more. Save more. Get better results." split into its three lines.
    const tag = P.memberships.tagline.replace(/\.$/, "").split(". ");
    const ticker = Array(6).fill(P.brand.tagline.map((t) => html`<span>${t}</span><i>✚</i>`));
    const m = P.memberships;

    return html`
<header class="hdr" data-header>
  <a class="hdr-brand" href="#top"><img src="${P.brand.logo}" alt=""><span>${P.brand.name}</span></a>
  <nav class="hdr-nav" data-nav>${nav.map(([id, l]) => html`<a href="#${id}">${l}</a>`)}</nav>
  <a class="btn btn-red hdr-cta" href="${P.hero.primary.href}" data-enquire="Free consult">Free consult</a>
  <button class="hdr-menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span><span></span></button>
</header>

<section class="hero" id="top">
  <div class="hero-bg" data-hero-bg></div>
  <div class="hero-inner">
    <p class="kicker">${P.hero.kicker}</p>
    <h1 class="hero-title">
      <span class="hero-lead">${P.hero.headlineGym.split(" ").slice(0, -1).join(" ")}</span>
      <span class="mega" data-fit><span>${P.hero.headlineGym.split(" ").slice(-1)[0].replace(/\.$/, "")}</span>${pulse()}</span>
    </h1>
    <div class="hero-bottom">
      <p class="hero-sub">${P.hero.sub}</p>
      <div class="hero-ctas">
        <a class="btn btn-red btn-lg" href="${P.hero.primary.href}" data-enquire="Free consult">${P.hero.primary.label}</a>
        <a class="btn btn-ghost btn-lg" href="${P.hero.secondary.href}">${P.hero.secondary.label}</a>
      </div>
    </div>
  </div>
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
  <div class="plans-head reveal">
    <div>
      <p class="eyebrow">${m.heading}</p>
      <h2 class="display section-title">${tag[0]}. <em>${tag[1]}.</em></h2>
      <p class="plans-sub">${tag.slice(2).join(". ")}.</p>
    </div>
    ${price.durationToggle()}
  </div>
  ${special.banner({ button: "btn btn-red" })}
  <div class="plan-grid">
    ${m.plans.map((p, i) => html`
    <article class="plan ${p.featured ? "plan-hot" : ""} ${p.value ? "plan-value" : ""} reveal reveal-d${i}">
      ${p.badge ? html`<span class="plan-badge">${p.badge}</span>` : ""}
      <p class="plan-freq">${p.perWeek}× weekly</p>
      <h3>${p.name}</h3>
      <p class="plan-price">${price.live(p.prices)}<small>/wk</small></p>
      <p class="plan-each">${price.live(price.perSession(p))} a session</p>
      <p class="plan-save">${price.live(price.saving(p), "save")}</p>
      ${special.plan(p)}
      <ul role="list">
        <li>${p.perWeek} × ${price.durLabel()} session${p.perWeek > 1 ? "s" : ""} a week</li>
        <li>${m.includes}</li>
      </ul>
      <a class="btn ${p.featured ? "btn-white" : "btn-red"}" href="#contact" data-enquire="${price.planInterest(p)}">${p.cta}</a>
      ${price.buy(p.products, "Or sign up online")}
    </article>`)}
  </div>
  <p class="fine">${m.note} Savings are against a casual session of the same length.
    Already decided? <a class="signup" href="${m.signup.href}" target="_blank" rel="noopener">${m.signup.label} ↗</a></p>
  <div class="payg reveal">
    <div class="payg-head"><h3>${m.payg.heading}</h3><p>${m.payg.blurb}</p></div>
    <div class="payg-item"><span>Casual session</span><b>${price.live(m.payg.casual)}</b><small>One ${price.durLabel()} session</small>${price.buy(m.payg.products.casual)}</div>
    <div class="payg-item"><span>10-session pack</span><b>${price.live(m.payg.pack)}</b><small>${price.live(price.packEach())} a session</small>${price.buy(m.payg.products.pack)}</div>
    <div class="payg-item"><span>Evolt 360 scan</span><b>${price.money(m.payg.scan)}</b><small>On demand, with written report</small>${price.buy(m.payg.products.scan)}</div>
  </div>
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
    <a class="prod reveal reveal-d${i}" href="${P.productUrl(p.product)}" target="_blank" rel="noopener">
      <div class="prod-img"><img src="${P.brand.logo}" alt=""><span>${p.tag}</span></div>
      <h3>${p.name}</h3><b>${p.price}</b>
    </a>`)}
  </div>
  <a class="btn btn-red btn-lg reveal" href="${P.store.home}" target="_blank" rel="noopener">${P.merch.shopLabel} ↗</a>
</section>

<section class="faq" id="faq">
  <h2 class="display section-title reveal">Got <em>questions?</em></h2>
  ${P.faq.map((f) => html`<details class="reveal"><summary>${f.q}</summary><p>${f.a}</p></details>`)}
</section>

<section class="contact" id="contact">
  <div class="contact-line">${pulse("loop")}</div>
  <h2 class="display contact-title reveal">Ready?</h2>
  <p class="contact-blurb reveal">${P.contact.blurb}</p>
  <div class="contact-form reveal">${contactForm({ button: "btn btn-red btn-lg" })}</div>
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

  // Size "PULSE" to span the full width, capped so the intro and buttons
  // stay above the fold on short screens.
  afterRender: () => {
    const el = PPPT.$("[data-fit]");
    const inner = PPPT.$(".hero-inner");
    const fit = () => {
      const word = el.querySelector("span");
      el.style.fontSize = "100px";
      const byWidth = 100 * el.clientWidth / word.scrollWidth * 0.98;
      const rest = inner.offsetHeight - el.offsetHeight;
      const byHeight = (innerHeight - rest - 190) / parseFloat(getComputedStyle(el).lineHeight) * 100;
      el.style.fontSize = Math.max(64, Math.floor(Math.min(byWidth, byHeight))) + "px";
    };
    fit();
    document.fonts?.ready.then(fit);
    addEventListener("resize", fit);
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
