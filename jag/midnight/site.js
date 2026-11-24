/* Midnight: black and lime like the logo, condensed italic headings, photos
   edge to edge. A featured before/after with thumbnail pickers. */

JAG.boot({
  variant: "midnight",
  render: (G, { html, raw, src, pairSrc, phone, compare, quoteForm }) => {
    const B = G.brand, C = G.contact;
    const pad = (n) => String(n).padStart(2, "0");
    // A thin ribbon echoing the swoosh off the logo's G.
    const ribbon = (cls) => raw(`<svg class="ribbon ${cls}" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 96 C 260 96, 420 20, 700 34 S 1060 104, 1200 18" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M0 106 C 280 104, 440 34, 720 46 S 1070 112, 1200 32" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
    </svg>`);
    const [l1, l2] = B.tagline.split(". ");
    return html`
<header class="top" data-header>
  <div class="wrap top-in">
    <a class="brand" href="#top" aria-label="${B.full}, home"><img src="${src("logo/mark-dark.png")}" alt=""></a>
    <nav data-nav aria-label="Main">
      <a href="#services">Services</a><a href="#work">Our work</a><a href="#how">How it works</a><a href="#contact">Contact</a>
    </nav>
    <a class="call" href="tel:${phone()}"><span>Call</span> ${C.phone}</a>
    <a class="btn btn-sm" href="#contact">Free quote</a>
    <button class="menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span></button>
  </div>
</header>

<main id="top">
  <section class="hero">
    <img class="hero-bg" src="${src(G.photos[0].src)}" alt="">
    <div class="wrap hero-in">
      <img class="hero-logo reveal" src="${src("logo/logo-dark.png")}" alt="${B.full}">
      <h1 class="reveal reveal-d1"><span>${l1}.</span> <span class="hl">${l2}</span></h1>
      <p class="lede reveal reveal-d2">${B.blurb}</p>
      <div class="hero-cta reveal reveal-d3">
        <a class="btn" href="#contact">Get a free quote</a>
        <a class="btn btn-ghost" href="#work">See our work</a>
      </div>
    </div>
    ${ribbon("hero-ribbon")}
  </section>

  <section class="promises" aria-label="Why JAG">
    <div class="wrap grid">${G.promises.map((p, i) => html`<div class="reveal reveal-d${i}"><h3>${p.title}</h3><p>${p.text}</p></div>`)}</div>
  </section>

  <section id="services" class="services">
    <div class="wrap">
      <div class="head reveal"><p class="eyebrow">What we do</p><h2>Services</h2></div>
      <ul role="list" class="cards">${G.services.map((s, i) => html`<li class="card reveal reveal-d${i % 3}">
        <div class="card-img"><img src="${src(s.photo)}" alt="" loading="lazy"></div>
        <div class="card-body">
          <span class="n">${pad(i + 1)}</span>
          <h3>${s.name}</h3>
          <p>${s.text}</p>
          <a href="#contact" data-enquire="${s.name}">Ask about this <span aria-hidden="true">→</span></a>
        </div></li>`)}</ul>
    </div>
  </section>

  <section id="work" class="work">
    <div class="wrap">
      <div class="head reveal"><p class="eyebrow">Before &amp; after</p><h2>Our work</h2></div>
      <div class="feature reveal">
        <div data-stage>${compare(G.pairs[0], { cls: "wide" })}</div>
        <div class="feature-meta">
          <p class="count"><span data-n>01</span> / ${pad(G.pairs.length)}</p>
          <h3 data-title>${G.pairs[0].title}</h3>
          <p data-text>${G.pairs[0].text}</p>
          <p class="hint">Drag the handle to compare.</p>
        </div>
      </div>
      <div class="thumbs reveal" role="group" aria-label="Choose a job">${G.pairs.map((p, i) => html`<button type="button" data-pick="${i}" ${raw(i === 0 ? 'aria-current="true"' : "")} aria-label="${p.title}"><img src="${pairSrc(p, "after")}" alt="" loading="lazy"></button>`)}</div>
    </div>
  </section>

  <section id="how" class="how">
    <div class="wrap">
      <div class="head reveal"><p class="eyebrow">The process</p><h2>How it works</h2></div>
      <ol role="list">${G.steps.map((s, i) => html`<li class="reveal reveal-d${i % 4}"><span>${pad(i + 1)}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}</ol>
    </div>
  </section>

  <section class="gallery" aria-label="Finished jobs">
    <div class="grid">${G.photos.map((p, n) => html`<button type="button" data-photo="${n}" aria-label="Open photo: ${p.caption}"><img src="${src(p.src)}" alt="${p.caption}" loading="lazy"></button>`)}</div>
  </section>

  <section id="contact" class="contact">
    ${ribbon("contact-ribbon")}
    <div class="wrap contact-in">
      <div class="reveal">
        <p class="eyebrow">Free quote</p>
        <h2>Let's get your yard <span class="hl">sorted.</span></h2>
        <a class="big-call" href="tel:${phone()}">${C.phone}</a>
        <dl>
          <div><dt>Hours</dt><dd>${C.hours}</dd></div>
          <div><dt>Area</dt><dd>${B.area}</dd></div>
          <div><dt>Facebook</dt><dd><a href="${C.facebook}" target="_blank" rel="noopener">Message us ↗</a></dd></div>
        </dl>
      </div>
      <div class="reveal reveal-d1">${quoteForm()}</div>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <img src="${src("logo/mark-dark.png")}" alt="">
    <p>${B.full}</p>
    <p>© <span data-year></span> · ${B.area}</p>
  </div>
</footer>`;
  },
  afterRender: () => {
    const { $, $$, pairs } = JAG;
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pick]");
      if (!b) return;
      const i = +b.dataset.pick, p = pairs[i];
      JAG.setPair($("[data-stage] .ba"), p);
      $("[data-n]").textContent = String(i + 1).padStart(2, "0");
      $("[data-title]").textContent = p.title;
      $("[data-text]").textContent = p.text;
      $$("[data-pick]").forEach((t) => t.removeAttribute("aria-current"));
      b.setAttribute("aria-current", "true");
    });
  },
});
