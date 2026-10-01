/* Gym · Light — "Poster". Paper white, heavy black type, red blocks,
   thick borders and hard shadows. Loud, but in daylight. */

PPPT.boot({
  variant: "gym-light",

  specialButton: "btn btn-red",

  render: (P, { html, pulse, price, contactForm, special }) => {
    const nav = [["services", "Training"], ["memberships", "Pricing"], ["gallery", "Photos"], ["shop", "Merch"], ["contact", "Contact"]];
    const m = P.memberships;
    const marquee = Array(8).fill(html`<span>${P.brand.tagline.join(" ✦ ")} ✦</span>`);
    const words = P.hero.headlineGym.replace(/\.$/, "").split(" ");

    return html`
<header class="hdr" data-header>
  <a class="brand" href="#top"><img src="${P.brand.logo}" alt=""><b>PULSE</b></a>
  <nav class="hdr-nav" data-nav>${nav.map(([id, l]) => html`<a href="#${id}">${l}</a>`)}</nav>
  <a class="btn btn-black hdr-cta" href="#contact" data-enquire="Free consult">Book now</a>
  <button class="hdr-menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span><span></span></button>
</header>

<section class="hero" id="top">
  <div class="hero-copy">
    <p class="tag">${P.hero.kicker}</p>
    <h1>${words.map((w, i) => html`<span class="w w${i}">${w}</span>`)}</h1>
    <p class="hero-sub">${P.hero.sub}</p>
    <div class="ctas">
      <a class="btn btn-red btn-lg" href="${P.hero.primary.href}" data-enquire="Free consult">${P.hero.primary.label} →</a>
      <a class="btn btn-white btn-lg" href="${P.hero.secondary.href}">${P.hero.secondary.label}</a>
    </div>
  </div>
  <div class="hero-art" data-hero-bg>
    <div class="hero-pulse">${pulse("loop")}</div>
    <img class="sticker" src="${P.brand.logo}" alt="${P.brand.name}">
    <span class="burst">Scans included!</span>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div>${marquee}${marquee}</div></div>

<section class="stats">
  ${P.stats.map((s, i) => html`<div class="stat card reveal reveal-d${i}"><b>${s.value}</b><span>${s.label}</span></div>`)}
</section>

<section class="sec" id="services">
  <h2 class="title reveal"><span>What we do</span></h2>
  <div class="svc-grid">
    ${P.services.map((s, i) => html`
    <article class="svc card reveal reveal-d${i % 3}">
      <span class="svc-n">${String(i + 1).padStart(2, "0")}</span>
      <h3>${s.name}</h3>
      <p class="svc-short">${s.short}</p>
      <p>${s.blurb}</p>
      <ul role="list">${s.points.map((p) => html`<li>${p}</li>`)}</ul>
      ${s.sample ? html`<a class="btn btn-red svc-sample" href="${s.sample.href}" target="_blank" rel="noopener">${s.sample.label} ↗</a>` : ""}
    </article>`)}
    <a class="svc card svc-go reveal" href="#contact" data-enquire="Free consult"><h3>Try a free consult</h3><span>→</span></a>
  </div>
</section>

<section class="sec red" id="how">
  <h2 class="title reveal"><span>How it works</span></h2>
  <ol class="steps" role="list">
    ${P.process.map((s, i) => html`<li class="card reveal reveal-d${i}"><b>${i + 1}</b><h3>${s.step}</h3><p>${s.text}</p></li>`)}
  </ol>
</section>

<section class="sec" id="memberships">
  <h2 class="title reveal"><span>${m.tagline.split(". ")[0]}. ${m.tagline.split(". ")[1]}.</span></h2>
  <div class="plans-top reveal"><p class="plans-sub">${m.heading}. ${m.includes}.</p>${price.durationToggle("dur card")}</div>
  ${special.banner({ button: "btn btn-red" })}
  <div class="plans">
    ${m.plans.map((p, i) => html`
    <article class="plan card ${p.featured ? "hot" : ""} ${p.value ? "value" : ""} reveal reveal-d${i}">
      ${p.badge ? html`<span class="plan-badge">${p.badge}</span>` : ""}
      <p class="plan-freq">${p.perWeek}× weekly</p>
      <h3>${p.name}</h3>
      <p class="price">${price.live(p.prices)}<small>/wk</small></p>
      <p class="plan-blurb">${price.live(price.perSession(p))} a session</p>
      <p class="plan-save">${price.live(price.saving(p), "save")}</p>
      ${special.plan(p)}
      <ul role="list"><li>${p.perWeek} × ${price.durLabel()} session${p.perWeek > 1 ? "s" : ""} a week</li><li>${m.includes}</li></ul>
      <a class="btn ${p.featured ? "btn-black" : "btn-red"}" href="#contact" data-enquire="${price.planInterest(p)}">${p.cta}</a>
      ${price.buy(p.products, "Or sign up online")}
    </article>`)}
  </div>
  <div class="extras card reveal">
    <h3>${m.payg.heading}</h3>
    <p><span>Casual session (${price.durLabel()}) ${price.buy(m.payg.products.casual)}</span><b>${price.live(m.payg.casual)}</b></p>
    <p><span>10-session pack (${price.live(price.packEach())} each) ${price.buy(m.payg.products.pack)}</span><b>${price.live(m.payg.pack)}</b></p>
    <p><span>Evolt 360 scan on demand ${price.buy(m.payg.products.scan)}</span><b>${price.money(m.payg.scan)}</b></p>
  </div>
  <p class="fine">${m.note} Savings are against a casual session of the same length.
    Already decided? <a href="${m.signup.href}" target="_blank" rel="noopener">${m.signup.label} ↗</a></p>
</section>

<section class="sec yellow" id="gallery">
  <h2 class="title reveal"><span>The floor</span></h2>
  <div class="gal" data-gallery></div>
</section>

<section class="sec black">
  <h2 class="title reveal"><span>Real talk</span></h2>
  <div class="quotes">
    ${P.testimonials.map((q, i) => html`<figure class="quote card reveal reveal-d${i}"><blockquote>“${q.quote}”</blockquote><figcaption>${q.name} — ${q.detail}</figcaption></figure>`)}
  </div>
</section>

<section class="sec" id="shop">
  <h2 class="title reveal"><span>${P.merch.heading}</span></h2>
  <div class="prods">
    ${P.merch.products.map((p, i) => html`
    <a class="prod card reveal reveal-d${i}" href="${P.productUrl(p.product)}" target="_blank" rel="noopener">
      <div class="prod-img"><img src="${P.brand.logo}" alt=""></div>
      <div class="prod-info"><h3>${p.name}</h3><b>${p.price}</b></div>
    </a>`)}
  </div>
  <a class="btn btn-black btn-lg reveal" href="${P.store.home}" target="_blank" rel="noopener">${P.merch.shopLabel} ↗</a>
</section>

<section class="sec" id="faq">
  <h2 class="title reveal"><span>FAQ</span></h2>
  <div class="faqs">${P.faq.map((f) => html`<details class="card reveal"><summary>${f.q}</summary><p>${f.a}</p></details>`)}</div>
</section>

<section class="sec red contact" id="contact">
  <h2 class="huge reveal">Let's go.</h2>
  <p class="contact-blurb reveal">${P.contact.blurb}</p>
  <div class="contact-form card reveal">${contactForm({ button: "btn btn-black btn-lg" })}</div>
  <div class="info">
    <div class="card reveal"><h3>Where</h3>${P.contact.address.map((l) => html`<p>${l}</p>`)}</div>
    <div class="card reveal reveal-d1"><h3>Call</h3><p>${P.contact.phone}</p></div>
    <div class="card reveal reveal-d2"><h3>Hours</h3>${P.contact.hours.map(([d, h]) => html`<p><b>${d}</b> ${h}</p>`)}</div>
    <div class="card reveal reveal-d3"><h3>Follow</h3>${P.contact.social.map((s) => html`<p><a href="${s.href}">${s.label}</a></p>`)}</div>
  </div>
</section>

<footer class="foot">
  <img src="${P.brand.logo}" alt="">
  <p><b>${P.brand.name}</b><br>© <span data-year></span></p>
</footer>`;
  },

  galleryItem: (p, n, { html } = PPPT) =>
    html`<button class="gal-item card" data-photo="${n}"><img src="${p.src}" alt="${p.caption}" loading="lazy"><span>${p.caption}</span></button>`,

  galleryEmpty: ({ html } = PPPT) =>
    html`<p class="card" style="padding:24px">Photos coming soon!</p>`,

  onGallery: ({ hero }) => {
    const art = PPPT.$("[data-hero-bg]");
    if (art && hero.length) {
      art.style.backgroundImage = `url("${hero[0].src}")`;
      art.classList.add("has-photo");
    }
  },
});
