/* Velocity: the logo's italic slant as a system. Diagonal section edges,
   parallelogram buttons and photo masks, Kanit black italic headings. */

JAG.boot({
  variant: "velocity",
  render: (G, { html, src, phone, compare, quoteForm }) => {
    const B = G.brand, C = G.contact;
    const pad = (n) => String(n).padStart(2, "0");
    const ticker = G.services.map((s) => html`<span>${s.name}</span>`);
    const btn = (href, label, cls = "") => html`<a class="btn ${cls}" href="${href}"><span>${label}</span></a>`;
    return html`
<header class="top" data-header>
  <div class="wrap top-in">
    <a class="brand" href="#top" aria-label="${B.full}, home"><img src="${src("logo/mark-dark.png")}" alt=""></a>
    <nav data-nav aria-label="Main">
      <a href="#services">Services</a><a href="#work">Work</a><a href="#how">Process</a><a href="#contact">Contact</a>
    </nav>
    <a class="call" href="tel:${phone()}">${C.phone}</a>
    <button class="menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span></button>
  </div>
</header>

<main id="top">
  <section class="hero">
    <div class="wrap hero-in">
      <div class="hero-copy">
        <img class="hero-logo reveal" src="${src("logo/logo-dark.png")}" alt="${B.full}">
        <h1 class="reveal reveal-d1"><span>Sharp yards.</span> <span class="hl">Built to last.</span></h1>
        <p class="reveal reveal-d2">${B.blurb}</p>
        <div class="hero-cta reveal reveal-d3">
          ${btn("#contact", "Get a free quote")}
          ${btn("#work", "See the work", "btn-ghost")}
        </div>
      </div>
      <figure class="hero-photo reveal reveal-d2">
        <img src="${src(G.photos[0].src)}" alt="${G.photos[0].caption}">
      </figure>
    </div>
  </section>

  <div class="ticker-clip" aria-hidden="true"><div class="ticker"><div class="track">${ticker}${ticker}${ticker}${ticker}</div></div></div>

  <section id="services" class="services">
    <div class="wrap">
      <p class="label reveal">What we do</p>
      <h2 class="reveal">Services</h2>
      <ul role="list" class="svc-grid">${G.services.map((s, i) => html`<li class="svc reveal reveal-d${i % 3}">
        <div class="svc-img"><img src="${src(s.photo)}" alt="" loading="lazy"></div>
        <div class="svc-body">
          <span class="n">${pad(i + 1)}</span>
          <h3>${s.name}</h3>
          <p>${s.text}</p>
          <a class="more" href="#contact" data-enquire="${s.name}">Ask about this <span aria-hidden="true">→</span></a>
        </div></li>`)}</ul>
    </div>
  </section>

  <section id="work" class="work">
    <div class="wrap">
      <p class="label reveal">Before and after</p>
      <h2 class="reveal">The work</h2>
      <div class="viewer reveal">
        <div class="stage" data-stage>${compare(G.pairs[0], { cls: "wide" })}</div>
        <div class="meta">
          <p class="count"><span data-n>01</span><small>/ ${pad(G.pairs.length)}</small></p>
          <h3 data-title>${G.pairs[0].title}</h3>
          <p data-text>${G.pairs[0].text}</p>
          <p class="hint">Drag the handle to compare.</p>
          <div class="steps">
            <button type="button" data-step="-1" aria-label="Previous job"><span>←</span></button>
            <button type="button" data-step="1" aria-label="Next job"><span>→</span></button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="promises">
    <div class="wrap grid">${G.promises.map((p, i) => html`<div class="promise reveal reveal-d${i}"><span class="tick" aria-hidden="true"></span><h3>${p.title}</h3><p>${p.text}</p></div>`)}</div>
  </section>

  <section id="how" class="how">
    <div class="wrap">
      <p class="label reveal">How it works</p>
      <h2 class="reveal">Four steps</h2>
      <ol role="list">${G.steps.map((s, i) => html`<li class="reveal reveal-d${i % 4}"><span class="num">${pad(i + 1)}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}</ol>
    </div>
  </section>

  <section class="gallery" aria-label="Finished jobs">
    <div class="wrap">
      <p class="label reveal">Finished jobs</p>
      <div class="g-grid">${G.photos.map((p, n) => html`<button class="reveal" data-photo="${n}" aria-label="Open photo: ${p.caption}"><img src="${src(p.src)}" alt="${p.caption}" loading="lazy"></button>`)}</div>
    </div>
  </section>

  <section id="contact" class="contact">
    <div class="wrap contact-in">
      <div class="reveal">
        <p class="label">Free quote</p>
        <h2>Let's get your yard sorted.</h2>
        <a class="big-call" href="tel:${phone()}">${C.phone}</a>
        <p class="c-meta">${C.hours} · ${B.area}</p>
        <p class="c-meta"><a href="${C.facebook}" target="_blank" rel="noopener">Message us on Facebook ↗</a></p>
      </div>
      <div class="reveal reveal-d1">${quoteForm({ button: "btn btn-submit" })}</div>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <img src="${src("logo/logo-dark.png")}" alt="${B.full}">
    <p>${B.full} · ${B.area}</p>
    <p>© <span data-year></span></p>
  </div>
</footer>`;
  },
  afterRender: () => {
    const { $, pairs } = JAG;
    const pad = (n) => String(n).padStart(2, "0");
    let i = 0;
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-step]");
      if (!b) return;
      i = (i + +b.dataset.step + pairs.length) % pairs.length;
      const p = pairs[i];
      JAG.setPair($("[data-stage] .ba"), p);
      $("[data-n]").textContent = pad(i + 1);
      $("[data-title]").textContent = p.title;
      $("[data-text]").textContent = p.text;
    });
  },
});
