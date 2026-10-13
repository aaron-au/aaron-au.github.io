/* Professional: serif headings, a full-bleed hero photo, olive and cream.
   Before and afters are a case-study viewer: pick a job, see it compared. */

GG.boot({
  variant: "professional",
  render: (G, { html, src, phone, compare, quoteForm }) => {
    const B = G.brand, C = G.contact;
    return html`
<header class="top" data-header>
  <div class="wrap top-in">
    <a class="brand" href="#top"><img class="on-dark" src="${src("logo-cream.png")}" alt=""><img class="on-light" src="${src("logo-olive.png")}" alt="">
      <span>${B.name}<small>${B.trade}</small></span></a>
    <nav data-nav aria-label="Main">
      <a href="#services">Services</a><a href="#projects">Projects</a><a href="#approach">Approach</a><a href="#contact">Contact</a>
    </nav>
    <a class="btn btn-line" href="tel:${phone()}">${C.phone}</a>
    <button class="menu" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span></button>
  </div>
</header>

<main id="top">
  <section class="hero" style="--hero:url('${src(G.photos[0].src)}')">
    <div class="wrap hero-in">
      <p class="eyebrow reveal">Gardening and landscaping · ${B.area}</p>
      <h1 class="reveal reveal-d1">Gardens that are <em>built properly</em> and left spotless.</h1>
      <div class="hero-foot reveal reveal-d2">
        <a class="btn btn-cream" href="#contact">Book a free on-site quote</a>
        <a class="more" href="#projects">See recent projects</a>
      </div>
    </div>
  </section>

  <section class="intro wrap">
    <h2 class="reveal">${B.blurb}</h2>
    <ul role="list" class="promises">${G.promises.map((p, i) => html`<li class="reveal reveal-d${i}"><span>0${i + 1}</span><h3>${p.title}</h3><p>${p.text}</p></li>`)}</ul>
  </section>

  <section id="services" class="services">
    <div class="wrap">
      <div class="sec-head reveal"><p class="eyebrow">Services</p><h2>Everything outside the back door</h2></div>
      <div class="cards">${G.services.map((s, i) => html`<article class="card reveal reveal-d${i % 3}">
        <div class="card-img"><img src="${src(s.photo)}" alt="" loading="lazy"></div>
        <h3>${s.name}</h3><p>${s.text}</p>
        <a href="#contact" data-enquire="${s.name}">Enquire</a></article>`)}</div>
    </div>
  </section>

  <section id="projects" class="projects">
    <div class="wrap">
      <div class="sec-head reveal"><p class="eyebrow">Recent projects</p><h2>Before and after</h2></div>
      <div class="viewer reveal">
        <ol class="picker" role="list">${G.pairs.map((p, i) => html`<li><button type="button" data-pair="${i}" aria-pressed="${i === 0}">
          <span class="n">${String(i + 1).padStart(2, "0")}</span><span class="t">${p.title}</span></button></li>`)}</ol>
        <div class="stage">
          <div data-stage>${compare(G.pairs[0])}</div>
          <div class="caption"><h3 data-stage-title>${G.pairs[0].title}</h3><p data-stage-text>${G.pairs[0].text}</p></div>
        </div>
      </div>
    </div>
  </section>

  <section id="approach" class="approach">
    <div class="wrap">
      <div class="sec-head reveal"><p class="eyebrow">Our approach</p><h2>Clear from the first call</h2></div>
      <ol role="list">${G.steps.map((s, i) => html`<li class="reveal reveal-d${i % 4}"><span>${String(i + 1).padStart(2, "0")}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}</ol>
    </div>
  </section>

  <section class="gallery wrap" aria-label="Finished work">
    <div class="sec-head reveal"><p class="eyebrow">Portfolio</p><h2>Finished work</h2></div>
    <div class="masonry">${G.photos.map((p, n) => html`<button class="reveal" data-photo="${n}"><img src="${src(p.src)}" alt="${p.caption}" loading="lazy"><span>${p.caption}</span></button>`)}</div>
  </section>

  <section id="contact" class="contact">
    <div class="wrap contact-in">
      <div class="reveal">
        <p class="eyebrow">Free quote</p>
        <h2>Let's talk about your yard</h2>
        <p class="lede">We'll visit, measure up and send a fixed written quote, usually within a couple of days.</p>
        <dl>
          <div><dt>Call</dt><dd><a href="tel:${phone()}">${C.phone}</a></dd></div>
          <div><dt>Hours</dt><dd>${C.hours}</dd></div>
          <div><dt>Service area</dt><dd>${B.area}</dd></div>
          <div><dt>Facebook</dt><dd><a href="${C.facebook}" target="_blank" rel="noopener">Send a message ↗</a></dd></div>
        </dl>
      </div>
      <div class="reveal reveal-d1">${quoteForm({ button: "btn btn-olive" })}</div>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <img src="${src("logo-cream.png")}" alt="">
    <p><strong>${B.name}</strong> ${B.trade}<br>${B.area}</p>
    <p class="copy">© <span data-year></span> ${B.name}</p>
  </div>
</footer>`;
  },
  afterRender: () => {
    const { $, $$ } = GG;
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pair]");
      if (!b) return;
      const p = GG.pairs[+b.dataset.pair];
      $$("[data-pair]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      const fig = $("[data-stage] .ba");
      fig.style.setProperty("--pos", "50%");
      fig.querySelector(".ba-range").value = 50;
      fig.querySelector(".ba-before").src = `../photos/pairs/${p.slug}-before.jpg`;
      fig.querySelector(".ba-after").src = `../photos/pairs/${p.slug}-after.jpg`;
      fig.querySelector(".ba-before").alt = `${p.title}, before`;
      fig.querySelector(".ba-after").alt = `${p.title}, after`;
      fig.querySelector(".ba-range").setAttribute("aria-label", `${p.title}: drag to compare before and after`);
      $("[data-stage-title]").textContent = p.title;
      $("[data-stage-text]").textContent = p.text;
    });
  },
});
