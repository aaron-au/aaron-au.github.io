/* Formal · Light — "Clinic". Calm, white, serif headings, red used
   sparingly. Reads like a physio or professional-services practice. */

PPPT.boot({
  variant: "formal-light",

  render: (P, { html, pulse, price, contactForm }) => {
    const nav = [["services", "Services"], ["approach", "Approach"], ["memberships", "Memberships"], ["timetable", "Timetable"], ["gallery", "Studio"], ["contact", "Contact"]];
    const m = P.memberships;
    const t = P.timetable;
    const c = P.about.coach;
    // Mini "scan report" card in the hero: a nod to the Evolt reports.
    const scan = [["Skeletal muscle", "+1.8 kg", 72, "up"], ["Body fat", "−3.4 kg", 38, "down"], ["Visceral fat", "−2 levels", 30, "down"], ["Waist", "−5.1 cm", 44, "down"]];

    return html`
<header class="hdr" data-header>
  <div class="wrap hdr-row">
    <a class="brand" href="#top"><img src="${P.brand.logo}" alt=""><span><b>Pulse</b> Performance PT</span></a>
    <nav class="hdr-nav" data-nav>${nav.map(([id, l]) => html`<a href="#${id}">${l}</a>`)}</nav>
    <a class="btn btn-outline hdr-cta" href="#contact" data-enquire="Free consult">Book a consultation</a>
    <button class="hdr-menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span><span></span></button>
  </div>
</header>

<section class="hero" id="top">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${P.hero.kicker}</p>
      <h1>Train with <em>purpose</em>.</h1>
      <p class="lede">${P.hero.sub}</p>
      <div class="ctas">
        <a class="btn btn-red" href="${P.hero.primary.href}" data-enquire="Free consult">${P.hero.primary.label}</a>
        <a class="link-arrow" href="${P.hero.secondary.href}">${P.hero.secondary.label} →</a>
      </div>
      <ul class="hero-points" role="list">
        <li>1:1 personal training</li><li>30, 45 or 60 minutes</li><li>Evolt 360 scans included</li>
      </ul>
    </div>
    <div class="hero-visual" data-hero-bg>
      <div class="scan-card">
        <div class="scan-head"><img src="${P.brand.logo}" alt=""><div><b>Progress review</b><span>Week 12 vs baseline</span></div></div>
        <div class="scan-pulse">${pulse()}</div>
        ${scan.map(([k, v, w, dir]) => html`
        <div class="scan-row"><span>${k}</span><b class="${dir}">${v}</b><i style="--w:${w}%"></i></div>`)}
        <p class="scan-note">Illustrative example</p>
      </div>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap stats">
    ${P.stats.map((s) => html`<div class="reveal"><b>${s.value}</b><span>${s.label}</span></div>`)}
  </div>
</section>

<section class="section" id="services">
  <div class="wrap">
    <div class="head reveal"><p class="eyebrow">Services</p><h2>How we can help</h2></div>
    <div class="svc-grid">
      ${P.services.map((s, i) => html`
      <article class="svc reveal reveal-d${i % 3}">
        <span class="svc-n">${String(i + 1).padStart(2, "0")}</span>
        <h3>${s.name}</h3>
        <p class="svc-short">${s.short}</p>
        <p>${s.blurb}</p>
        <ul role="list">${s.points.map((p) => html`<li>${p}</li>`)}</ul>
        ${s.sample ? html`<a class="link-arrow svc-sample" href="${s.sample.href}" target="_blank" rel="noopener">${s.sample.label} ↗</a>` : ""}
      </article>`)}
      <article class="svc svc-cta reveal">
        <h3>Not sure where to start?</h3>
        <p>Book a free consultation and we'll recommend the right mix for your goals.</p>
        <a class="link-arrow" href="#contact" data-enquire="Free consult">Talk to a coach →</a>
      </article>
    </div>
  </div>
</section>

<section class="section alt" id="approach">
  <div class="wrap approach">
    <div class="reveal">
      <p class="eyebrow">Our approach</p>
      <h2>${P.about.heading}</h2>
      ${P.about.body.map((p) => html`<p class="body">${p}</p>`)}
    </div>
    <ol class="steps" role="list">
      ${P.process.map((s, i) => html`<li class="reveal reveal-d${i}"><span>${i + 1}</span><div><h3>${s.step}</h3><p>${s.text}</p></div></li>`)}
    </ol>
  </div>
</section>

<section class="section" id="coach">
  <div class="wrap coach">
    <div class="coach-photo reveal"><img src="${P.brand.logo}" alt=""><span>Coach portrait</span></div>
    <div class="reveal">
      <p class="eyebrow">${c.role}</p>
      <h2>${c.name}</h2>
      <p class="body">${c.bio}</p>
      <ul class="creds" role="list">${c.credentials.map((x) => html`<li>${x}</li>`)}</ul>
    </div>
  </div>
</section>

<section class="section alt" id="memberships">
  <div class="wrap">
    <div class="head center reveal"><p class="eyebrow">${m.heading}</p><h2>${m.tagline}</h2><p class="body">${m.note}</p></div>
    <div class="dur-wrap reveal"><span>Session length</span>${price.durationToggle()}</div>
    <div class="plans">
      ${m.plans.map((p, i) => html`
      <article class="plan ${p.featured ? "featured" : ""} ${p.value ? "value" : ""} reveal reveal-d${i}">
        ${p.badge ? html`<span class="badge">${p.badge}</span>` : ""}
        <p class="plan-freq">${p.perWeek}× weekly</p>
        <h3>${p.name}</h3>
        <p class="price"><b>${price.live(p.prices)}</b> per week</p>
        <p class="plan-each">${price.live(price.perSession(p))} a session · <em>${price.live(price.saving(p), "save")}</em></p>
        <ul role="list">
          <li>${p.perWeek} × ${price.durLabel()} session${p.perWeek > 1 ? "s" : ""} a week</li>
          <li>${m.includes}</li>
        </ul>
        <a class="btn ${p.featured ? "btn-red" : "btn-outline"}" href="#contact" data-enquire="${price.planInterest(p)}">${p.cta}</a>
      </article>`)}
    </div>
    <p class="plans-note reveal">Savings are against a casual session of the same length. Already decided? <a class="link-arrow" href="${m.signup.href}" target="_blank" rel="noopener">${m.signup.label} ↗</a></p>
    <table class="extras reveal">
      <caption>${m.payg.heading}: ${m.payg.blurb}</caption>
      <tr><th>Casual session (${price.durLabel()})</th><td>${price.live(m.payg.casual)}</td></tr>
      <tr><th>10-session pack (${price.live(price.packEach())} a session)</th><td>${price.live(m.payg.pack)}</td></tr>
      <tr><th>Evolt 360 scan on demand, with written report</th><td>${price.money(m.payg.scan)}</td></tr>
    </table>
  </div>
</section>

<section class="section" id="timetable">
  <div class="wrap">
    <div class="head reveal"><p class="eyebrow">Timetable</p><h2>Small group classes</h2><p class="body">${t.note}. Classes are capped at eight.</p></div>
    <div class="days reveal">
      ${t.days.map((d, di) => html`
      <div class="day"><h3>${d}</h3>
        ${t.rows.filter((r) => r[2].includes(di)).map(([time, name]) => html`<p><time>${time}</time>${name}</p>`)}
      </div>`)}
    </div>
  </div>
</section>

<section class="section alt" id="gallery">
  <div class="wrap">
    <div class="head reveal"><p class="eyebrow">The studio</p><h2>Take a look inside</h2></div>
    <div class="gal" data-gallery></div>
  </div>
</section>

<section class="section" id="stories">
  <div class="wrap">
    <div class="head reveal"><p class="eyebrow">Member stories</p><h2>In their words</h2></div>
    <div class="quotes">
      ${P.testimonials.map((q, i) => html`<figure class="reveal reveal-d${i}"><blockquote>${q.quote}</blockquote><figcaption><b>${q.name}</b> ${q.detail}</figcaption></figure>`)}
    </div>
  </div>
</section>

<section class="section alt" id="shop">
  <div class="wrap shop">
    <div class="reveal">
      <p class="eyebrow">Shop</p>
      <h2>${P.merch.heading}</h2>
      <p class="body">${P.merch.blurb}</p>
      <a class="btn btn-outline" href="${P.merch.shopUrl}" target="_blank" rel="noopener">${P.merch.shopLabel} ↗</a>
    </div>
    <div class="prods">
      ${P.merch.products.map((p, i) => html`
      <a class="prod reveal reveal-d${i}" href="${P.merch.shopUrl}" target="_blank" rel="noopener">
        <div><img src="${P.brand.logo}" alt=""></div><h3>${p.name}</h3><span>${p.price}</span>
      </a>`)}
    </div>
  </div>
</section>

<section class="section" id="faq">
  <div class="wrap faq">
    <div class="reveal"><p class="eyebrow">FAQ</p><h2>Common questions</h2></div>
    <div>${P.faq.map((f) => html`<details class="reveal"><summary>${f.q}</summary><p>${f.a}</p></details>`)}</div>
  </div>
</section>

<section class="section contact" id="contact">
  <div class="wrap contact-grid">
    <div class="reveal">
      <p class="eyebrow">Contact</p>
      <h2>${P.contact.heading}</h2>
      <p class="body">${P.contact.blurb}</p>
      ${contactForm({ button: "btn btn-red" })}
    </div>
    <dl class="details reveal">
      <div><dt>Address</dt>${P.contact.address.map((l) => html`<dd>${l}</dd>`)}</div>
      <div><dt>Phone</dt><dd>${P.contact.phone}</dd></div>
      <div><dt>Opening hours</dt>${P.contact.hours.map(([d, h]) => html`<dd><span>${d}</span>${h}</dd>`)}</div>
      <div><dt>Social</dt>${P.contact.social.map((s) => html`<dd><a href="${s.href}">${s.label}</a></dd>`)}</div>
    </dl>
  </div>
</section>

<footer class="foot">
  <div class="wrap foot-row">
    <a class="brand" href="#top"><img src="${P.brand.logo}" alt=""><span><b>Pulse</b> Performance PT</span></a>
    <p>${P.brand.tagline.join(" · ")}</p>
    <p>© <span data-year></span> ${P.brand.name}</p>
  </div>
</footer>`;
  },

  galleryItem: (p, n, { html } = PPPT) =>
    html`<button class="gal-item" data-photo="${n}"><img src="${p.src}" alt="${p.caption}" loading="lazy"><span>${p.caption}</span></button>`,

  galleryEmpty: ({ html } = PPPT) =>
    html`<p class="body">Photos coming soon.</p>`,

  onGallery: ({ hero }) => {
    const el = PPPT.$("[data-hero-bg]");
    if (el && hero.length) {
      el.style.backgroundImage = `url("${hero[0].src}")`;
      el.classList.add("has-photo");
    }
  },
});
