/* Clean: white space, one typeface, hairlines. The hero leads with a
   before and after so the work sells itself. */

GG.boot({
  variant: "clean",
  render: (G, { html, src, phone, compare, quoteForm }) => {
    const B = G.brand, C = G.contact;
    const shown = 6;
    return html`
<header class="top" data-header>
  <div class="wrap top-in">
    <a class="brand" href="#top"><img src="${src("logo-olive.png")}" alt=""><span>${B.name}<small>${B.trade}</small></span></a>
    <nav data-nav aria-label="Main">
      <a href="#work">Our work</a><a href="#services">Services</a><a href="#process">How it works</a><a href="#contact">Contact</a>
    </nav>
    <a class="btn btn-sm" href="#contact">Free quote</a>
    <button class="menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span></button>
  </div>
</header>

<main id="top">
  <section class="hero wrap">
    <div class="hero-copy reveal">
      <p class="eyebrow">Garden maintenance and landscaping · ${B.area}</p>
      <h1>${B.tagline}</h1>
      <p class="lede">${B.blurb}</p>
      <div class="actions">
        <a class="btn" href="#contact">Get a free quote</a>
        <a class="link" href="tel:${phone()}">or call ${C.phone}</a>
      </div>
    </div>
    <div class="hero-ba reveal reveal-d1">
      ${compare(G.pairs[0], { start: 55 })}
      <p class="hint">Drag to compare · ${G.pairs[0].title}</p>
    </div>
  </section>

  <section class="promises wrap" aria-label="Why us">
    <ul role="list">${G.promises.map((p, i) => html`<li class="reveal reveal-d${i}"><h3>${p.title}</h3><p>${p.text}</p></li>`)}</ul>
  </section>

  <section id="work" class="work wrap">
    <div class="head reveal"><h2>Before and after</h2><p>Real jobs, straight from the phone. Drag the handle on any photo.</p></div>
    <div class="ba-grid">
      ${G.pairs.slice(1).map((p, i) => html`<article class="reveal${i >= shown ? " more" : ""}"${i >= shown ? html` hidden` : ""}>
        ${compare(p)}<h3>${p.title}</h3><p>${p.text}</p></article>`)}
    </div>
    <p class="center"><button class="btn btn-ghost" data-more>Show ${G.pairs.length - 1 - shown} more jobs</button></p>
  </section>

  <section id="services" class="services wrap">
    <div class="head reveal"><h2>What we do</h2></div>
    <ul role="list">${G.services.map((s) => html`<li class="reveal"><h3>${s.name}</h3><p>${s.text}</p>
      <a href="#contact" data-enquire="${s.name}">Ask about this →</a></li>`)}</ul>
  </section>

  <section id="process" class="process">
    <div class="wrap">
      <div class="head reveal"><h2>How it works</h2></div>
      <ol role="list">${G.steps.map((s, i) => html`<li class="reveal reveal-d${i % 4}"><span>${i + 1}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}</ol>
    </div>
  </section>

  <section class="gallery wrap" aria-label="Finished jobs">
    <div class="head reveal"><h2>Finished jobs</h2></div>
    <div class="grid">${G.photos.map((p, n) => html`<button class="reveal" data-photo="${n}"><img src="${src(p.src)}" alt="${p.caption}" loading="lazy"></button>`)}</div>
  </section>

  <section id="contact" class="contact wrap">
    <div class="reveal">
      <h2>Get a free quote</h2>
      <p class="lede">Tell us a bit about the yard and we'll come out, have a look and give you a fixed price.</p>
      <dl>
        <dt>Phone</dt><dd><a href="tel:${phone()}">${C.phone}</a></dd>
        <dt>Hours</dt><dd>${C.hours}</dd>
        <dt>Area</dt><dd>${B.area}</dd>
        <dt>Facebook</dt><dd><a href="${C.facebook}" target="_blank" rel="noopener">Message us ↗</a></dd>
      </dl>
    </div>
    <div class="reveal reveal-d1">${quoteForm()}</div>
  </section>
</main>

<footer class="foot wrap">
  <img src="${src("logo-olive.png")}" alt="">
  <p>© <span data-year></span> ${B.name} ${B.trade} · ${B.area}</p>
</footer>`;
  },
  afterRender: () => {
    GG.$("[data-more]")?.addEventListener("click", (e) => {
      GG.$$(".ba-grid .more").forEach((el) => { el.hidden = false; el.classList.add("in"); });
      e.target.remove();
    });
  },
});
