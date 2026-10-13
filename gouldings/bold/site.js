/* Bold: giant uppercase type, hard blocks of olive, black and cream, one
   bright accent. Before and afters are full-width, one job at a time. */

GG.boot({
  variant: "bold",
  render: (G, { html, src, phone, compare, quoteForm }) => {
    const B = G.brand, C = G.contact;
    const pad = (n) => String(n).padStart(2, "0");
    const ticker = G.services.map((s) => html`<span>${s.name}</span>`);
    return html`
<header class="top" data-header>
  <div class="wrap top-in">
    <a class="brand" href="#top"><img src="${src("logo-cream.png")}" alt=""><span>${B.name} ${B.trade}</span></a>
    <nav data-nav aria-label="Main">
      <a href="#proof">Work</a><a href="#services">Services</a><a href="#how">Process</a><a href="#contact">Quote</a>
    </nav>
    <a class="call" href="tel:${phone()}">${C.phone}</a>
    <button class="menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span></button>
  </div>
</header>

<main id="top">
  <section class="hero">
    <div class="wrap">
      <p class="kicker reveal">${B.name} ${B.trade} · ${B.area}</p>
      <h1 class="reveal reveal-d1"><span>Tidy yards.</span> <span class="hl">Built to last.</span></h1>
      <div class="hero-row reveal reveal-d2">
        <p>${B.blurb}</p>
        <a class="btn" href="#contact">Free quote →</a>
      </div>
    </div>
    <div class="wrap hero-ba reveal">${compare(G.pairs[0], { start: 50, cls: "wide" })}<p class="drag">← Drag →</p></div>
  </section>

  <div class="ticker" aria-hidden="true"><div class="track">${ticker}${ticker}${ticker}${ticker}</div></div>

  <section id="proof" class="proof">
    <div class="wrap">
      <h2 class="reveal">The proof</h2>
      <div class="viewer reveal">
        <div data-stage>${compare(G.pairs[1])}</div>
        <div class="meta">
          <p class="count"><span data-n>${pad(2)}</span><small>/ ${pad(G.pairs.length)}</small></p>
          <h3 data-title>${G.pairs[1].title}</h3>
          <p data-text>${G.pairs[1].text}</p>
          <div class="nav">
            <button type="button" data-step="-1" aria-label="Previous job">←</button>
            <button type="button" data-step="1" aria-label="Next job">→</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="services" class="services">
    <div class="wrap">
      <h2 class="reveal">What we do</h2>
      <ol role="list">${G.services.map((s, i) => html`<li class="reveal">
        <span class="n">${pad(i + 1)}</span>
        <h3>${s.name}</h3>
        <p>${s.text}</p>
        <img src="${src(s.photo)}" alt="" loading="lazy">
        <a href="#contact" data-enquire="${s.name}" aria-label="Quote for ${s.name}">→</a></li>`)}</ol>
    </div>
  </section>

  <section class="promises">
    <div class="wrap grid">${G.promises.map((p, i) => html`<div class="reveal reveal-d${i}"><h3>${p.title}</h3><p>${p.text}</p></div>`)}</div>
  </section>

  <section id="how" class="how">
    <div class="wrap">
      <h2 class="reveal">How it works</h2>
      <ol role="list">${G.steps.map((s, i) => html`<li class="reveal reveal-d${i % 4}"><span>${i + 1}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}</ol>
    </div>
  </section>

  <section class="gallery" aria-label="Finished jobs">
    <div class="grid">${G.photos.map((p, n) => html`<button data-photo="${n}"><img src="${src(p.src)}" alt="${p.caption}" loading="lazy"></button>`)}</div>
  </section>

  <section id="contact" class="contact">
    <div class="wrap contact-in">
      <div class="reveal">
        <h2>Let's get your yard sorted.</h2>
        <a class="big-call" href="tel:${phone()}">${C.phone}</a>
        <p>${C.hours} · ${B.area}<br><a href="${C.facebook}" target="_blank" rel="noopener">Message us on Facebook ↗</a></p>
      </div>
      <div class="reveal reveal-d1">${quoteForm({ button: "btn btn-dark" })}</div>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <img src="${src("logo-cream.png")}" alt="">
    <p>${B.name} ${B.trade}</p>
    <p>© <span data-year></span></p>
  </div>
</footer>`;
  },
  afterRender: () => {
    const { $, pairs } = GG;
    let i = 1;
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-step]");
      if (!b) return;
      i = (i + +b.dataset.step + pairs.length) % pairs.length;
      const p = pairs[i];
      const fig = $("[data-stage] .ba");
      fig.style.setProperty("--pos", "50%");
      fig.querySelector(".ba-range").value = 50;
      fig.querySelector(".ba-before").src = `../photos/pairs/${p.slug}-before.jpg`;
      fig.querySelector(".ba-after").src = `../photos/pairs/${p.slug}-after.jpg`;
      fig.querySelector(".ba-before").alt = `${p.title}, before`;
      fig.querySelector(".ba-after").alt = `${p.title}, after`;
      fig.querySelector(".ba-range").setAttribute("aria-label", `${p.title}: drag to compare before and after`);
      $("[data-n]").textContent = String(i + 1).padStart(2, "0");
      $("[data-title]").textContent = p.title;
      $("[data-text]").textContent = p.text;
    });
  },
});
